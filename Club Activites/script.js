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

// Search activities (Real-time Search)
searchInput.addEventListener('input', () => {
  searchActivities();
});

function searchActivities() {
  const query = searchInput.value.trim().toLowerCase();
  if (query === '') {
    filteredActivities = [...activities];
  } else {
    filteredActivities = activities.filter(activity =>
      activity.title.toLowerCase().includes(query) ||
      activity.description.toLowerCase().includes(query)
    );
  }
  renderActivities();
  renderPagination(Math.ceil(filteredActivities.length / itemsPerPage), currentPage);
}
