// script.js

// ===== Global Variables =====
let allReviews = [];  // fetched reviews will be stored here
let currentPage = 1;
const reviewsPerPage = 6;  // how many reviews per page
let filteredReviews = [];  // for search/filter/sort

// ===== HTML Elements =====
const reviewsContainer = document.querySelector("section.grid");
const searchInput = document.querySelector("input[type='text']");
const departmentFilter = document.querySelector("select:nth-of-type(1)");
const sortSelect = document.querySelector("select:nth-of-type(2)");
const paginationContainer = document.querySelector(".flex.justify-center.items-center.space-x-2");

// ===== 1. Fetch Data =====
async function fetchReviews() {
  showLoading();
  try {
    // Simulating a small clean API (you can replace with real API later)
    const response = await fetch('reviews/reviews.json');

    if (!response.ok) throw new Error('Failed to fetch reviews.');

    const data = await response.json();
    allReviews = data;
    filteredReviews = allReviews;
    renderReviews();
    renderPagination();
  } catch (error) {
    showError(error.message);
  }
}
  
// ===== 2. Render Reviews =====
function renderReviews() {
  reviewsContainer.innerHTML = "";  // clear old cards

  const start = (currentPage - 1) * reviewsPerPage;
  const end = start + reviewsPerPage;
  const reviewsToShow = filteredReviews.slice(start, end);

  if (reviewsToShow.length === 0) {
    reviewsContainer.innerHTML = "<p class='col-span-full text-center text-gray-500'>No reviews found.</p>";
    return;
  }

  reviewsToShow.forEach(review => {
    const reviewCard = document.createElement("article");
    reviewCard.className = "bg-white p-4 rounded shadow hover:shadow-md";
  
    const modalId = `modal-${review.courseCode.replace(/\s+/g, '-')}`;
  
    reviewCard.innerHTML = `
      <h2 class="text-xl font-semibold">${review.courseCode} – ${review.courseTitle}</h2>
      <p class="text-gray-500">${review.instructor} • ${"★".repeat(review.rating)}${"☆".repeat(5 - review.rating)}</p>
      <p class="mt-2 text-sm text-gray-600">"${review.shortReview}"</p>
      <a href="#${modalId}" class="text-blue-800 mt-3 inline-block">Read More →</a>
  
      <div id="${modalId}" class="hidden fixed inset-0 bg-black bg-opacity-50 items-start justify-center p-4 z-50">
        <section class="bg-white rounded shadow p-6 w-full max-w-2xl mt-20">
          <h1 class="text-2xl font-bold">${review.courseCode} – ${review.courseTitle}</h1>
          <p class="text-gray-600">Reviewed by ${review.reviewer} • ${review.semester}</p>
          <p class="mt-2">Rating: ${"★".repeat(review.rating)}${"☆".repeat(5 - review.rating)} (${review.rating}/5)</p>
          <p class="mt-4 text-gray-700">${review.fullReview}</p>
          <div class="mt-6">
          <a href="#" onclick="this.closest('div[id^=modal-]').style.display='none';" class="text-blue-800 underline">← Back to All Reviews</a>

          </div>
        </section>
      </div>
    `;
  
    reviewsContainer.appendChild(reviewCard);
  });
  
}

// ===== 3. Search & Filter =====
function handleSearchAndFilter() {
  const searchTerm = searchInput.value.toLowerCase();
  const selectedDepartment = departmentFilter.value;

  filteredReviews = allReviews.filter(review => {
    const matchesSearch = review.courseTitle.toLowerCase().includes(searchTerm) ||
                          review.courseCode.toLowerCase().includes(searchTerm);

    const matchesDepartment = selectedDepartment === "All Departments" ||
                               review.department === selectedDepartment;

    return matchesSearch && matchesDepartment;
  });

  currentPage = 1;
  renderReviews();
  renderPagination();
}

// ===== 4. Sort =====
function handleSort() {
  const sortValue = sortSelect.value;

  if (sortValue === "Newest") {
    filteredReviews.sort((a, b) => new Date(b.date) - new Date(a.date));
  } else if (sortValue === "Oldest") {
    filteredReviews.sort((a, b) => new Date(a.date) - new Date(b.date));
  } else if (sortValue === "Most Liked") {
    filteredReviews.sort((a, b) => b.rating - a.rating);
  }

  currentPage = 1;
  renderReviews();
}

// ===== 5. Pagination =====
function renderPagination() {
  paginationContainer.innerHTML = "";
  const totalPages = Math.ceil(filteredReviews.length / reviewsPerPage);

  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement("button");
    btn.className = `px-3 py-1 border rounded ${i === currentPage ? 'bg-blue-100' : 'hover:shadow-md'}`;
    btn.textContent = i;

    btn.addEventListener("click", () => {
      currentPage = i;
      renderReviews();
      renderPagination();
    });

    paginationContainer.appendChild(btn);
  }
}

// ===== 6. Loading Indicator =====
function showLoading() {
  reviewsContainer.innerHTML = "<p class='col-span-full text-center text-gray-500'>Loading reviews...</p>";
}

// ===== 7. Error Handling =====
function showError(message) {
  reviewsContainer.innerHTML = `<p class='col-span-full text-center text-red-500'>${message}</p>`;
}

// ===== 8. Form Validation =====
const addReviewForm = document.querySelector("#add-review form");
addReviewForm.addEventListener("submit", (e) => {
  e.preventDefault();  // stop page refresh

  const inputs = addReviewForm.querySelectorAll("input, textarea, select");
  let valid = true;

  inputs.forEach(input => {
    if (input.hasAttribute("required") && !input.value.trim()) {
      input.classList.add("border-red-500");
      valid = false;
    } else {
      input.classList.remove("border-red-500");
    }

    if (input.type === "number") {
      if (input.value < 1 || input.value > 5) {
        input.classList.add("border-red-500");
        valid = false;
      }
    }
  });

  if (!valid) {
    alert("Please correct the highlighted fields.");
    return;
  }

  alert("Review added successfully! (Not saved, demo only.)");
  addReviewForm.reset();
});

// ===== 9. Event Listeners =====
searchInput.addEventListener("input", handleSearchAndFilter);
departmentFilter.addEventListener("change", handleSearchAndFilter);
sortSelect.addEventListener("change", handleSort);

// ===== 10. Initialize =====
fetchReviews();
