import { API_URL } from "../config.js";

async function getCurrentUser() {
  try {
    const res = await fetch(`${API_URL}/api/user`, { credentials: "include" });
    if (!res.ok) throw new Error("Failed to fetch user");
    const data = await res.json();
    if (!data.user) {
      location.href = "/"; // or "./" if you prefer
    }
    currentUserId = data.user._id;
    setCurrentUserAvatar(data.user);
  } catch (err) {
    console.error("Auth error:", err);
    location.href = "/";
  }
}

function setCurrentUserAvatar(user) {
  const avatarDiv = document.querySelector(".avatar");
  if (avatarDiv) {
    const profilePic =
      user?.profilePic || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png";
    avatarDiv.innerHTML = `<img src="${profilePic}" alt="Profile" class="avatar-img" />`;
  }
}


// Report form logic
const reportForm = document.getElementById("reportForm");
const popup = document.getElementById("popup");

function showPopup(message, success = true) {
  popup.textContent = message;
  popup.className = "popup " + (success ? "success" : "error");
  popup.style.display = "block";
  setTimeout(() => {
    popup.style.display = "none";
  }, 2500);
}

reportForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const formData = new FormData(reportForm);

  fetch(`${API_URL}/api/reports`, {
    method: "POST",
    body: formData,
    credentials: "include",
  })
    .then((res) => res.json())
    .then((data) => {
      if (
        data &&
        data.message &&
        data.message.toLowerCase().includes("success")
      ) {
        showPopup("Report sent successfully!", true);
        reportForm.reset();
        const imageNameSpan = document.getElementById("selectedImageName");
        if (imageNameSpan) {
          imageNameSpan.textContent = "";
        }
      } else {
        showPopup("Failed to send report.", false);
      }
    })
    .catch((err) => {
      showPopup("Failed to send report.", false);
      console.error(err);
    });
});

//feed logic
import { io } from "socket.io-client";
const socket = io(API_URL);
const cover = document.getElementById("cover");
const searchInput = document.getElementById("searchInput");
const filterSelect = document.getElementById("filterSelect");
const loader = document.getElementById("loader");
let allReports = [];
let currentUserId = null;

socket.on("connect", () => {
  console.log("connected to socket.io");
});




function showLoader() {
  loader.style.display = "block";
}
function hideLoader() {
  loader.style.display = "none";
}

showLoader();

getCurrentUser().then(() => {
  fetch(`${API_URL}/api/reports`, {
    method: "GET",
    credentials: "include",
  })
    .then((res) => res.json())
    .then((reports) => {
      hideLoader();
      allReports = reports;
      renderReports(allReports);
    })
    .catch((err) => {
      console.error(err);
      hideLoader();
    });
});

socket.on("newReport", (newReport) => {
  allReports.unshift(newReport);
  renderReports(allReports);
});

// Add popup markup to the page
if (!document.getElementById("action-popup")) {
  const popupDiv = document.createElement("div");
  popupDiv.id = "action-popup";
  popupDiv.className = "action-popup";
  document.body.appendChild(popupDiv);
}

// Popup function
function showActionPopup(message, success = true) {
  const popup = document.getElementById("action-popup");
  popup.textContent = message;
  popup.className = "action-popup " + (success ? "success" : "error");
  popup.style.opacity = "1";
  popup.style.transform = "translateY(0)";
  popup.style.pointerEvents = "auto";
  setTimeout(() => {
    popup.style.opacity = "0";
    popup.style.transform = "translateY(-40px)";
    popup.style.pointerEvents = "none";
  }, 2000);
}

// Modal management functions
function createModalOverlay() {
  const overlay = document.createElement("div");
  overlay.className = "modal-overlay";
  overlay.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h3 class="modal-title"></h3>
        <button class="modal-close" aria-label="Close">×</button>
      </div>
      <div class="modal-body"></div>
    </div>
  `;
  document.body.appendChild(overlay);
  return overlay;
}

function showModal(overlay) {
  document.body.style.overflow = "hidden";
  overlay.classList.add("active");
}

function hideModal(overlay) {
  document.body.style.overflow = "";
  overlay.classList.remove("active");
  setTimeout(() => {
    if (overlay.parentNode) {
      overlay.parentNode.removeChild(overlay);
    }
  }, 300);
}

function createEditModal(report, onSave) {
  const overlay = createModalOverlay();
  const title = overlay.querySelector(".modal-title");
  const body = overlay.querySelector(".modal-body");
  const closeBtn = overlay.querySelector(".modal-close");

  title.textContent = "Edit Report";
  body.innerHTML = `
    <div class="edit-form-modal">
      <textarea class="edit-description" placeholder="Describe what you found or lost...">${
        report.description || ""
      }</textarea>
      <div class="modal-actions">
        <button class="cancel-edit">Cancel</button>
        <button class="save-edit">Save Changes</button>
      </div>
    </div>
  `;

  const textarea = body.querySelector(".edit-description");
  const saveBtn = body.querySelector(".save-edit");
  const cancelBtn = body.querySelector(".cancel-edit");

  // Auto-focus and select all text
  setTimeout(() => {
    textarea.focus();
    textarea.select();
  }, 100);

  // Handle save
  saveBtn.addEventListener("click", () => {
    const updatedDesc = textarea.value.trim();
    if (!updatedDesc) {
      showActionPopup("Please enter a description", false);
      return;
    }

    saveBtn.disabled = true;
    saveBtn.textContent = "Saving...";

    onSave(updatedDesc)
      .then(() => {
        hideModal(overlay);
        showActionPopup("Changes saved!", true);
      })
      .catch((err) => {
        console.error("Error saving edit:", err);
        showActionPopup("Failed to save changes.", false);
        saveBtn.disabled = false;
        saveBtn.textContent = "Save Changes";
      });
  });

  // Handle cancel
  const handleCancel = () => hideModal(overlay);
  cancelBtn.addEventListener("click", handleCancel);
  closeBtn.addEventListener("click", handleCancel);

  // Handle overlay click
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) {
      handleCancel();
    }
  });

  // Handle escape key
  const handleEscape = (e) => {
    if (e.key === "Escape") {
      handleCancel();
      document.removeEventListener("keydown", handleEscape);
    }
  };
  document.addEventListener("keydown", handleEscape);

  showModal(overlay);
}

function createClaimModal(report, onSubmit) {
  const overlay = createModalOverlay();
  const title = overlay.querySelector(".modal-title");
  const body = overlay.querySelector(".modal-body");
  const closeBtn = overlay.querySelector(".modal-close");

  title.textContent = "Claim This Item";
  body.innerHTML = `
    <div class="claim-form-modal">
      <div class="form-group">
        <label class="form-label">Describe your item and how/where you lost it</label>
        <textarea class="claim-description" placeholder="Please provide details about your item, when and where you lost it, and any identifying features..." required></textarea>
      </div>
      
      <div class="form-group">
        <label class="form-label">Upload proof of ownership</label>
        <div class="file-upload-wrapper">
          <label class="file-upload-label" for="claim-image-input">
            <svg class="file-upload-icon" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd" />
            </svg>
            <div class="file-upload-text">
              <div>Click to upload an image</div>
              <div style="font-size: 0.8rem; opacity: 0.7; margin-top: 4px;">PNG, JPG up to 10MB</div>
            </div>
          </label>
          <input type="file" id="claim-image-input" class="claim-image" accept="image/*" required />
        </div>
      </div>
      
      <div class="modal-actions">
        <button class="cancel-claim">Cancel</button>
        <button class="submit-claim">Submit Claim</button>
      </div>
    </div>
  `;

  const textarea = body.querySelector(".claim-description");
  const fileInput = body.querySelector(".claim-image");
  const fileLabel = body.querySelector(".file-upload-label");
  const fileText = body.querySelector(".file-upload-text");
  const submitBtn = body.querySelector(".submit-claim");
  const cancelBtn = body.querySelector(".cancel-claim");

  // Handle file selection
  fileInput.addEventListener("change", () => {
    if (fileInput.files[0]) {
      fileLabel.classList.add("has-file");
      fileText.innerHTML = `
        <div>✓ ${fileInput.files[0].name}</div>
        <div style="font-size: 0.8rem; opacity: 0.7; margin-top: 4px;">Click to change</div>
      `;
    } else {
      fileLabel.classList.remove("has-file");
      fileText.innerHTML = `
        <div>Click to upload an image</div>
        <div style="font-size: 0.8rem; opacity: 0.7; margin-top: 4px;">PNG, JPG up to 10MB</div>
      `;
    }
  });

  // Auto-focus textarea
  setTimeout(() => {
    textarea.focus();
  }, 100);

  // Handle submit
  submitBtn.addEventListener("click", () => {
    const description = textarea.value.trim();
    if (!description || !fileInput.files[0]) {
      showActionPopup("Please fill all fields and upload an image", false);
      return;
    }

    submitBtn.disabled = true;
    submitBtn.classList.add("loading");

    const formData = new FormData();
    formData.append("description", description);
    formData.append("image", fileInput.files[0]);

    onSubmit(formData)
      .then(() => {
        hideModal(overlay);
        showActionPopup("Claim submitted!", true);
      })
      .catch((err) => {
        console.error("Error submitting claim:", err);
        showActionPopup("Error submitting claim", false);
        submitBtn.disabled = false;
        submitBtn.classList.remove("loading");
      });
  });

  // Handle cancel
  const handleCancel = () => hideModal(overlay);
  cancelBtn.addEventListener("click", handleCancel);
  closeBtn.addEventListener("click", handleCancel);

  // Handle overlay click
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) {
      handleCancel();
    }
  });

  // Handle escape key
  const handleEscape = (e) => {
    if (e.key === "Escape") {
      handleCancel();
      document.removeEventListener("keydown", handleEscape);
    }
  };
  document.addEventListener("keydown", handleEscape);

  showModal(overlay);
}

function renderReports(reports) {
  cover.innerHTML = "";
  reports.forEach((report) => {
    const card = document.createElement("div");
    card.classList.add("item-card");

    const defaultAvatar =
      "https://i.pinimg.com/736x/21/f6/fc/21f6fc4abd29ba736e36e540a787e7da.jpg";
    const username = report.user?.name || "Anonymous";
    const profilePic = report.user?.profilePic || defaultAvatar;
    const isOwner = currentUserId && report.user?._id === currentUserId;

    card.innerHTML = `
      <div class="user-header">
        <img src="${profilePic}" alt="" class="profile-pic"/>
        <span class="username">${username}</span>
        ${
          isOwner
            ? `<span class='actions'>
                <img src='https://cdn-icons-png.flaticon.com/128/1828/1828911.png' class='edit-btn' data-id='${report._id}' title='Edit'/>
                <img src='https://cdn-icons-png.flaticon.com/128/3405/3405244.png' class='delete-btn' data-id='${report._id}' title='Delete'/>
              </span>`
            : ""
        }
      </div>
      
      ${
        report.image
          ? `<img src="${API_URL}/uploads/${report.image}" class="item-img" alt="${report.description}" />`
          : ""
      }
      <p>${report.description || ""}</p>
      
      ${!isOwner ? `<button class="claim-btn">Claim</button>` : ""}
    `;

    // Owner actions
    const editBtn = card.querySelector(".edit-btn");
    const deleteBtn = card.querySelector(".delete-btn");

    if (editBtn) {
      editBtn.addEventListener("click", () => {
        createEditModal(report, (updatedDesc) => {
          return fetch(`${API_URL}/api/reports/${report._id}`, {
            method: "PUT",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              description: updatedDesc,
            }),
          })
            .then((res) => res.json())
            .then((updatedReport) => {
              report.description = updatedDesc;
              renderReports(allReports);
            });
        });
      });
    }

    if (deleteBtn) {
      deleteBtn.addEventListener("click", () => {
        const confirmDelete = window.confirm(
          "Are you sure you want to delete this report?"
        );
        if (confirmDelete) {
          fetch(`${API_URL}/api/reports/${report._id}`, {
            method: "DELETE",
            credentials: "include",
          })
            .then((res) => res.json())
            .then(() => {
              allReports = allReports.filter((r) => r._id !== report._id);
              renderReports(allReports);
              showActionPopup("Report deleted!", true);
            })
            .catch((err) => {
              console.error("Error deleting report:", err);
              showActionPopup("Failed to delete report.", false);
            });
        }
      });
    }

    // Claim button
    const claimBtn = card.querySelector(".claim-btn");
    if (claimBtn) {
      claimBtn.addEventListener("click", () => {
        createClaimModal(report, (formData) => {
          return fetch(`${API_URL}/claims/${report._id}`, {
            method: "POST",
            body: formData,
            credentials: "include",
          })
            .then((res) => res.json())
            .then((data) => {
              if (data.success) {
                claimBtn.textContent = "Pending";
                claimBtn.disabled = true;
              } else {
                throw new Error("Failed to submit claim");
              }
            });
        });
      });
    }

    cover.appendChild(card);
  });
}

function filterItems() {
  const searchTerm = searchInput.value.toLowerCase();
  const selectedCategory = filterSelect.value;
  const filtered = allReports.filter((report) => {
    const matchesSearch = report.description.toLowerCase().includes(searchTerm);
    const matchesCategory =
      selectedCategory === "all" || report.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });
  renderReports(filtered);
}

searchInput.addEventListener("input", filterItems);
filterSelect.addEventListener("change", filterItems);
