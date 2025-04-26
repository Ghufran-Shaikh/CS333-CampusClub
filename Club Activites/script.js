const activityList = document.getElementById("activityList");
const searchInput = document.getElementById("searchInput");
const sortTitleBtn = document.getElementById("sortTitleBtn");
const sortDateBtn = document.getElementById("sortDateBtn");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const pageInfo = document.getElementById("pageInfo");
const activityForm = document.getElementById("activityForm");

const detailSection = document.getElementById("detail");
const detailTitle = document.getElementById("detailTitle");
const detailImage = document.getElementById("detailImage");
const detailClub = document.getElementById("detailClub");
const detailDateTime = document.getElementById("detailDateTime");
const detailLocation = document.getElementById("detailLocation");
const detailDescription = document.getElementById("detailDescription");
const backBtn = document.getElementById("backBtn");

let activities = [];
let filteredActivities = [];
let currentPage = 1;
const activitiesPerPage = 2;

async function fetchActivities() {
  activityList.innerHTML = "<p>Loading activities...</p>";

  try {
    const response = await fetch('https://mocki.io/v1/cc07a558-4b6b-4b01-8975-8c8a4c416b7d'); // Replace with your actual URL
    if (!response.ok) throw new Error("Failed to fetch data");
    const data = await response.json();
    activities = data;
    filteredActivities = activities;
    renderActivities();
  } catch (error) {
    activityList.innerHTML = `<p>Error loading activities. Please try again later.</p>`;
    console.error(error);
  }
}

document.addEventListener("DOMContentLoaded", fetchActivities);
function renderActivities() {
  const startIndex = (currentPage - 1) * activitiesPerPage;
  const endIndex = startIndex + activitiesPerPage;
  const activitiesToShow = filteredActivities.slice(startIndex, endIndex);

  activityList.innerHTML = "";

  if (activitiesToShow.length === 0) {
    activityList.innerHTML = "<p>No activities found.</p>";
    return;
  }

  activitiesToShow.forEach(activity => {
    const card = document.createElement("div");
    card.className = "activity-card";

    card.innerHTML = `
      <img src="${activity.image}" style="width:100%; height:150px; object-fit:cover; border-radius:8px;" />
      <h2>${activity.title}</h2>
      <p class="subdued-text">${activity.date} • ${activity.location}</p>
      <p>${activity.description.substring(0, 60)}...</p>
      <a href="#" onclick="viewDetails(${activity.id})">View Details</a>
    `;

    activityList.appendChild(card);
  });

  pageInfo.innerText = `Page ${currentPage} of ${Math.ceil(filteredActivities.length / activitiesPerPage)}`;
}

prevBtn.addEventListener("click", () => {
  if (currentPage > 1) {
    currentPage--;
    renderActivities();
  }
});

nextBtn.addEventListener("click", () => {
  if (currentPage < Math.ceil(filteredActivities.length / activitiesPerPage)) {
    currentPage++;
    renderActivities();
  }
});

searchInput.addEventListener("input", () => {
  const searchValue = searchInput.value.toLowerCase();
  filteredActivities = activities.filter(activity =>
    activity.title.toLowerCase().includes(searchValue) ||
    activity.club.toLowerCase().includes(searchValue)
  );
  currentPage = 1;
  renderActivities();
});

sortTitleBtn.addEventListener("click", () => {
  filteredActivities.sort((a, b) => a.title.localeCompare(b.title));
  renderActivities();
});

sortDateBtn.addEventListener("click", () => {
  filteredActivities.sort((a, b) => new Date(a.date) - new Date(b.date));
  renderActivities();
});
function viewDetails(id) {
  const activity = activities.find(act => act.id === id);

  if (!activity) return;

  detailTitle.textContent = activity.title;
  detailImage.src = activity.image;
  detailClub.textContent = activity.club;
  detailDateTime.textContent = `${activity.date} at ${activity.time}`;
  detailLocation.textContent = activity.location;
  detailDescription.textContent = activity.description;

  // Hide activity list and show details
  activityList.style.display = "none";
  document.querySelector(".pagination").style.display = "none";
  detailSection.style.display = "block";
}

backBtn.addEventListener("click", () => {
  detailSection.style.display = "none";
  activityList.style.display = "grid";
  document.querySelector(".pagination").style.display = "flex";
});
activityForm.addEventListener("submit", (e) => {
  e.preventDefault();

  let valid = true;

  if (!clubName.value.trim()) {
    document.getElementById("clubNameError").textContent = "Club Name is required";
    valid = false;
  } else {
    document.getElementById("clubNameError").textContent = "";
  }

  if (!eventTitle.value.trim()) {
    document.getElementById("eventTitleError").textContent = "Event Title is required";
    valid = false;
  } else {
    document.getElementById("eventTitleError").textContent = "";
  }

  if (!eventDate.value) {
    document.getElementById("eventDateError").textContent = "Date is required";
    valid = false;
  } else {
    document.getElementById("eventDateError").textContent = "";
  }

  if (!eventTime.value) {
    document.getElementById("eventTimeError").textContent = "Time is required";
    valid = false;
  } else {
    document.getElementById("eventTimeError").textContent = "";
  }

  if (!eventLocation.value.trim()) {
    document.getElementById("eventLocationError").textContent = "Location is required";
    valid = false;
  } else {
    document.getElementById("eventLocationError").textContent = "";
  }

  if (valid) {
    alert("Form is valid! (Not actually submitting for now.)");
    activityForm.reset();
  }
});
[
  {
    "id": 1,
    "club": "Art Club",
    "title": "Sketch Night",
    "date": "2025-04-15",
    "time": "18:00",
    "location": "Room B101",
    "description": "Join fellow artists for a relaxing night of sketching and snacks.",
    "image": "https://images.unsplash.com/photo-1504198458649-3128b932f49b"
  },
  {
    "id": 2,
    "club": "Robotics Club",
    "title": "Arduino Workshop",
    "date": "2025-04-18",
    "time": "14:00",
    "location": "Lab 204",
    "description": "Build your first Arduino robot with fellow enthusiasts!",
    "image": "https://images.unsplash.com/photo-1556740749-887f6717d7e4"
  },
  {
    "id": 3,
    "club": "Drama Club",
    "title": "Theater Rehearsal",
    "date": "2025-04-20",
    "time": "19:00",
    "location": "Theater Hall",
    "description": "Full cast rehearsal for the upcoming play. Don't miss it!",
    "image": "https://images.unsplash.com/photo-1590291622381-1398c77bc95a"
  },
  {
    "id": 4,
    "club": "Photography Club",
    "title": "Photo Walk",
    "date": "2025-04-22",
    "time": "09:00",
    "location": "Campus Gardens",
    "description": "Join us for a photography walk around campus, capturing candid moments.",
    "image": "https://images.unsplash.com/photo-1501807959025-df45a09a1bfb"
  },
  {
    "id": 5,
    "club": "Coding Club",
    "title": "Hackathon",
    "date": "2025-04-25",
    "time": "10:00",
    "location": "Computer Science Lab",
    "description": "Join us for a 24-hour hackathon to solve real-world problems through code!",
    "image": "https://images.unsplash.com/photo-1561948958-4b2387db5c56"
  }
]
