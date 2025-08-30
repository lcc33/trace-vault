import { API_URL } from "../config.js";
let currentUser = null;

//protected page
function protectedPage() {
  fetch(`${API_URL}/api/user`, {
    credentials: "include",
  })
    .then((res) => res.json())
    .then((data) => {
      if (!data.user) {
        location.href = "./";
      }
    });
}
// protectedPage();

async function fetchProfile() {
  try {
    const loadingScreen = document.getElementById("loading-screen");
    const profileContent = document.getElementById("profile-content");
    const profileHeader = document.getElementById("profile-header");
    const reportsSection = document.getElementById("reports-section");
    const claimsSection = document.getElementById("claims-section");

    const res = await fetch(`${API_URL}/api/user`, { credentials: "include" });
    currentUser = await res.json();

    loadingScreen.style.display = "none";
    profileContent.style.display = "block";

    profileHeader.innerHTML = `
          <img src="${currentUser.user.profilePic}" alt="Avatar" class="avatar" />
          <h2>${currentUser.user.name}</h2>
          <p>@${currentUser.user.username}</p>
          <p>${currentUser.user.email}</p>
          <div>
            <button id="edit-profile-btn">Edit</button>
            <button id="logout-btn" class="logout-btn">Logout</button>
          </div>
        `;

    // Fetch reports (only user's)
    const reportsRes = await fetch(
      `${API_URL}/api/reports/user?userId=${currentUser.user._id}`,
      { credentials: "include" }
    );
    const myReports = await reportsRes.json();

    if (!myReports.length) {
      reportsSection.innerHTML = `<div class="empty-state"><h3>No Reports Yet</h3><p>You haven't submitted any reports.</p></div>`;
    } else {
      reportsSection.innerHTML = myReports
        .map(
          (r) => `
            <div class="report-card">
              ${r.image ? `<img src="${API_URL}/uploads/${r.image}" />` : ""}
              <p>${r.description}</p>
              <div>
                <button onclick="editReport('${r._id}')">Edit</button>
                <button class="delete-btn" onclick="deleteReport('${
                  r._id
                }')">Delete</button>
              </div>
            </div>
          `
        )
        .join("");
    }

    // Fetch claims for user's reports
    const claimsRes = await fetch(`${API_URL}/claims/report/${reportId}`, {
      credentials: "include",
    });
    const myClaims = await claimsRes.json();

    if (!myClaims.length) {
      claimsSection.innerHTML = `<div class="empty-state"><h3>No Claim Requests</h3><p>No one has submitted claims for your reports yet.</p></div>`;
    } else {
      claimsSection.innerHTML = myClaims
        .map(
          (c) => `
            <div class="claim-card">
              <p><strong>${c.user.name}</strong> (@${
            c.user.username
          }) wants to claim your report</p>
              <p>${c.description}</p>
              ${c.image ? `<img src="${API_URL}/uploads/${c.image}" />` : ""}
              <div>
                <button class="accept-btn" onclick="acceptClaim('${
                  c._id
                }')">Accept</button>
                <button class="decline-btn" onclick="declineClaim('${
                  c._id
                }')">Decline</button>
              </div>
            </div>
          `
        )
        .join("");
    }

    setupEvents();
  } catch (err) {
    console.error(err);
    document.getElementById(
      "loading-screen"
    ).innerHTML = `<p>Error loading profile.</p>`;
  }
}

function setupEvents() {
  const reportsTab = document.getElementById("tab-reports");
  const claimsTab = document.getElementById("tab-claims");
  const reportsSection = document.getElementById("reports-section");
  const claimsSection = document.getElementById("claims-section");

  reportsTab.addEventListener("click", () => {
    reportsSection.style.display = "block";
    claimsSection.style.display = "none";
    reportsTab.classList.add("active");
    claimsTab.classList.remove("active");
  });

  claimsTab.addEventListener("click", () => {
    reportsSection.style.display = "none";
    claimsSection.style.display = "block";
    reportsTab.classList.remove("active");
    claimsTab.classList.add("active");
  });

  const logoutBtn = document.getElementById("logout-btn");
  logoutBtn.addEventListener("click", async () => {
    if (confirm("Logout?")) {
      await fetch(`${API_URL}/api/logout`, {
        method: "POST",
        credentials: "include",
      });
      window.location.href = "/";
    }
  });
}

// Global actions
window.editReport = (id) => console.log("Edit report", id);
window.deleteReport = async (id) => {
  if (confirm("Delete this report?")) {
    await fetch(`${API_URL}/api/reports/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    location.reload();
  }
};
window.acceptClaim = async (id) => {
  if (confirm("Accept claim?")) {
    await fetch(`${API_URL}/api/claims/${id}/accept`, {
      method: "POST",
      credentials: "include",
    });
    location.reload();
  }
};
window.declineClaim = async (id) => {
  if (confirm("Decline claim?")) {
    await fetch(`${API_URL}/api/claims/${id}/decline`, {
      method: "POST",
      credentials: "include",
    });
    location.reload();
  }
};

fetchProfile();
