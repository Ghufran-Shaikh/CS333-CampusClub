document.addEventListener("DOMContentLoaded", () => {
  loadActivities();

  const form = document.querySelector("form");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    const editingId = e.target.dataset.editingId;
    const method = editingId ? "PUT" : "POST";
    if (editingId) data.id = editingId;

    await fetch("https://4399efd1-a97f-4e48-9229-329a9b6b5e93-00-1hm9s0f5r7gge.pike.replit.dev/api/activities.php", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    e.target.reset();
    delete e.target.dataset.editingId;
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
  const confirmDelete = confirm("هل تريد بالتأكيد حذف هذا النشاط؟");
  if (!confirmDelete) return;

  await fetch("https://4399efd1-a97f-4e48-9229-329a9b6b5e93-00-1hm9s0f5r7gge.pike.replit.dev/api/activities.php", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id }),
  });

  loadActivities();
  document.getElementById("activity-detail").innerHTML = "";
  window.currentActivity = null;
}

// ✅ عرض تفاصيل النشاط في قسم التفاصيل
function viewDetails(encodedData) {
  const activity = JSON.parse(decodeURIComponent(encodedData));
  window.currentActivity = activity;

  const activityDetailDiv = document.getElementById("activity-detail");
  activityDetailDiv.innerHTML = `
    <p><strong>Club:</strong> ${activity.club}</p>
    <p><strong>Event:</strong> ${activity.title}</p>
    <p><strong>Date & Time:</strong> ${activity.date} at ${activity.time}</p>
    <p><strong>Location:</strong> ${activity.location}</p>
    <p><strong>Description:</strong> ${activity.description}</p>
  `;

  // التمرير للقسم
  document.getElementById("detail").scrollIntoView({ behavior: "smooth" });
}

// ✅ زر التعديل
document.querySelector("#detail .card-buttons button:first-child").addEventListener("click", () => {
  if (!window.currentActivity) return;

  const form = document.querySelector("form");
  const fields = form.querySelectorAll("input, textarea");

  fields[0].value = window.currentActivity.club;
  fields[1].value = window.currentActivity.title;
  fields[2].value = window.currentActivity.date;
  fields[3].value = window.currentActivity.time;
  fields[4].value = window.currentActivity.location;
  fields[5].value = window.currentActivity.description;

  form.dataset.editingId = window.currentActivity.id;
  document.getElementById("create").scrollIntoView({ behavior: "smooth" });
});

// ✅ زر الحذف داخل التفاصيل
document.querySelector("#detail .card-buttons button:last-child").addEventListener("click", async () => {
  if (window.currentActivity) {
    await deleteActivity(window.currentActivity.id);
  }
});
