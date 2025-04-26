<script>
document.addEventListener('DOMContentLoaded', () => {
    const API_URL = 'https://mocki.io/v1/5c112f19-66b7-4d87-abc8-7bb0112764b3'; 
    const eventList = document.querySelector('.list-disc');
    const searchInput = document.getElementById('event-search');
    const form = document.querySelector('form');
    const eventNameInput = document.getElementById('event-name');
    const eventDateInput = document.getElementById('event-date');
    const eventTimeInput = document.getElementById('event-time');

    let allEvents = [];
    let currentPage = 1;
    const itemsPerPage = 3;


    // Fetch events from the API
    // 🚀 Fetch events
    async function fetchEvents() {
        try {
            showLoading();
            const response = await fetch(API_URL);
            if (!response.ok) throw new Error('Failed to fetch events');
            const data = await response.json();
            allEvents = data;
            renderEvents();
        } catch (error) {
            console.error('Error fetching events:', error);
            eventList.innerHTML = `<li class="text-red-500">حدث خطأ أثناء جلب الأحداث.</li>`;
        } finally {
            hideLoading();
        }
    }

    // Render events to the list
    // 🔥 Render events
    function renderEvents() {
        const filteredEvents = filterEvents();
        const paginatedEvents = paginateEvents(filteredEvents);

        eventList.innerHTML = '';
        if (paginatedEvents.length === 0) {
            eventList.innerHTML = `<li class="text-gray-500">لا توجد أحداث مطابقة.</li>`;
            return;
        }

        paginatedEvents.forEach(event => {
            const li = document.createElement('li');
            li.className = "mb-2 font-semibold";
            li.textContent = `${event.name}: ${event.date} ${event.time}`;
            eventList.appendChild(li);
        });
        renderPagination(filteredEvents.length);
    }

    // Filter events based on search input
    // 🔍 Filter events
    function filterEvents() {
        const query = searchInput.value.toLowerCase();
        return allEvents.filter(event => 
            event.name.toLowerCase().includes(query) || 
            event.date.includes(query)
        );
    }

    // Paginate events
    // 🔢 Pagination
    function paginateEvents(events) {
        const start = (currentPage - 1) * itemsPerPage;
        return events.slice(start, start + itemsPerPage);
    }

    function renderPagination(totalItems) {
        const totalPages = Math.ceil(totalItems / itemsPerPage);
        const paginationContainer = document.getElementById('pagination') || createPaginationContainer();
        paginationContainer.innerHTML = '';

        for (let i = 1; i <= totalPages; i++) {
            const btn = document.createElement('button');
            btn.textContent = i;
            btn.className = `mx-1 px-3 py-1 rounded-full ${i === currentPage ? 'bg-orange-400 text-white' : 'bg-gray-200'}`;
            btn.addEventListener('click', () => {
                currentPage = i;
                renderEvents();
            });
            paginationContainer.appendChild(btn);
        }
    }

    function createPaginationContainer() {
        const container = document.createElement('div');
        container.id = 'pagination';
        container.className = 'mt-4 flex justify-center';
        eventList.parentNode.appendChild(container);
        return container;
    }

    // ⏳ Loading indicator
    function showLoading() {
        eventList.innerHTML = `<li class="text-gray-500">جارٍ التحميل...</li>`;
    }

    function hideLoading() {
        // handled automatically
    }
    // 🛠 Form submit
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = eventNameInput.value.trim();
        const date = eventDateInput.value.trim();
        const time = eventTimeInput.value.trim();

        if (!name || !date || !time) {
            alert('All fields are requried ✅');
            return;
        }
    // Add event locally
    const newEvent = { name, date, time };
    allEvents.push(newEvent);
    currentPage = Math.ceil(allEvents.length / itemsPerPage);
    renderEvents();
    form.reset();
});
 // 🔎 Search handler
 searchInput.addEventListener('input', () => {
    currentPage = 1;
    renderEvents();
});

// 🚀 Initial fetch
fetchEvents();
});




</script>