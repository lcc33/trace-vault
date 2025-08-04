import { io } from "socket.io-client";
const socket = io("http://localhost:5000/");
const cover = document.getElementById("cover");
const searchInput = document.getElementById("searchInput");
const filterSelect = document.getElementById("filterSelect");
let allReports = [];

socket.on("connect", () => {
  console.log("connected to socket.io");
});

fetch("http://localhost:5000/reports", {
  method: "GET",
  credentials: "include",
})
  .then((res) => {
    if (!res.ok) throw new Error("Failed to fetch reports");
    return res.json();
  })
  .then((reports) => {
    if (!Array.isArray(reports)) {
      console.error("Expected array but got:", reports);
      return;
    }
    allReports = reports;
    renderReports(allReports);
  })
  .catch((err) => console.error(err));

socket.on("newReport", (newReport) => {
  // console.log("new report recieved:", newReport);
  allReports.unshift(newReport);
  renderReports(allReports);
});

function renderReports(reports) {
  cover.innerHTML = "";
  if (!Array.isArray(reports)) {
    console.warn("renderReports expected array, got:", reports);
    return;
  }

  reports.forEach((report) => {
    const card = document.createElement("div");
    card.classList.add("item-card");

    const username = report.user?.name || "Anonymous";
    const profilePic =
      report.user?.profilePic ||
      "https://static.vecteezy.com/system/resources/previews/032/176/197/non_2x/business-avatar-profile-black-icon-man-of-user-symbol-in-trendy-flat-style-isolated-on-male-profile-people-diverse-face-for-social-network-or-web-vector.jpg"; // put default image in public folder

    card.innerHTML = `
      <div class="user-header">
        <img src="${profilePic}" alt="${username}" class="profile-pic"/>
        <span class="username">${username}</span>
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

    const claimBtn = card.querySelector(".claim-btn");
    claimBtn.addEventListener("click", () => {
      claimBtn.textContent = "Claimed";
      claimBtn.disabled = true;
      claimBtn.style.background = "red";
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

// Function to check if user is authenticated
function protectedPage() {
  const check = document.querySelector(".check");
  fetch("http://localhost:5000/api/user", {
    credentials: "include",
  })
    .then((res) => res.json())
    .then((data) => {
      if (!data.user) {
        check.innerHTML = "<h1>Unauthorized access denied pls login!</h1>";
      } else {
        console.log(`Logged in user: ,${data.user}`);
      }
    })
    .catch((err) => console.log(err));
}
protectedPage();
