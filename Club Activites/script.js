// Global variables
let activities = [];
let filteredActivities = [];
let currentPage = 1;
const itemsPerPage = 4;

// DOM Elements
const activityList = document.querySelector('.activity-list');
const searchInput = document.querySelector('.filters input[type="text"]');
const filterButton = document.querySelector('.filters button:nth-child(2)');
const sortButton = document.querySelector('.filters button:nth-child(3)');
const paginationSection = document.querySelector('.pagination');
const detailSection = document.getElementById('detail');
const form = document.querySelector('#create form');

// Fetch activities from the API
document.addEventListener('DOMContentLoaded', () => {
  fetchActivities();
  addFormValidation();
});

// Fetch activities from the backend
async function fetchActivities() {
  activityList.innerHTML = "<p>Loading activities...</p>";

  try {
    const response = await fetch('https://my-app.alanoudahmed62.repl.co/api/activities.php');
    const data = await response.json();

    if (data.error) {
      activityList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      return;
    }

    console.log(data);  // Log the fetched data to inspect it
    activities = data;
    filteredActivities = [...activities];
    renderActivities();
    renderPagination();
  } catch (error) {
    console.error(error);
    activityList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
  }
}

// Create new activity (POST request)
async function createActivity(activityData) {
  try {
    const response = await fetch('https://my-app.alanoudahmed62.repl.co/api/activities.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(activityData),
    });

    const data = await response.json();
    if (data.message) {
      alert('Activity created successfully!');
      fetchActivities(); // Reload the activities list
    } else {
      alert('Failed to create activity');
    }
  } catch (error) {
    console.error(error);
    alert('An error occurred while creating the activity.');
  }
}

// Update activity (PUT request)
async function updateActivity(activityData) {
  try {
    const response = await fetch('https://my-app.alanoudahmed62.repl.co/api/activities.php', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(activityData),
    });

    const data = await response.json();
    if (data.message) {
      alert('Activity updated successfully!');
      fetchActivities(); // Reload the activities list
    } else {
      alert('Failed to update activity');
    }
  } catch (error) {
    console.error(error);
    alert('An error occurred while updating the activity.');
  }
}

// Delete activity (DELETE request)
async function deleteActivity(activityId) {
  if (!confirm("Are you sure you want to delete this activity?")) return;

  try {
    const response = await fetch('https://my-app.alanoudahmed62.repl.co/api/activities.php', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id: activityId }),
    });

    const data = await response.json();
    if (data.message) {
      alert('Activity deleted successfully!');
      fetchActivities(); // Reload the activities list
    } else {
      alert('Failed to delete activity');
    }
  } catch (error) {
    console.error(error);
    alert('An error occurred while deleting the activity.');
  }
}

// Render activities based on current page
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
      <p>${activity.description}</p>
      <a href="#detail" onclick="openDetailView(${activity.id})">View Details</a>
      <button onclick="deleteActivity(${activity.id})">Delete</button>
    `;
    activityList.appendChild(card);
  });
}

// Render Pagination
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

// Search activities (Real-time Search)
searchInput.addEventListener('input', () => {
  const query = searchInput.value.trim().toLowerCase();

  // If search query is empty, show all activities
  if (query === '') {
    filteredActivities = [...activities];  // Show all activities
  } else {
    filteredActivities = activities.filter(activity =>
      activity.title.toLowerCase().includes(query) ||
      activity.description.toLowerCase().includes(query)
    );
  }

  currentPage = 1;  // Reset to first page
  renderActivities();
  renderPagination();
});

// Sort activities by title
sortButton.addEventListener('click', () => {
  filteredActivities.sort((a, b) => a.title.localeCompare(b.title));
  currentPage = 1;
  renderActivities();
}); 

// Open Detail View (Dynamic Details)
function openDetailView(id) {
  const activity = activities.find(a => a.id === id);

  if (!activity) return;

  detailSection.innerHTML = `
    <h2>Club Activity Details</h2>
    <p><strong>Club:</strong> ${activity.club}</p>
    <p><strong>Event:</strong> ${activity.title}</p>
    <p><strong>Date & Time:</strong> ${activity.date} at ${activity.time}</p>
    <p><strong>Location:</strong> ${activity.location}</p>
    <p><strong>Description:</strong> ${activity.description}</p>

    <div class="card-buttons">
      <button onclick="openEditForm(${activity.id})">Edit</button>
      <button onclick="deleteActivity(${activity.id})" style="background-color: #dc3545;">Delete</button>
    </div>

    <div class="comment-box">
      <label>Comments</label>
      <textarea placeholder="Write a comment..." rows="3"></textarea>
    </div>

    <p style="margin-top: 15px;">
      <a href="#">← Back to listing</a>
    </p>
  `;
}

// Open Edit Form
function openEditForm(activityId) {
  const activity = activities.find(a => a.id === activityId);

  if (!activity) return;

  document.querySelector('#create input[name="title"]').value = activity.title;
  document.querySelector('#create input[name="date"]').value = activity.date;
  document.querySelector('#create input[name="location"]').value = activity.location;
  document.querySelector('#create textarea[name="description"]').value = activity.description;

  // Update form to handle edit
  form.onsubmit = function(event) {
    event.preventDefault();
    const updatedActivity = {
      id: activity.id,
      title: form.querySelector('[name="title"]').value,
      date: form.querySelector('[name="date"]').value,
      location: form.querySelector('[name="location"]').value,
      description: form.querySelector('[name="description"]').value,
    };
    updateActivity(updatedActivity);
  };
}
