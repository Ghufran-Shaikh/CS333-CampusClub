async function loadActivities() {
  try {
    const res = await fetch("https://4399efd1-a97f-4e48-9229-329a9b6b5e93-00-1hm9s0f5r7gge.pike.replit.dev/api/activities.php");
    if (!res.ok) throw new Error("Failed to load activities");

    let activities = await res.json();

    // 🎯 Populate club filter dynamically
    const filterSelect = document.getElementById("filterClub");
    if (filterSelect && filterSelect.options.length <= 1) {
      const clubs = [...new Set(activities.map(a => a.club))];
      clubs.forEach(club => {
        const option = document.createElement("option");
        option.value = club;
        option.textContent = club;
        filterSelect.appendChild(option);
      });
    }

    // 🔍 Search
    const searchText = document.getElementById("searchInput")?.value.toLowerCase() || "";
    if (searchText) {
      activities = activities.filter(act =>
        act.title.toLowerCase().includes(searchText)
      );
    }

    // 📌 Filter
    const selectedClub = filterSelect?.value || "";
    if (selectedClub) {
      activities = activities.filter(act => act.club === selectedClub);
    }

    // ↕️ Sort
    const sortOption = document.getElementById("sortSelect")?.value || "";
    if (sortOption === "title") {
      activities.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortOption === "date") {
      activities.sort((a, b) => new Date(a.date) - new Date(b.date));
    }

    const container = document.querySelector(".activity-list");
    container.innerHTML = "";

    activities.forEach(activity => {
      const card = document.createElement("div");
      card.className = "activity-card";
      card.innerHTML = `
        <h2>${activity.title}</h2>
        <p class="subdued-text">${activity.club} | ${activity.date} • ${activity.time} | ${activity.location}</p>
        <p>${activity.description}</p>
        <button class="view-btn" data-id='${activity.id}'>View Details</button>
      `;
      container.appendChild(card);
    });

    document.querySelectorAll(".view-btn").forEach(btn => {
      btn.addEventListener("click", async () => {
        const id = btn.dataset.id;
        const activity = activities.find(a => a.id == id);
        showDetails(activity);
      });
    });

  } catch (err) {
    console.error("Error:", err);
    alert("Failed to load activities.");
  }
}
