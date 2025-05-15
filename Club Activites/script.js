document.addEventListener("DOMContentLoaded", () => {
  loadActivities();

  document.querySelector("form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    const editingId = form.dataset.editingId;
    if (editingId) data.id = editingId;

    const method = editingId ? "PUT" : "POST";

    try {
      const res = await fetch("https://4399efd1-a97f-4e48-9229-329a9b6b5e93-00-1hm9s0f5r7gge.pike.replit.dev/api/activities.php", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });

      if (res.ok) {
        form.reset();
        delete form.dataset.editingId;
        loadActivities();
      } else {
        const error = await res.json();
        alert(`Failed to save activity: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error("Error in submitting activity:", error);
      alert("An error occurred while saving the activity.");
    }
  });

  // Edit button for activity detail view
  document.querySelector("#detail .card-buttons button:first-child")?.addEventListener("click", () => {
    if (!window.currentActivity) return;

    const form = document.querySelector("form");
    form.club.value = window.currentActivity.club;
    form.title.value = window.currentActivity.title;
    form.date.value = window.currentActivity.date;
    form.time.value = window.currentActivity.time;
    form.location.value = window.currentActivity.location;
    form.description.value = window.currentActivity.description;

    form.dataset.editingId = window.currentActivity.id;
    document.getElementById("create").scrollIntoView({ behavior: "smooth" });
  });

  // Delete button in activity detail view
  document.querySelector("#detail .card-buttons button:last-child")?.addEventListener("click", () => {
    if (window.currentActivity) {
      deleteActivity(window.currentActivity.id);
    }
  });
});

async function loadActivities() {
  try {
    const res = await fetch("https://4399efd1-a97f-4e48-9229-329a9b6b5e93-00-1hm9s0f5r7gge.pike.replit.dev/api/activities.php");
    if (!res.ok) {
      throw new Error('Failed to load activities');
    }
    const activities = await res.json();

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

    // Add event listeners for the 'View Details' buttons
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

function showDetails(activity) {
    // Fill in the fields
    document.getElementById("club-name").textContent = activity.club;
    document.getElementById("event-title").textContent = activity.title;
    document.getElementById("event-date-time").textContent = `${activity.date} at ${activity.time}`;
    document.getElementById("event-location").textContent = activity.location;
    document.getElementById("event-description").textContent = activity.description;
  
    // Attach edit/delete functionality here if needed
    document.getElementById("edit-button").onclick = () => editActivity(activity);
    document.getElementById("delete-button").onclick = () => deleteActivity(activity.id);
  
    // Load comments
    loadComments(activity.id);
  
    // Add comment submission
    const commentForm = document.getElementById("comment-form");
    commentForm.onsubmit = async (e) => {
      e.preventDefault();
      const comment = document.getElementById("comment").value.trim();
      if (!comment) return;
      await fetch(`/api/activities/${activity.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comment }),
      });
      document.getElementById("comment").value = "";
      loadComments(activity.id);
    };
  

  loadComments(activity.id);
  document.getElementById("detail").scrollIntoView({ behavior: "smooth" });
  }



async function loadComments(activityId) {
  const res = await fetch(`https://4399efd1-a97f-4e48-9229-329a9b6b5e93-00-1hm9s0f5r7gge.pike.replit.dev/comment.php?activity_id=${activityId}`);
  const comments = await res.json();
  const container = document.getElementById("comments-container");
  container.innerHTML = comments.map(c => `
    <div class="comment">
      <strong>${c.name}</strong> <em>${new Date(c.created_at).toLocaleString()}</em>
      <p>${c.comment}</p>
    </div>
  `).join('');
}

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

async function deleteActivity(id) {
  if (!confirm("Are you sure you want to delete this activity?")) return;

  try {
    const res = await fetch("https://4399efd1-a97f-4e48-9229-329a9b6b5e93-00-1hm9s0f5r7gge.pike.replit.dev/api/activities.php", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id })  
    });    

    if (res.ok) {
      alert("Activity deleted successfully.");
      document.getElementById("detail").style.scrollBehavior = "auto";
      document.getElementById("detail").scrollIntoView({ block: "start" });
      loadActivities();
      console.log("Deleting activity ID:", id);
    } else {
      const error = await res.json();
      console.error("Server responded with error:", error); 
      alert(`Failed to delete activity: ${error.error || 'Unknown error'}`);
    }
  } catch (err) {
    console.error("Network or parsing error:", err); 
    alert("An error occurred while deleting the activity.");
  }
}



document.getElementById("searchInput")?.addEventListener("input", loadActivities);
document.getElementById("filterClub")?.addEventListener("change", loadActivities);
document.getElementById("sortSelect")?.addEventListener("change", loadActivities);

