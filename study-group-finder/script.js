document.addEventListener('DOMContentLoaded', () => {
    // Speed dial toggle functionality (cleaned up)
    const speedDialButton = document.querySelector('[data-dial-toggle]');
    const speedDialMenu = document.getElementById('speed-dial-menu-horizontal');
    if (speedDialButton && speedDialMenu) {
        speedDialMenu.classList.add('hidden');
        speedDialButton.setAttribute('aria-expanded', 'false');
        speedDialButton.addEventListener('click', (event) => {
            event.stopPropagation();
            const isExpanded = speedDialButton.getAttribute('aria-expanded') === 'true';
            speedDialButton.setAttribute('aria-expanded', String(!isExpanded));
            speedDialMenu.classList.toggle('hidden');
        });
        document.addEventListener('click', (event) => {
            if (!speedDialButton.contains(event.target) &&
                !speedDialMenu.contains(event.target) &&
                !speedDialMenu.classList.contains('hidden')) {
                speedDialMenu.classList.add('hidden');
                speedDialButton.setAttribute('aria-expanded', 'false');
            }
        });
    }

    const openFormBtn = document.getElementById('openFormBtn');
    const addGroupForm = document.getElementById('myForm');
    const closeBtn = addGroupForm ? addGroupForm.querySelector('.close-form') : null;
    const resetBtn = addGroupForm ? addGroupForm.querySelector('.resetBtn') : null;
    if (addGroupForm) {
        addGroupForm.style.display = 'none';
    }
    if (openFormBtn && addGroupForm) {
        openFormBtn.addEventListener('click', (e) => {
            e.preventDefault();
            addGroupForm.style.display = 'block';
            addGroupForm.scrollTop = 0; // Scroll to top of form
            window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll window to top
            // Hide pagination and its bar when form is open
            const paginationContainer = document.querySelector('.pagination-container');
            if (paginationContainer) paginationContainer.style.display = 'none';
        });
    }
    if (closeBtn) {
        closeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            addGroupForm.style.display = 'none';
            // Show pagination and its bar when form is closed
            const paginationContainer = document.querySelector('.pagination-container');
            if (paginationContainer) paginationContainer.style.display = '';
        });
    }
    if (resetBtn) {
         resetBtn.addEventListener('click', (e) => {
    // Wait for the reset to happen
    setTimeout(() => {
      // Remove focus from any element
      document.activeElement.blur();
            e.preventDefault();
            addGroupForm.style.display = 'block';
            addGroupForm.scrollTop = 0; // Scroll to top of form
            window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll window to top
    }, 0);
  });
    }
    
     document.getElementById('saveTimeButton').addEventListener('click', function () {
    const startTime = document.getElementById('start-time').value;
    const endTime = document.getElementById('end-time').value;

    if (!startTime || !endTime) {
      alert("Please select both start and end times.");
      return;
    }

    if (startTime >= endTime) {
      alert("End time must be after start time.");
      return;
    }

    console.log("Time saved:", startTime, "to", endTime);

    // Optional: hide dropdown after saving
    document.getElementById('dropdownTimepicker').classList.add('hidden');
  });

  

    let allGroups = []; // Store all groups for filtering/sorting
    let filteredGroups = []; // Store filtered groups

    let currentPage = 1;
    const itemsPerPage = 8; // Number of groups to show per page

    // Search functionality
    const searchInput = document.getElementById('default-search');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            applyFiltersAndSearch(searchTerm);
        });
    }

    function applyFiltersAndSearch(searchTerm = '') {
        const subject = document.getElementById('filter-subject')?.value.toLowerCase() || '';
        const dateStart = document.getElementById('filter-date-start')?.value || '';
        const dateEnd = document.getElementById('filter-date-end')?.value || '';
        const seats = document.getElementById('filter-seats')?.value || '';

        filteredGroups = allGroups.filter(group => {
            let matchesSearch = true;
            let matchesSubject = true;
            let matchesDate = true;
            let matchesSeats = true;

            // Search term matching
            if (searchTerm) {
                matchesSearch = group.name.toLowerCase().includes(searchTerm) ||
                              group.subject.toLowerCase().includes(searchTerm) ||
                              group.coverage?.toLowerCase().includes(searchTerm);
            }

            if (subject) {
                matchesSubject = group.subject.toLowerCase().includes(subject);
            }

            if (dateStart && dateEnd) {
                const groupDate = new Date(group.date);
                const start = new Date(dateStart);
                const end = new Date(dateEnd);
                matchesDate = groupDate >= start && groupDate <= end;
            }

            if (seats) {
                matchesSeats = group.seats >= parseInt(seats);
            }

            return matchesSearch && matchesSubject && matchesDate && matchesSeats;
        });

        applySort();
    }

    // Filter form handling
    const filterForm = document.getElementById('filter-form');
    if (filterForm) {
        filterForm.addEventListener('submit', (e) => {
            e.preventDefault();
            applyFiltersAndSearch(searchInput?.value.toLowerCase() || '');
        });

        filterForm.addEventListener('reset', (e) => {
            setTimeout(() => {
                applyFiltersAndSearch(searchInput?.value.toLowerCase() || '');
            }, 0);
        });
    }

    // Sort form handling
    const sortForm = document.getElementById('sort-form');
    if (sortForm) {
        sortForm.addEventListener('submit', (e) => {
            e.preventDefault();
            applySort();
        });
    }

    function applySort() {
        const sortField = document.getElementById('sort-field')?.value || 'date';
        const sortOrder = document.getElementById('sort-order')?.value || 'asc';

        const sortedGroups = [...filteredGroups].sort((a, b) => {
            let comparison = 0;
            switch (sortField) {
                case 'date':
                    comparison = new Date(a.date) - new Date(b.date);
                    break;
                case 'subject':
                    comparison = a.subject.localeCompare(b.subject);
                    break;
                case 'seats':
                    comparison = a.seats - b.seats;
                    break;
            }
            return sortOrder === 'desc' ? -comparison : comparison;
        });

        renderGroups(sortedGroups);
    }

    function renderGroups(groups) {
        const groupList = document.querySelector('.study-group-list');
        if (!groupList) return;

        // Keep the "Add Group" button
        const addButton = groupList.querySelector('#openFormBtn').parentElement;
        groupList.innerHTML = '';
        groupList.appendChild(addButton);

        if (groups.length === 0) {
            const emptyDiv = document.createElement('div');
            emptyDiv.textContent = 'No groups found.';
            emptyDiv.className = 'text-gray-600 w-full text-center';
            groupList.appendChild(emptyDiv);
            return;
        }

        // Calculate pagination
        const totalPages = Math.ceil(groups.length / itemsPerPage);
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const currentGroups = groups.slice(startIndex, endIndex);

        // Render current page groups
        currentGroups.forEach(group => {
            const groupDiv = document.createElement('div');
            groupDiv.className = 'w-[215px] max-w-sm h-[204px] bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700 cursor-pointer';
            groupDiv.innerHTML = `
                <img class="rounded-t-lg w-full h-[100px] object-cover" src="https://cdn.vectorstock.com/i/500p/33/40/study-concept-for-banner-design-vector-42473340.jpg" alt="study banner" />
                <div class="p-2">
                    <h6 class="line-clamp-1 mb-0.5 text-sm font-bold tracking-tight text-gray-900 dark:text-white">${group.name}</h6>
                    <div class="m-0.5 flex relative flex-col items-start justify-start">
                        <span class="text-xs font-normal text-gray-700 dark:text-gray-400">${group.subject}</span>
                        <div>
                            <span class="text-xs font-normal text-gray-700 dark:text-gray-400">${group.date}</span>
                            <span class="text-xs font-normal text-gray-700 dark:text-gray-400">${group.startTime}-${group.endTime}</span>
                        </div>
                        <span class="text-xs font-normal text-gray-700 dark:text-gray-400">${group.seats} Seats Available</span>
                    </div>
                </div>
            `;
            groupDiv.addEventListener('click', () => {
                window.location.href = `study-group-001.html?id=${group.id}`;
            });
            groupList.appendChild(groupDiv);
        });

        // Update pagination UI
        updatePagination(totalPages);
    }

    function updatePagination(totalPages) {
        const paginationList = document.querySelector('nav[aria-label="Page navigation example"] ul');
        if (!paginationList) return;

        paginationList.innerHTML = '';

        // Previous button
        const prevDisabled = currentPage === 1;
        paginationList.innerHTML += `
            <li>
                <button onclick="changePage(${currentPage - 1}, ${totalPages})" 
                    class="flex items-center justify-center px-3 h-8 ms-0 leading-tight ${prevDisabled ? 'text-gray-500 cursor-not-allowed' : 'text-gray-500 hover:text-white'} bg-transparent border border-gray-300 rounded-s-lg ${prevDisabled ? '' : 'hover:bg-gray-700'} dark:border-gray-700 dark:text-gray-400" 
                    ${prevDisabled ? 'disabled' : ''}>
                    <span class="sr-only">Previous</span>
                    <svg class="w-2.5 h-2.5 rtl:rotate-180" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 1 1 5l4 4"/>
                    </svg>
                </button>
            </li>
        `;

        // Page numbers
        for (let i = 1; i <= totalPages; i++) {
            const isActive = currentPage === i;
            paginationList.innerHTML += `
                <li>
                    <button onclick="changePage(${i}, ${totalPages})" 
                        class="flex items-center justify-center px-3 h-8 leading-tight ${isActive ? 'text-blue-600 bg-blue-50 dark:bg-gray-700 dark:text-white' : 'text-gray-500 hover:text-white'} bg-transparent border border-gray-300 ${isActive ? '' : 'hover:bg-gray-700'} dark:border-gray-700 dark:text-gray-400">${i}</button>
                </li>
            `;
        }

        // Next button
        const nextDisabled = currentPage === totalPages;
        paginationList.innerHTML += `
            <li>
                <button onclick="changePage(${currentPage + 1}, ${totalPages})" 
                    class="flex items-center justify-center px-3 h-8 leading-tight ${nextDisabled ? 'text-gray-500 cursor-not-allowed' : 'text-gray-500 hover:text-white'} bg-transparent border border-gray-300 rounded-e-lg ${nextDisabled ? '' : 'hover:bg-gray-700'} dark:border-gray-700 dark:text-gray-400" 
                    ${nextDisabled ? 'disabled' : ''}>
                    <span class="sr-only">Next</span>
                    <svg class="w-2.5 h-2.5 rtl:rotate-180" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 9 4-4-4-4"/>
                    </svg>
                </button>
            </li>
        `;
    }

    // Add this function to the global scope
    window.changePage = function(newPage, totalPages) {
        if (newPage >= 1 && newPage <= totalPages) {
            currentPage = newPage;
            renderGroups(filteredGroups);
        }
    };

    // Fetch and initialize groups
    const groupList = document.querySelector('.study-group-list');
    if (groupList) {
        // Remove all group cards except the add button
        Array.from(groupList.children).forEach(child => {
            if (!child.querySelector('#openFormBtn')) {
                child.remove();
            }
        });
        
        // Show loading state
        const loadingDiv = document.createElement('div');
        loadingDiv.textContent = 'Loading...';
        loadingDiv.className = 'text-center w-full';
        groupList.appendChild(loadingDiv);

        fetch('groups.json')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(groups => {
                loadingDiv.remove();
                allGroups = groups;
                filteredGroups = [...groups];
                renderGroups(groups);
            })
            .catch(error => {
                loadingDiv.textContent = `Failed to load groups: ${error.message}`;
                loadingDiv.className = 'text-red-600 w-full text-center';
            });
    }
});