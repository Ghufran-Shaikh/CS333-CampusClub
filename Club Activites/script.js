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
async function fetchActivities(page = 1, limit = 4) {
  activityList.innerHTML = "<p>Loading activities...</p>";

  try {
    const response = await fetch(`https://my-app.alanoudahmed62.repl.co/api/activities.php?page=${page}&limit=${limit}`);
    const data = await response.json();

    if (data.error) {
      activityList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      return;
    }

    activities = data.activities;
    filteredActivities = [...activities];
    renderActivities();
    renderPagination(data.totalPages, page);
  } catch (error) {
    console.error(error);
    activityList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
  }
}

// Render Pagination
function renderPagination(totalPages, currentPage) {
  paginationSection.innerHTML = `
    <button onclick="prevPage(${currentPage})">Prev</button>
    <span>Page ${currentPage} of ${totalPages}</span>
    <button onclick="nextPage(${currentPage}, ${totalPages})">Next</button>
  `;
}

function prevPage(currentPage) {
  if (currentPage > 1) fetchActivities(currentPage - 1);
}

function nextPage(currentPage, totalPages) {
  if (currentPage < totalPages) fetchActivities(currentPage + 1);
}

// Open Detail View
function openDetailView(id) {
  const activity = activities.find(a => a.id === id);

  if (!activity) return;

  detailSection.innerHTML = `
    <h2>${activity.title} Details</h2>
    <p><strong>Club:</strong> ${activity.club_name}</p>
    <p><strong>Date & Time:</strong> ${activity.activity_date} at ${activity.activity_time}</p>
    <p><strong>Location:</strong> ${activity.location}</p>
    <p><strong>Description:</strong> ${activity.description}</p>

    <div class="card-buttons">
      <button onclick="openEditForm(${activity.id})">Edit</button>
      <button onclick="deleteActivity(${activity.id})">Delete</button>
    </div>

    <a href="#" onclick="renderActivities(); renderPagination();">← Back to listing</a>
  `;
}

// Load Activities on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  fetchActivities();
});
