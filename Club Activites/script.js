document.addEventListener("DOMContentLoaded", () => {
  loadActivities();

  document.querySelector("form").addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);

    await fetch("https://4399efd1-a97f-4e48-9229-329a9b6b5e93-00-1hm9s0f5r7gge.pike.replit.dev/api/activities.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    e.target.reset();
    loadActivities();
  });
});

async function loadActivities() {
  try {
    const response = await fetch("https://4399efd1-a97f-4e48-9229-329a9b6b5e93-00-1hm9s0f5r7gge.pike.replit.dev/api/activities.php");

    if (!response.ok) {
      console.error("فشل في جلب البيانات:", response.status, response.statusText);
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
    console.error("خطأ أثناء تحميل النشاطات:", error);
  }
}

async function deleteActivity(id) {
  await fetch("https://4399efd1-a97f-4e48-9229-329a9b6b5e93-00-1hm9s0f5r7gge.pike.replit.dev/api/activities.php", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id }),
  });

  loadActivities();
}

// دالة عرض التفاصيل
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
