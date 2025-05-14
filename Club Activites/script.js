document.addEventListener("DOMContentLoaded", () => {
  loadActivities();

  document.getElementById("comment-form")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const textarea = e.target.elements.content;
    const content = textarea.value;

    const activityId = window.currentActivity?.id;
    if (!activityId) return alert("No activity selected");

    const res = await fetch("https://4399efd1-a97f-4e48-9229-329a9b6b5e93-00-1hm9s0f5r7gge.pike.replit.dev/api/comment.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ activity_id: activityId, content })
    });

    if (res.ok) {
      textarea.value = "";
      loadComments(activityId);  // Reload comments after posting a new one
    } else {
      alert("Error posting comment.");
    }
  });

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

async function loadComments(activityId) {
  const list = document.getElementById("comment-list");
  list.innerHTML = "<li>Loading comments...</li>";

  try {
    const res = await fetch(`https://4399efd1-a97f-4e48-9229-329a9b6b5e93-00-1hm9s0f5r7gge.pike.replit.dev/comment.php?activity_id=${activityId}`);
    const comments = await res.json();

    if (!Array.isArray(comments)) {
      list.innerHTML = "<li>No comments found.</li>";
      return;
    }

    list.innerHTML = "";
    comments.forEach(comment => {
      const li = document.createElement("li");
      li.textContent = comment.content;
      list.appendChild(li);
    });
  } catch (err) {
    console.error(err);
    list.innerHTML = "<li>Error loading comments.</li>";
  }
}

async function loadActivities() {
  try {
    const res = await fetch("https://4399efd1-a97f-4e48-9229-329a9b6b5e93-00-1hm9s0f5r7gge.pike.replit.dev/api/activities.php");
    if (!res.ok) throw new Error("Failed to load activities");

    let activities = await res.json();

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

function showDetails(activity) {
  window.currentActivity = activity;

  const detailDiv = document.getElementById("activity-detail");
  detailDiv.innerHTML = `
    <h2>Club Activity Details</h2>
    <p><strong>Club:</strong> ${activity.club}</p>
    <p><strong>Event:</strong> ${activity.title}</p>
    <p><strong>Date & Time:</strong> ${activity.date} at ${activity.time}</p>
    <p><strong>Location:</strong> ${activity.location}</p>
    <p><strong>Description:</strong> ${activity.description}</p>

    <div class="card-buttons">
      <button id="edit-btn">Edit</button>
      <button id="delete-btn" style="background-color: #e74c3c; color: white;">Delete</button>
    </div>

    <hr>

    <h3>Comments</h3>
    <ul id="comment-list"></ul>

    <form id="comment-form">
      <input type="text" id="comment-input" placeholder="Write a comment..." required />
      <button type="submit">Add Comment</button>
    </form>
  `;

  loadComments(activity.id); // Load existing comments
}
