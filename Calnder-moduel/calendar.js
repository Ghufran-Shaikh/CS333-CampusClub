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


</script>