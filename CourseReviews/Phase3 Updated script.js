const REVIEWS_PER_PAGE = 3; // minimum number of review cards by page 
const MINIMUM_PAGES = 3; // minimum number of pages to display
const JSON_URL = 'https://replit.com/@nohaidris17/my-app?v=1'; //link with json file
let reviews = [];
let filteredReviews = [];
let currentPage = 1;
const likedReviews = new Set(); 

// DOM 
const reviewContainer = document.getElementById('reviewContainer');
const paginationContainer = document.getElementById('pagination');
const loading = document.getElementById('loading');
const error = document.getElementById('error');
const searchInput = document.getElementById('searchInput');
const departmentFilter = document.getElementById('departmentFilter');
const sortSelect = document.getElementById('sortSelect');
const reviewForm = document.getElementById('reviewForm');

// fetch reviews
async function fetchReviews() {
  try {
    loading.classList.remove('hidden');
    error.classList.add('hidden');
    const response = await fetch(JSON_URL);
    console.log('Response status:', response.status);
    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
    const data = await response.json();
    console.log('Fetched data:', data);
    reviews = data; 
    filteredReviews = [...reviews];
    renderReviews();
    renderPagination();
  } catch (err) {
    error.textContent = 'Failed to load reviews. Please try again later.';
    error.classList.remove('hidden');
    console.error('Fetch error:', err);
  } finally {
    loading.classList.add('hidden');
  }
}

// render reviews
function renderReviews() {
  const start = (currentPage - 1) * REVIEWS_PER_PAGE;
  const end = start + REVIEWS_PER_PAGE;
  const paginatedReviews = filteredReviews.slice(start, end);

  reviewContainer.innerHTML = paginatedReviews.length
    ? paginatedReviews.map(review => `
        <article class="bg-white p-6 rounded-xl shadow hover:shadow-lg transition-shadow duration-300 space-y-3 border border-gray-100 cursor-pointer">
          <h2 class="text-xl font-semibold">${review.courseCode} – ${review.courseTitle}</h2>
          <p class="text-sm text-gray-400">Department: ${review.department} • Published: ${new Date(review.publishedDate).toLocaleDateString()}</p>
          <p class="text-gray-500">${review.instructor} • 
            <span class="inline-block text-m text-black px-2 py-1 rounded">${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}</span>
          </p>
          <p class="text-sm text-gray-600">"${review.reviewText.substring(0, 50)}..."</p>
          <div class="flex justify-between items-center mt-3">
            <a href="#review-${review.courseCode}" class="text-blue-800 inline-block underline" onclick="openDetailView(${review.id})">Read More</a>
            <button onclick="likeReview(${review.id})" class="like-button flex items-center gap-1 text-sm text-gray-600 border border-gray-300 px-3 py-1 rounded-full hover: ${likedReviews.has(review.id) ? 'liked' : ''}">
              <span>${review.likes}</span> <span>${likedReviews.has(review.id) ? '❤️' : '🤍'}</span>
            </button>
          </div>
          <div id="review-${review.courseCode}" class="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <section class="bg-white rounded shadow p-6 w-full max-w-2xl mt-20">
              <h2 class="text-2xl font-bold">${review.courseCode} – ${review.courseTitle}</h2>
              <p class="text-gray-600">Reviewed by Anonymous • ${review.semester}</p>
              <p class="mt-2">Department: ${review.department}</p>
              <p class="mt-2">Rating: ${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)} (${review.rating}/5)</p>
              <p class="mt-4 text-gray-700">"${review.reviewText}"</p>
              <div class="mt-4 flex gap-4">
                <button class="bg-blue-800 text-white px-4 py-2 rounded hover:bg-blue-900 transition">Edit</button>
                <button class="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition">Delete</button>
              </div>
              <div class="mt-6">
                <h3 class="text-lg font-semibold text-gray-800">Comments</h3>
                <div class="mt-4 space-y-4">
                  <article class="bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <p class="text-sm text-gray-600">Posted by Anonymous • ${new Date().toLocaleDateString()}</p>
                    <p class="mt-2 text-gray-700">Sample comment for ${review.courseTitle}.</p>
                  </article>
                  <form class="mt-4">
                    <label for="comment-${review.courseCode}" class="block mb-1 font-medium text-gray-700">Add a Comment</label>
                    <textarea id="comment-${review.courseCode}" rows="3" placeholder="Write your comment..." class="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-400"></textarea>
                    <div class="mt-2 flex justify-end">
                      <button type="submit" class="bg-blue-800 text-white px-4 py-2 rounded hover:bg-blue-900 transition">Post Comment</button>
                    </div>
                  </form>
                </div>
              </div>
              <div class="mt-6">
                <a href="#" class="text-blue-800 underline">← Back to All Reviews</a>
              </div>
            </section>
          </div>
        </article>
      `).join('')
    : `<p class="col-span-full text-center text-gray-600">${filteredReviews.length === 0 ? 'No reviews found.' : 'No reviews on this page.'}</p>`;
}

//  pagination
function renderPagination() {

  const actualPageCount = Math.ceil(filteredReviews.length / REVIEWS_PER_PAGE);
  const pageCount = Math.max(actualPageCount, MINIMUM_PAGES);
  paginationContainer.innerHTML = Array.from({ length: pageCount }, (_, i) => `
    <button class="px-3 py-1 border rounded ${currentPage === i + 1 ? 'bg-blue-100' : 'hover:shadow-md transition'}" onclick="goToPage(${i + 1})">${i + 1}</button>
  `).join('');
}

function goToPage(page) {
  currentPage = page;
  renderReviews();
  renderPagination();
}


// like review
function likeReview(id) {
  const review = reviews.find(r => r.id === id);
  if (review) {
    if (likedReviews.has(id)) {
      // unlike
      review.likes -= 1;
      likedReviews.delete(id);
    } else {
      // like
      review.likes += 1;
      likedReviews.add(id);
    }
    filteredReviews = [...reviews]; 
    renderReviews(); 
    renderPagination(); 
  }
}

// open detail view
function openDetailView(id) {
}

// search and filter and sort functionts
function applyFiltersAndSort() {
  const searchTerm = searchInput.value.toLowerCase();
  const department = departmentFilter.value;
  const sort = sortSelect.value;

  filteredReviews = reviews.filter(review => {
    const matchesSearch = review.courseTitle.toLowerCase().includes(searchTerm) || review.courseCode.toLowerCase().includes(searchTerm);
    const matchesDepartment = !department || review.department === department;
    return matchesSearch && matchesDepartment;
  });

  if (sort === 'newest') {
    filteredReviews.sort((a, b) => new Date(b.publishedDate) - new Date(a.publishedDate));
  } else if (sort === 'oldest') {
    filteredReviews.sort((a, b) => new Date(a.publishedDate) - new Date(b.publishedDate));
  } else if (sort === 'most-liked') {
    filteredReviews.sort((a, b) => b.likes - a.likes);
  }

  currentPage = 1; 
  renderReviews();
  renderPagination();
}

// form validation
function validateForm() {
  let isValid = true;

  document.querySelectorAll('.error-message').forEach(el => el.style.display = 'none');
  document.querySelectorAll('.error').forEach(el => el.classList.remove('error'));

  const title = document.getElementById('title');
  if (!title.value || title.value.length < 3) {
    document.getElementById('title-error').style.display = 'block';
    title.parentElement.classList.add('error');
    isValid = false;
  }

  const code = document.getElementById('code');
  const codePattern = /^[A-Z]{4}[0-9]{3}$/;
  if (!code.value || !codePattern.test(code.value)) {
    document.getElementById('code-error').style.display = 'block';
    code.parentElement.classList.add('error');
    isValid = false;
  }

  const department = document.getElementById('department');
  if (!department.value) {
    document.getElementById('department-error').style.display = 'block';
    department.parentElement.classList.add('error');
    isValid = false;
  }

  const instructor = document.getElementById('instructor');
  if (!instructor.value || instructor.value.length < 3) {
    document.getElementById('instructor-error').style.display = 'block';
    instructor.parentElement.classList.add('error');
    isValid = false;
  }

  const semester = document.getElementById('semester');
  if (semester.value && !['First Semester', 'Second Semester', 'Summer Semester'].includes(semester.value)) {
    document.getElementById('semester-error').style.display = 'block';
    semester.parentElement.classList.add('error');
    isValid = false;
  }

  const rating = document.getElementById('rating');
  if (!rating.value || rating.value < 1 || rating.value > 5) {
    document.getElementById('rating-error').style.display = 'block';
    rating.parentElement.classList.add('error');
    isValid = false;
  }

  const reviewText = document.getElementById('reviewText');
  if (!reviewText.value || reviewText.value.length < 10) {
    document.getElementById('reviewText-error').style.display = 'block';
    reviewText.parentElement.classList.add('error');
    isValid = false;
  }

  return isValid;
}

// event listeners
searchInput.addEventListener('input', applyFiltersAndSort);
departmentFilter.addEventListener('change', applyFiltersAndSort);
sortSelect.addEventListener('change', applyFiltersAndSort);

reviewForm.addEventListener('submit', (e) => {
  e.preventDefault();
  if (validateForm()) {
    alert('Form validated successfully! (Submission not implemented)');
    reviewForm.reset();
    window.location.hash = '';
  }
});

reviewForm.addEventListener('input', validateForm);

// initialize
fetchReviews();
