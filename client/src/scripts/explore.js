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
      <span class="status-mark">Available</span>
      <h3>${report.name}</h3>
      <div>
        <span class="tag">${report.category?.toUpperCase() || ""}</span>
        <span class="tag">Location: ${report.location || ""}</span>
      </div>
      ${report.image ? `<img src="http://localhost:5000/uploads/${report.image}" class="item-img" alt="${report.name}" />` : ""}
      <p>Description: ${report.description || ""}</p>
      <div class="tag">Contact: ${report.contact || ""}</div>
      <button class="claim-btn">Claim</button>
    `;

    
    const claimBtn = card.querySelector(".claim-btn");
    const statusMark = card.querySelector(".status-mark");
    claimBtn.addEventListener("click", () => {
      claimBtn.textContent = "Claimed";
      claimBtn.disabled = true;
      statusMark.textContent = "Claimed";
      statusMark.classList.add("claimed");
    });

    cover.appendChild(card);
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