import { API_URL } from "../config.js";

const btn = document.getElementById("google-signin");
const msg = document.getElementById("redirect-msg");

btn.addEventListener("click", () => {
  btn.disabled = true;
  btn.style.opacity = 0.7;
  msg.style.display = "block";

  btn.target = "_blank";
  window.location.href = `${API_URL}/auth/google`;
});
