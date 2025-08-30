import { API_URL } from "../config.js";

  // Highlight active nav link based on current path
  const path = window.location.pathname;
  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.remove('active');
  });
  if (path === "/home" || path === "/") {
    document.getElementById("nav-home").classList.add("active");
  } else if (path.startsWith("/notifications")) {
    document.getElementById("nav-notifications").classList.add("active");
  } else if (path.startsWith("/profile")) {
    document.getElementById("nav-profile").classList.add("active");
  }

  // Logout functionality
  const logoutBtn = document.getElementById('logoutBtn');
  logoutBtn?.addEventListener('click', async () => {
    try {
      const response = await fetch('http://localhost:5000/api/logout', {
        method: 'POST',
        credentials: 'include',
      });
      if (response.ok) {
        window.location.href = './';
      } else {
        console.error('Logout failed');
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  });

  function setCurrentUserAvatar() {
  fetch(`${API_URL}/api/user`, { credentials: "include" })
    .then((res) => res.json())
    .then((data) => {
      const avatarDiv = document.getElementById("img");
      if (avatarDiv) {
        const profilePic = data.user?.profilePic || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png";
        avatarDiv.src = profilePic;
      }
    });
}

document.addEventListener("DOMContentLoaded", setCurrentUserAvatar);