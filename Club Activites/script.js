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
        <button onclick="deleteActivity(${activity.id})">Delete</button>
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
  window.currentActivity = activity;

  const detailDiv = document.getElementById("activity-detail");
  detailDiv.innerHTML = `
    <p><strong>Club:</strong> ${activity.club}</p>
    <p><strong>Event:</strong> ${activity.title}</p>
    <p><strong>Date & Time:</strong> ${activity.date} at ${activity.time}</p>
    <p><strong>Location:</strong> ${activity.location}</p>
    <p><strong>Description:</strong> ${activity.description}</p>
  `;

  document.getElementById("detail").scrollIntoView({ behavior: "smooth" });
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
      loadActivities();
      document.getElementById("activity-detail").innerHTML = "";
      window.currentActivity = null;
    } else {
      const error = await res.json();
      alert(`Failed to delete activity: ${error.error || 'Unknown error'}`);
    }
  } catch (err) {
    console.error("Error deleting activity:", err);
    alert("An error occurred while deleting the activity.");
  }
}
