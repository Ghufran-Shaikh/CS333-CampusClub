// Global variables
let activities = [];
let filteredActivities = [];
let currentPage = 1;
const itemsPerPage = 4;

// DOM Elements
const activityList = document.querySelector('.activity-list');
const searchInput = document.querySelector('.filters input[type="text"]');
const paginationSection = document.querySelector('.pagination');
const form = document.querySelector('#activity-form');

// Fetch activities on load
document.addEventListener('DOMContentLoaded', () => {
  fetchActivities();
});

// Fetch activities from backend
async function fetchActivities() {
  activityList.innerHTML = "<p>Loading activities...</p>";

  try {
    const response = await fetch('https://4399efd1-a97f-4e48-9229-329a9b6b5e93-00-1hm9s0f5r7gge.pike.replit.dev/api/activities.php');
    const data = await response.json();

    activities = data;
    filteredActivities = [...activities];
    renderActivities();
    renderPagination();
  } catch (error) {
    console.error(error);
    activityList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
  }
}

// Render activity cards
function renderActivities() {
  activityList.innerHTML = "";

  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedActivities = filteredActivities.slice(startIndex, startIndex + itemsPerPage);

  if (paginatedActivities.length === 0) {
    activityList.innerHTML = "<p>No activities found.</p>";
    return;
  }

  paginatedActivities.forEach(activity => {
    const card = document.createElement('div');
    card.className = 'activity-card';
    card.innerHTML = `
      <h2>${activity.title}</h2>
      <p class="subdued-text">${activity.date} • ${activity.location}</p>
      <p class="activity-description">${activity.description}</p>
      <div class="card-buttons">
        <button onclick="handleEdit(${activity.id})">Edit</button>
        <button onclick="handleDelete(${activity.id})" style="background-color: #dc3545;">Delete</button>
      </div>
    `;
    activityList.appendChild(card);
  });
}

// Pagination
function renderPagination() {
  paginationSection.innerHTML = `
    <button onclick="prevPage()">Prev</button>
    <span>Page ${currentPage} of ${Math.ceil(filteredActivities.length / itemsPerPage)}</span>
    <button onclick="nextPage()">Next</button>
  `;
}

function prevPage() {
  if (currentPage > 1) {
    currentPage--;
    renderActivities();
    renderPagination();
  }
}

function nextPage() {
  if (currentPage < Math.ceil(filteredActivities.length / itemsPerPage)) {
    currentPage++;
    renderActivities();
    renderPagination();
  }
}

// Real-time search
searchInput.addEventListener('input', () => {
  const query = searchInput.value.trim().toLowerCase();
  filteredActivities = query
    ? activities.filter(activity =>
        activity.title.toLowerCase().includes(query) ||
        activity.description.toLowerCase().includes(query)
      )
    : [...activities];

  currentPage = 1;
  renderActivities();
  renderPagination();
});

// Handle delete
async function handleDelete(id) {
  if (!confirm("Are you sure you want to delete this activity?")) return;

  try {
    const response = await fetch('https://4399efd1-a97f-4e48-9229-329a9b6b5e93-00-1hm9s0f5r7gge.pike.replit.dev/api/activities.php', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    });

    const result = await response.json();
    alert(result.message || "Deleted");

    fetchActivities();
  } catch (error) {
    console.error("Delete error:", error);
    alert("Failed to delete activity.");
  }
}

// Handle edit (prefill form)
function handleEdit(id) {
  const activity = activities.find(a => a.id === id);
  if (!activity) return;

  form.club.value = activity.club;
  form.title.value = activity.title;
  form.date.value = activity.date;
  form.time.value = activity.time;
  form.location.value = activity.location;
  form.description.value = activity.description;
  form.dataset.editId = activity.id;
}

// Handle form submit (edit or add)
form.addEventListener('submit', async function (e) {
  e.preventDefault();

  const payload = {
    club: form.club.value,
    title: form.title.value,
    date: form.date.value,
    time: form.time.value,
    location: form.location.value,
    description: form.description.value
  };

  const editId = form.dataset.editId;
  const method = editId ? 'PUT' : 'POST';

  if (editId) payload.id = editId;

  try {
    const response = await fetch('https://4399efd1-a97f-4e48-9229-329a9b6b5e93-00-1hm9s0f5r7gge.pike.replit.dev/api/activities.php', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    alert(result.message || "Saved");

    form.reset();
    delete form.dataset.editId;
    fetchActivities();
  } catch (error) {
    console.error("Save error:", error);
    alert("Failed to save activity.");
  }
});
