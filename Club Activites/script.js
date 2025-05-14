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

// Fetch activities from the API
document.addEventListener('DOMContentLoaded', () => {
  fetchActivities();
});

// Fetch activities from the backend
async function fetchActivities() {
  activityList.innerHTML = "<p>Loading activities...</p>";

  try {
    const response = await fetch('https://4399efd1-a97f-4e48-9229-329a9b6b5e93-00-1hm9s0f5r7gge.pike.replit.dev/api/activities.php');
    const data = await response.json();

    if (data.error) {
      activityList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      return;
    }

    activities = data;
    filteredActivities = [...activities];
    renderActivities();
    renderPagination();
  } catch (error) {
    console.error(error);
    activityList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
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
      <p class="activity-description">${activity.description}</p>
      <a href="#detail" onclick="openDetailView(${activity.id})">View Details</a>
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

  if (query === '') {
    filteredActivities = [...activities];
  } else {
    filteredActivities = activities.filter(activity =>
      activity.title.toLowerCase().includes(query) ||
      activity.description.toLowerCase().includes(query)
    );
  }

  currentPage = 1;
  renderActivities();
  renderPagination();
});
