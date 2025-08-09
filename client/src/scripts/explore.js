import { io } from "socket.io-client";
const socket = io("http://localhost:5000/");
const cover = document.getElementById("cover");
const searchInput = document.getElementById("searchInput");
const filterSelect = document.getElementById("filterSelect");
const loader = document.getElementById("loader");
let allReports = [];

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

socket.on("newReport", (newReport) => {
  allReports.unshift(newReport);
  renderReports(allReports);
});

function renderReports(reports) {
  cover.innerHTML = "";
  reports.forEach((report) => {
    const card = document.createElement("div");
    card.classList.add("item-card");

    const username = report.user?.name || "Anonymous";
    const profilePic = report.user?.profilePic || "default-avatar-url";

    const isOwner = report.isOwner; // Set this on the backend response

    card.innerHTML = `
          <div class="user-header">
            <img src="${profilePic}" alt="${username}" class="profile-pic"/>
            <span class="username">${username}</span>
            ${
              isOwner
                ? `<div class="menu">⋮
              <button class="edit-btn" data-id="${report._id}">Edit</button>
    <button class="delete-btn" data-id="${report._id}">Delete</button>
            </div>`
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
        `;

    card.querySelector(".claim-btn").addEventListener("click", () => {
      card.querySelector(".claim-btn").textContent = "Claimed";
      card.querySelector(".claim-btn").disabled = true;
    });

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



document.addEventListener("click", (e) => {
  if (e.target.classList.contains("edit-btn")) {
    const id = e.target.dataset.id;
    const card = e.target.closest(".report-card");

    const title = card.querySelector("h3").textContent;
    const description = card.querySelector("p").textContent;

    const form = document.createElement("form");
    form.innerHTML = `
      <input type="text" name="title" value="${title}" />
      <textarea name="description">${description}</textarea>
      <button type="submit">Save</button>
    `;

    card.innerHTML = "";
    card.appendChild(form);

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const updatedTitle = form.title.value;
      const updatedDesc = form.description.value;

      const res = await fetch(`/reports/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title: updatedTitle, description: updatedDesc }),
      });

      if (res.ok) {
        card.innerHTML = `
          <h3>${updatedTitle}</h3>
          <p>${updatedDesc}</p>
          <button class="edit-btn" data-id="${id}">Edit</button>
          <button class="delete-btn" data-id="${id}">Delete</button>
        `;
      } else {
        alert("Update failed");
      }
    });
  }
});


document.addEventListener("click", async (e) => {
  if (e.target.classList.contains("delete-btn")) {
    const id = e.target.dataset.id;
    if (confirm("Are you sure you want to delete this report?")) {
      const res = await fetch(`/reports/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (res.ok) {
        e.target.closest(".report-card").remove();
      } else {
        alert("Failed to delete report.");
      }
    }
  }
});
