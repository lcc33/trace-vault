const cover = document.getElementById("cover");
const searchInput = document.getElementById("searchInput");
const filterSelect = document.getElementById("filterSelect");
let allReports = [];

fetch("http://localhost:5000/reports")
  .then((res) => res.json())
  .then((data) => {
    allReports = data;
    renderReports(allReports);
  });

function renderReports(reports) {
  cover.innerHTML = "";
  reports.forEach((report) => {
    const card = document.createElement("div");
    card.classList.add("item-card");

    card.innerHTML = `
        <span class="status-mark">Unclaimed</span>
        <h3>${report.name}</h3>
        <div>
          <span class="tag">${report.category?.toUpperCase() || ""}</span>
          <span class="tag">Location: ${report.location || ""}</span>
        </div>
        <p>Description: ${report.description || ""}</p>
        <div class="tag">Contact: ${report.contact || ""}</div>
        <button class="claim-btn">Claim</button>
      `;

    cover.appendChild(card);
  });

  // Add click event for claim buttons (optional)
  // const btn = document.querySelectorAll(".claim-btn");
  document.querySelectorAll(".claim-btn").forEach((button) => {
    button.addEventListener("click", () => {
      const status = document.querySelector(".status-mark");
      status.textContent = "claimed";
      status.style.background = "#22c55e";

      // document.querySelector('.status-mark').className.replace('claimed');
    });
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
