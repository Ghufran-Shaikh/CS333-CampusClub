const REVIEWS_PER_PAGE = 3;
const MINIMUM_PAGES = 3;
const API_URL = 'https://replit.com/@nohaidris17/my-app?v=1'; 
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

// Fetch reviews
async function fetchReviews() {
    try {
        loading.classList.remove('hidden');
        error.classList.add('hidden');
        
        const params = new URLSearchParams({
            page: currentPage,
            search: searchInput.value,
            department: departmentFilter.value,
            sort: sortSelect.value
        });
        
        const response = await fetch(`${API_URL}?${params}`);
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        const data = await response.json();
        
        reviews = data.reviews;
        filteredReviews = [...reviews];
        renderReviews();
        renderPagination(data.total);
    } catch (err) {
        error.textContent = 'Failed to load reviews. Please try again later.';
        error.classList.remove('hidden');
        console.error('Fetch error:', err);
    } finally {
        loading.classList.add('hidden');
    }
}

// Render reviews
function renderReviews() {
    const start = (currentPage - 1) * REVIEWS_PER_PAGE;
    const end = start + REVIEWS_PER_PAGE;
    const paginatedReviews = filteredReviews.slice(start, end);

    reviewContainer.innerHTML = paginatedReviews.length
        ? paginatedReviews.map(review => `
            <article class="bg-white p-6 rounded-xl shadow hover:shadow-lg transition-shadow duration-300 space-y-3 border border-gray-100 cursor-pointer">
              <h2 class="text-xl font-semibold">${review.course_code} – ${review.course_title}</h2>
              <p class="text-sm text-gray-400">Department: ${review.department} • Published: ${new Date(review.published_date).toLocaleDateString()}</p>
              <p class="text-gray-500">${review.instructor} • 
                <span class="inline-block text-m text-black px-2 py-1 rounded">${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}</span>
              </p>
              <p class="text-sm text-gray-600">"${review.review_text.substring(0, 50)}..."</p>
              <div class="flex justify-between items-center mt-3">
                <a href="#review-${review.course_code}" class="text-blue-950 inline-block underline">Read More</a>
                <button onclick="likeReview(${review.id})" class="like-button flex items-center gap-1 text-sm text-gray-600 border border-gray-300 px-3 py-1 rounded-full hover: ${likedReviews.has(review.id) ? 'liked' : ''}">
                  <span>${review.likes}</span> <span>${likedReviews.has(review.id) ? '❤️' : '🤍'}</span>
                </button>
              </div>
              <div id="review-${review.course_code}" class="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 review-modal">
                <section class="bg-white rounded shadow p-6 w-full max-w-2xl mt-20">
                  <h2 class="text-2xl font-bold">${review.course_code} – ${review.course_title}</h2>
                  <p class="text-gray-600">Reviewed by Anonymous • ${review.semester || 'N/A'}</p>
                  <p class="mt-2">Department: ${review.department}</p>
                  <p class="mt-2">Rating: ${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)} (${review.rating}/5)</p>
                  <p class="mt-4 text-gray-700">"${review.review_text}"</p>
                  <div class="mt-4 flex gap-4">
                    <button onclick="editReview(${review.id})" class="bg-blue-950 text-white px-4 py-2 rounded hover:bg-blue-900 transition">Edit</button>
                    <button onclick="deleteReview(${review.id})" class="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition">Delete</button>
                  </div>
                  <div class="mt-6">
                    <p class="text-gray-600">Comments feature coming soon!</p>
                  </div>
                  <div class="mt-6">
                    <a href="#" class="text-blue-950 underline">← Back to All Reviews</a>
                  </div>
                </section>
              </div>
            </article>
          `).join('')
        : `<p class="col-span-full text-center text-gray-600">${filteredReviews.length === 0 ? 'No reviews found.' : 'No reviews on this page.'}</p>`;
}

// Render pagination
function renderPagination(total) {
    const actualPageCount = Math.ceil(total / REVIEWS_PER_PAGE);
    const pageCount = Math.max(actualPageCount, MINIMUM_PAGES);
    paginationContainer.innerHTML = Array.from({ length: pageCount }, (_, i) => `
        <button class="px-3 py-1 border rounded ${currentPage === i + 1 ? 'bg-blue-100' : 'hover:shadow-md transition'}" onclick="goToPage(${i + 1})">${i + 1}</button>
    `).join('');
}

function goToPage(page) {
    currentPage = page;
    fetchReviews();
}

// Like/unlike review
async function likeReview(id) {
    try {
        const action = likedReviews.has(id) ? 'unlike' : 'like';
        const response = await fetch(`${API_URL}like.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, action })
        });
        
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        const updatedReview = await response.json();
        
        const index = reviews.findIndex(r => r.id === id);
        if (index !== -1) {
            reviews[index] = updatedReview;
            filteredReviews = [...reviews];
            if (action === 'like') {
                likedReviews.add(id);
            } else {
                likedReviews.delete(id);
            }
            renderReviews();
        }
    } catch (err) {
        console.error('Like error:', err);
    }
}

// Edit review
async function editReview(id) {
    try {
        const response = await fetch(`${API_URL}single.php?id=${id}`);
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        const review = await response.json();
        
        document.getElementById('title').value = review.course_title;
        document.getElementById('code').value = review.course_code;
        document.getElementById('department').value = review.department;
        document.getElementById('instructor').value = review.instructor;
        document.getElementById('semester').value = review.semester || '';
        document.getElementById('rating').value = review.rating;
        document.getElementById('reviewText').value = review.review_text;
        
        window.location.hash = 'add-review';
        reviewForm.dataset.id = id;
    } catch (err) {
        console.error('Edit error:', err);
    }
}

// Delete review
async function deleteReview(id) {
    if (!confirm('Are you sure you want to delete this review?')) return;
    
    try {
        const response = await fetch(`${API_URL}single.php?id=${id}`, {
            method: 'DELETE'
        });
        
        if (!response.ok && response.status !== 204) throw new Error(`HTTP error! Status: ${response.status}`);
        
        reviews = reviews.filter(r => r.id !== id);
        filteredReviews = [...reviews];
        renderReviews();
        fetchReviews();
        window.location.hash = '';
    } catch (err) {
        console.error('Delete error:', err);
    }
}

// Search, filter, and sort
function applyFiltersAndSort() {
    currentPage = 1;
    fetchReviews();
}

// Form validation
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

// Form submission
reviewForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    const data = {
        course_code: document.getElementById('code').value,
        course_title: document.getElementById('title').value,
        department: document.getElementById('department').value,
        instructor: document.getElementById('instructor').value,
        semester: document.getElementById('semester').value || null,
        rating: parseInt(document.getElementById('rating').value),
        review_text: document.getElementById('reviewText').value
    };
    
    try {
        const id = reviewForm.dataset.id;
        const url = id ? `${API_URL}single.php?id=${id}` : `${API_URL}`;
        const method = id ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `HTTP error! Status: ${response.status}`);
        }
        
        const newReview = await response.json();
        if (id) {
            const index = reviews.findIndex(r => r.id === parseInt(id));
            if (index !== -1) reviews[index] = newReview;
        } else {
            reviews.push(newReview);
        }
        filteredReviews = [...reviews];
        renderReviews();
        fetchReviews();
        reviewForm.reset();
        delete reviewForm.dataset.id;
        window.location.hash = '';
    } catch (err) {
        alert(`Error: ${err.message}`);
        console.error('Submission error:', err);
    }
});

reviewForm.addEventListener('input', validateForm);

// Initialize
fetchReviews();
