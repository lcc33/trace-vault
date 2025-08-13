import { io } from "socket.io-client";
const socket = io("http://localhost:5000/");
const cover = document.getElementById("cover");
const searchInput = document.getElementById("searchInput");
const filterSelect = document.getElementById("filterSelect");
const loader = document.getElementById("loader");
let allReports = [];
let currentUserId = null;

// Get current user ID for owner checks
function getCurrentUser() {
  return fetch("http://localhost:5000/api/user", { credentials: "include" })
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
  fetch("http://localhost:5000/reports", {
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
      hideLoader();
      console.error(err);
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
      <img src="${profilePic}" alt="${username}" class="profile-pic"/>
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
      <h3>${report.name}</h3>
      ${
      report.image
        ? `<img src="http://localhost:5000/uploads/${report.image}" class="item-img" alt="${report.name}" />`
        : ""
      }
      <p>Description: ${report.description || ""}</p>
      <div class="tag">Location: ${report.location || ""}</div>
      <button class="claim-btn">Claim</button>
      <div class='edit-form' style='display:none;'>
      <input type='text' class='edit-name' value='${report.name}' />
      <textarea class='edit-description'>${report.description || ""}</textarea>
      <input class='edit-location' type='text' value='${report.location || ""}' />
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
        const updatedName = card.querySelector(".edit-name").value;
        const updatedDesc = card.querySelector(".edit-description").value;
        const updatedLocation = card.querySelector(".edit-location").value;

        fetch(`http://localhost:5000/reports/${report._id}`, {
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: updatedName,
            description: updatedDesc,
            location: updatedLocation,
          }),
        })
          .then((res) => res.json())
          .then((updatedReport) => {
            report.name = updatedName;
            report.description = updatedDesc;
            report.location = updatedLocation;
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
          fetch(`http://localhost:5000/reports/${report._id}`, {
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
    const matchesSearch =
      report.name.toLowerCase().includes(searchTerm) ||
      report.description.toLowerCase().includes(searchTerm) ||
      report.location.toLowerCase().includes(searchTerm);
    const matchesCategory =
      selectedCategory === "all" || report.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });
  renderReports(filtered);
}

searchInput.addEventListener("input", filterItems);
filterSelect.addEventListener("change", filterItems);

function protectedPage() {
  const check = document.querySelector(".check");
  fetch("http://localhost:5000/api/user", {
    credentials: "include",
  })
    .then((res) => res.json())
    .then((data) => {
      if (!data.user) {
        check.innerHTML =
          "<h1>Unauthorized access denied pls <a href='/Login'>login!</a></h1>";
      }
    });
}
protectedPage();