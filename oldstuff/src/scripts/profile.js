import { API_URL } from "../config.js";
let currentUser = null;

//protect page
function protectedPage() {
  fetch(`${API_URL}/api/user`, {
    credentials: "include",
  })
    .then((res) => res.json())
    .then((data) => {
      if (!data.user) {
        location.href = "/";
      }
    });
}
protectedPage();

async function fetchProfile() {
  try {
    const loadingScreen = document.getElementById("loading-screen");
    const profileContent = document.getElementById("profile-content");
    const profileHeader = document.getElementById("profile-header");
    const reportsSection = document.getElementById("reports-section");
    const claimsSection = document.getElementById("claims-section");

    const res = await fetch(`${API_URL}/api/user`, { credentials: "include" });
    currentUser = await res.json();
    const defaultAvatar =
      "https://i.pinimg.com/736x/21/f6/fc/21f6fc4abd29ba736e36e540a787e7da.jpg";
    const profilePic = currentUser.user?.profilePic || defaultAvatar;

    loadingScreen.style.display = "none";
    profileContent.style.display = "block";

    profileHeader.innerHTML = `
          <img src="${profilePic}" alt="Avatar" class="avatar" />
          <h2>${currentUser.user.name}</h2>
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
    const claimsRes = await fetch(
      `${API_URL}/claims?ownerId=${currentUser.user._id}`,
      { credentials: "include" }
    );
    const claimsData = await claimsRes.json();
    const myClaims = claimsData.claims || [];

    if (!myClaims.length) {
      claimsSection.innerHTML = `<div class="empty-state"><h3>No Claim Requests</h3><p>No one has submitted claims for your reports yet.</p></div>`;
    } else {
      claimsSection.innerHTML = myClaims
  .map(
    (c) => `
      <div class="claim-report-card">
        <p><strong>${c.claimer.name}</strong> submitted a claim on your report</p>
        
        <div class="quoted-report">
          <p class="report-desc">${c.report.description}</p>
          ${
            c.report.image
              ? `<img src="${API_URL}/uploads/${c.report.image}" class="report-thumb" />`
              : ""
          }
        </div>

        <div class="claim-actions">
          <button class="claim-request-btn" onclick="openClaimOverlay('${c._id}', '${c.description}', '${c.image || ""}', '${c.claimer.name}')">
            Claim Request
          </button>
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
const acceptClaim = async (id) => {
  if (confirm("Accept claim?")) {
    await fetch(`${API_URL}/api/claims/${id}/accept`, {
      method: "POST",
      credentials: "include",
    });
    location.reload();
  }
};

const declineClaim = async (id) => {
  if (confirm("Decline claim?")) {
    await fetch(`${API_URL}/api/claims/${id}/decline`, {
      method: "POST",
      credentials: "include",
    });
    location.reload();
  }
};

fetchProfile();

// Setup lightbox
function setupLightbox() {
  const lightbox = document.getElementById("lightbox");
  const lightboxImg = document.getElementById("lightbox-img");
  const closeBtn = document.getElementById("lightbox-close");

  // Event delegation for all report & claim images
  document.body.addEventListener("click", (e) => {
    if (
      e.target.tagName === "IMG" &&
      e.target.closest(".report-card, .claim-card, .quoted-report")
    ) {
      lightboxImg.src = e.target.src;
      lightbox.classList.remove("hidden");
    }
  });

  closeBtn.addEventListener("click", () => {
    lightbox.classList.add("hidden");
  });

  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) {
      lightbox.classList.add("hidden");
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      lightbox.classList.add("hidden");
    }
  });
}

setupLightbox();

window.openClaimOverlay = (id, description, image, claimerName) => {
  document.getElementById("claim-overlay").classList.remove("hidden");
  document.getElementById("claimer-name").textContent = `${claimerName}’s Claim`;
  document.getElementById("claim-description").textContent = description;

  const claimImage = document.getElementById("claim-image");
  if (image) {
    claimImage.src = `${API_URL}/uploads/claims/${image}`;
    claimImage.style.display = "block";
  } else {
    claimImage.style.display = "none";
  }

  document.getElementById("accept-btn").onclick = () => acceptClaim(id);
  document.getElementById("decline-btn").onclick = () => declineClaim(id);
};

window.closeClaimOverlay = () => {
  document.getElementById("claim-overlay").classList.add("hidden");
};