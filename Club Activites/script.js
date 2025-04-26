//Global variables
let activities = [];
let filteredActivities = [];
let currentPage = 1;
const itemsPerPage = 4;

//DOM Elements
const activityList = document.querySelector('.activity-list');
const searchInput = document.querySelector('.filters input[type="text"]');
const filterButton = document.querySelector('.filters button:nth-child(2)');
const sortButton = document.querySelector('.filters button:nth-child(3)');
const paginationSection = document.querySelector('.pagination');
const detailSection = document.getElementById('detail');
const form = document.querySelector('#create form');

//Fetch activities from mock API
document.addEventListener('DOMContentLoaded', () => {
  fetchActivities();
  addFormValidation();
});

//Fetch Data
async function fetchActivities() {
  activityList.innerHTML = "<p>Loading activities...</p>";

  try {
    const response = await fetch('https://jsonplaceholder.typicode.com/'); 
    const data = await response.json();

    // Map API data into our structure
    activities = data.map((item, index) => ({
      id: item.id,
      club: "Club " + (index + 1),
      title: item.title.slice(0, 20),
      date: randomDate(),
      time: randomTime(),
      location: "Room " + (100 + index),
      description: item.body.slice(0, 80)
    }));

    filteredActivities = [...activities];
    renderActivities();
    renderPagination();
  } catch (error) {
    console.error(error);
    activityList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
  }
}

//Random date/time generators for demo
function randomDate() {
  const start = new Date();
  const end = new Date(2025, 4, 30);
  const randomDate = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  return randomDate.toISOString().split('T')[0];
}

function randomTime() {
  const hour = Math.floor(Math.random() * 12) + 1;
  const minute = Math.floor(Math.random() * 60);
  const ampm = Math.random() > 0.5 ? 'AM' : 'PM';
  return `${hour}:${minute.toString().padStart(2, '0')} ${ampm}`;
}

//Render activities based on page
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
    `;
    activityList.appendChild(card);
  });
}

//Render Pagination
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

//Search activities
searchInput.addEventListener('input', () => {
  const query = searchInput.value.toLowerCase();
  filteredActivities = activities.filter(activity => 
    activity.title.toLowerCase().includes(query) || 
    activity.club.toLowerCase().includes(query)
  );
  currentPage = 1;
  renderActivities();
  renderPagination();
});

//Sort activities by title
sortButton.addEventListener('click', () => {
  filteredActivities.sort((a, b) => a.title.localeCompare(b.title));
  currentPage = 1;
  renderActivities();
});

//Open Detail View
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
      <button>Edit</button>
      <button style="background-color: #dc3545;">Delete</button>
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

//Form validation
function addFormValidation() {
  form.addEventListener('submit', function(event) {
    event.preventDefault();
    const inputs = form.querySelectorAll('input[required], textarea');

    let valid = true;
    inputs.forEach(input => {
      if (!input.value.trim()) {
        valid = false;
        input.style.border = "1px solid red";
      } else {
        input.style.border = "1px solid #ddd";
      }
    });

    if (valid) {
      alert("Form is valid! (Simulation, not actually submitted)");
      form.reset();
    } else {
      alert("Please fill all required fields!");
    }
  });
}
