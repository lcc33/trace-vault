

const localServer = "http://localhost:5000/";
const hostedServerUrl = "https://trace-vault.onrender.com/";
// if (deleteBtn) {
//       deleteBtn.addEventListener("click", () => {
//         const confirmDelete = window.confirm(
//           "Are you sure you want to delete this report?"
//         );
//         if (confirmDelete) {
//           fetch(`${serverUrl}${report._id}`, {
//             method: "DELETE",
//             credentials: "include",
//           })}

//protected page
function protectedPage() {
  const check = document.querySelector(".check");
  fetch(`${localServer}api/user`, {
    credentials: "include",
  })
    .then((res) => res.json())
    .then((data) => {
      if (!data.user) {
        location.href = "./";
      }
    });
}
protectedPage();

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

  fetch(`${hostedServerUrl}api/report`, {
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
const socket = io(hostedServerUrl);
const cover = document.getElementById("cover");
const searchInput = document.getElementById("searchInput");
const filterSelect = document.getElementById("filterSelect");
const loader = document.getElementById("loader");
let allReports = [];
let currentUserId = null;

// Get current user ID for owner checks
function getCurrentUser() {
  return(`${hostedServerUrl}api/user`, { credentials: "include" })
    .then((res) => res.json())
    .then((data) => {
      currentUserId = data.user?._id || null;
    });
}

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
  fetch(`${hostedServerUrl}reports`, {
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

function renderReports(reports) {
  cover.innerHTML = "";
  reports.forEach((report) => {
    const card = document.createElement("div");
    card.classList.add("item-card");

    const username = report.user?.name || "Anonymous";
    const profilePic = report.user?.profilePic || "default-avatar-url";
    const isOwner = currentUserId && report.user?._id === currentUserId;

    card.innerHTML = `
      <div class="user-header">
        <img src="${profilePic}"   alt="" class="profile-pic"/>
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
          ? `<img src="${hostedServerUrl}uploads/${report.image}" class="item-img" alt="${report.description}" />`
          : ""
      }
      <p>${report.description || ""}</p>
      
      ${!isOwner ? `<button class="claim-btn">Claim</button>` :  ""}
      <div class='edit-form' style='display:none;'>
        
        <textarea class='edit-description'>${
          report.description || ""
        }</textarea>
       
        <button class='save-edit'>Save Changes</button>
        <button class='cancel-edit'>Cancel</button>
      </div>
    `;

    // Owner actions
    const editBtn = card.querySelector(".edit-btn");
    const editForm = card.querySelector(".edit-form");
    const saveEdit = card.querySelector(".save-edit");
    const cancelEdit = card.querySelector(".cancel-edit");
    const deleteBtn = card.querySelector(".delete-btn");

    if (editBtn && editForm && saveEdit && cancelEdit) {
      editBtn.addEventListener("click", () => {
        editForm.style.display = "block";
      });

      cancelEdit.addEventListener("click", () => {
        editForm.style.display = "none";
      });

      saveEdit.addEventListener("click", () => {
        const updatedDesc = card.querySelector(".edit-description").value;

        fetch(`${hostedServerUrl}reports/${report._id}`, {
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
            showActionPopup("Changes saved!", true);
          })
          .catch((err) => {
            console.error("error saving edit:", err);
            showActionPopup("Failed to save changes.", false);
          });
      });
    }

    if (deleteBtn) {
      deleteBtn.addEventListener("click", () => {
        const confirmDelete = window.confirm(
          "Are you sure you want to delete this report?"
        );
        if (confirmDelete) {
          fetch(`${hostedServerUrl}reports/${report._id}`, {
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
        claimBtn.textContent = "Claimed";
        claimBtn.disabled = true;
      });
    }

    cover.append(card);
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
