document.addEventListener("DOMContentLoaded", () => {
  loadActivities();

  document.querySelector("form").addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);

    try {
      const response = await fetch("https://4399efd1-a97f-4e48-9229-329a9b6b5e93-00-1hm9s0f5r7gge.pike.replit.dev/api/activities.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        console.log("Activity added successfully!");
        e.target.reset();
        loadActivities();
      } else {
        console.error("Failed to add activity. Response code:", response.status, response.statusText);
        alert("Failed to add activity. Please try again.");
      }
    } catch (error) {
      console.error("Error occurred while sending data:", error);
      alert("An error occurred. Please try again.");
    }
  });
});

async function loadActivities() {
  try {
    const response = await fetch("https://4399efd1-a97f-4e48-9229-329a9b6b5e93-00-1hm9s0f5r7gge.pike.replit.dev/api/activities.php");

    if (!response.ok) {
      console.error("Failed to fetch data:", response.status, response.statusText);
      return;
    }

    const activities = await response.json();
    const activityList = document.querySelector(".activity-list");
    activityList.innerHTML = "";

    activities.forEach((activity) => {
      const activityCard = document.createElement("div");
      activityCard.className = "activity-card";
      activityCard.innerHTML = `
        <h2>${activity.title}</h2>
        <p class="subdued-text">${activity.club} | ${activity.date} • ${activity.time} | ${activity.location}</p>
        <p>${activity.description}</p>
        <button onclick="viewDetails(${encodeURIComponent(JSON.stringify(activity))})">View Details</button>
        <button onclick="deleteActivity(${activity.id})">Delete</button>
      `;
      activityList.appendChild(activityCard);
    });
  } catch (error) {
    console.error("Error occurred while loading activities:", error);
  }
}

async function deleteActivity(id) {
  try {
    const response = await fetch("https://4399efd1-a97f-4e48-9229-329a9b6b5e93-00-1hm9s0f5r7gge.pike.replit.dev/api/activities.php", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });

    if (response.ok) {
      console.log("Activity deleted successfully!");
      loadActivities();
    } else {
      console.error("Failed to delete activity:", response.status, response.statusText);
    }
  } catch (error) {
    console.error("Error occurred while deleting activity:", error);
  }
}

function viewDetails(encodedData) {
  const activity = JSON.parse(decodeURIComponent(encodedData));
  alert(
    `📌 ${activity.title}\n` +
    `Club: ${activity.club}\n` +
    `Date: ${activity.date}\n` +
    `Time: ${activity.time}\n` +
    `Location: ${activity.location}\n\n` +
    `${activity.description}`
  );
}
