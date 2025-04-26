document.addEventListener('DOMContentLoaded', () => {
    const API_URL = 'https://mocki.io/v1/d7e63f6c-5ed1-4538-90c8-2b8c1e075b3e';
    const eventList = document.querySelector('.list-disc');
    const searchInput = document.getElementById('event-search');
    const form = document.querySelector('form');
    const eventNameInput = document.getElementById('event-name');
    const eventDateInput = document.getElementById('event-date');
    const eventTimeInput = document.getElementById('event-time');
    const sortSelect = createSortSelect(); 
    const detailBox = createDetailBox(); 

    let allEvents = [];
    let currentPage = 1;
    const itemsPerPage = 3;

    // ✅ Fetch Events from API
    async function fetchEvents() {
        try {
            showLoading();
            const response = await fetch(API_URL);
            if (!response.ok) throw new Error('فشل في جلب الأحداث');
            const data = await response.json();
            allEvents = data;
            renderEvents();
        } catch (error) {
            console.error('Fetch error:', error);
            eventList.innerHTML = `<li class="text-red-500">خطأ في تحميل الأحداث ❌</li>`;
        }
    }

    // ✅ Render Events
    function renderEvents() {
        const filteredEvents = filterEvents();
        const sortedEvents = sortEvents(filteredEvents);
        const paginatedEvents = paginateEvents(sortedEvents);

        eventList.innerHTML = '';
        if (paginatedEvents.length === 0) {
            eventList.innerHTML = `<li class="text-gray-500">لا توجد أحداث مطابقة.</li>`;
            return;
        }

        paginatedEvents.forEach(event => {
            const li = document.createElement('li');
            li.className = "mb-2 font-semibold cursor-pointer hover:underline";
            li.textContent = `${event.name}: ${event.date} ${event.time}`;
            li.addEventListener('click', () => showEventDetails(event)); // 📋 عرض تفاصيل عند الضغط
            eventList.appendChild(li);
        });
        renderPagination(filteredEvents.length);
    }

    // ✅ Filter by search input
    function filterEvents() {
        const query = searchInput.value.toLowerCase();
        return allEvents.filter(event => 
            event.name.toLowerCase().includes(query) || 
            event.date.includes(query)
        );
    }

    // ✅ Sort events
    function sortEvents(events) {
        const sortType = sortSelect.value;
        if (sortType === 'name') {
            return events.slice().sort((a, b) => a.name.localeCompare(b.name));
        } else if (sortType === 'date') {
            return events.slice().sort((a, b) => new Date(a.date) - new Date(b.date));
        }
        return events;
    }

    // ✅ Pagination
    function paginateEvents(events) {
        const start = (currentPage - 1) * itemsPerPage;
        return events.slice(start, start + itemsPerPage);
    }

    // ✅ Render pagination buttons
    function renderPagination(totalItems) {
        let paginationContainer = document.getElementById('pagination');
        if (!paginationContainer) {
            paginationContainer = document.createElement('div');
            paginationContainer.id = 'pagination';
            paginationContainer.className = 'mt-4 flex justify-center';
            eventList.parentNode.appendChild(paginationContainer);
        }
        paginationContainer.innerHTML = '';

        const totalPages = Math.ceil(totalItems / itemsPerPage);
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

    // ✅ Show loading
    function showLoading() {
        eventList.innerHTML = `<li class="text-gray-500">جارٍ تحميل الأحداث...</li>`;
    }

    // ✅ Create Sort Select dropdown
    function createSortSelect() {
        const container = document.createElement('div');
        container.className = 'mb-4';

        const select = document.createElement('select');
        select.className = 'border p-2 rounded';
        select.innerHTML = `
            <option value="">ترتيب حسب...</option>
            <option value="name">ترتيب بالاسم</option>
            <option value="date">ترتيب بالتاريخ</option>
        `;

        select.addEventListener('change', () => {
            renderEvents();
        });

        eventList.parentNode.insertBefore(container, eventList);
        container.appendChild(select);

        return select;
    }

    // ✅ Create Detail Box
    function createDetailBox() {
        const detail = document.createElement('div');
        detail.className = 'mt-4 p-4 bg-gray-100 rounded shadow hidden';
        eventList.parentNode.appendChild(detail);
        return detail;
    }

    // ✅ Show Event Details
    function showEventDetails(event) {
        detailBox.innerHTML = `
            <h3 class="font-bold text-lg mb-2">تفاصيل الحدث</h3>
            <p><strong>الاسم:</strong> ${event.name}</p>
            <p><strong>التاريخ:</strong> ${event.date}</p>
            <p><strong>الوقت:</strong> ${event.time}</p>
        `;
        detailBox.classList.remove('hidden');
    }

    // ✅ Form submit - Add new event
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = eventNameInput.value.trim();
        const date = eventDateInput.value.trim();
        const time = eventTimeInput.value.trim();

        if (!name || !date || !time) {
            alert('جميع الحقول مطلوبة ✅');
            return;
        }

        const newEvent = { name, date, time };
        allEvents.push(newEvent);
        currentPage = Math.ceil(allEvents.length / itemsPerPage);
        renderEvents();
        form.reset();
    });

    // ✅ Search input change
    searchInput.addEventListener('input', () => {
        currentPage = 1;
        renderEvents();
    });

    // ✅ Initial load
    fetchEvents();
});

