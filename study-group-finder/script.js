import { fetchGroups, fetchSubjects, fetchLocations, fetchStudents, createGroup, createSubject, createLocation, createStudent, updateGroup, updateSubject, updateLocation, updateStudent, deleteGroup, deleteSubject, deleteLocation, deleteStudent} from './api.js';  // Adjust the path based on your project structure
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
        selectedFiles = []; // Clear the selected files array
  input.value = ''; // Reset the file input
  renderPreview(); // Clear the preview
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

fetchSubjects().then(allSubjects => {
  // Map the subjects to fit TomSelect's structure
  const mappedSubjects = allSubjects.map(subject => ({
    id: subject.id,           // ID of the subject
    text: subject.code        // Code of the subject to display
  }));

  new TomSelect("#group-subject", {
    valueField: "id",        // 'id' will be used as the value
    labelField: "text",      // 'text' is what will be shown in the dropdown
    searchField: "text",     // Search will be based on the 'text' field (subject code)
    maxItems: 1,             // Only allow one selection
    preload: true,
    load: function(query, callback) {
      if (!query.length) return callback(mappedSubjects.slice(0, 50));  // Return first 50 if no query

      // Filter subjects based on the search query
      const filtered = mappedSubjects.filter(subject =>
        subject.text.toLowerCase().includes(query.toLowerCase())
      );

      callback(filtered);
    },
    plugins: ['dropdown_input']
  });
});

fetchLocations().then(allLocations => {
  // Map the locations to fit TomSelect's structure
  const mappedLocations = allLocations.map(location => ({
    id: location.id,
    text: location.name      // Assuming locations have a 'name' property
  }));

  new TomSelect("#group-location", {  // Make sure you have an input with id="group-location"
    valueField: "id",
    labelField: "text",
    searchField: "text",
    maxItems: 1,
    preload: true,
    load: function(query, callback) {
      if (!query.length) return callback(mappedLocations.slice(0, 50));

      const filtered = mappedLocations.filter(location =>
        location.text.toLowerCase().includes(query.toLowerCase())
      );

      callback(filtered);
    },
    plugins: ['dropdown_input']
  });
});


const input = document.getElementById('dropzone-file');
const dropzone = document.getElementById('dropzone');
const preview = document.getElementById('file-preview');
let selectedFiles = [];

function renderPreview() {
  preview.innerHTML = '';

  selectedFiles.forEach((file, index) => {
    const fileDiv = document.createElement('div');
    fileDiv.className = 'relative group flex flex-col items-center text-center';

    // Remove button
    const removeBtn = document.createElement('button');
    removeBtn.className = 'absolute top-0 right-0 text-white bg-red-500 hover:bg-red-600 rounded-full text-xs p-1 z-10 hidden group-hover:block';
    removeBtn.innerText = '×';
    removeBtn.onclick = () => {
      selectedFiles.splice(index, 1);
      renderPreview();
    };
    fileDiv.appendChild(removeBtn);

    if (file.type.startsWith('image/')) {
      // Show image thumbnail
      const img = document.createElement('img');
      img.src = URL.createObjectURL(file);
      img.className = 'w-14 h-14 object-cover rounded shadow border';
      fileDiv.appendChild(img);
    } else {
      // Use icon for non-image files
      const icon = document.createElement('div');
      icon.className = 'w-14 h-14 flex items-center justify-center bg-gray-200 text-gray-600 rounded shadow border text-sm font-bold';
      icon.innerText = getFileExtension(file.name).toUpperCase();
      fileDiv.appendChild(icon);
    }

    // Filename (below preview)
    const label = document.createElement('p');
    label.textContent = file.name.length > 20 ? file.name.slice(0, 17) + '...' : file.name;
    label.className = 'text-[10px] text-gray-700 dark:text-gray-300 mt-1 break-words w-14';
    fileDiv.appendChild(label);

    preview.appendChild(fileDiv);
  });
}

function getFileExtension(filename) {
  return filename.split('.').pop();
}


function addFiles(fileList) {
  for (const file of fileList) {
    const exists = selectedFiles.some(f => f.name === file.name && f.size === file.size);
    if (!exists) {
      selectedFiles.push(file);
    }
  }
  renderPreview();
}

input.addEventListener('change', (e) => addFiles(e.target.files));

dropzone.addEventListener('dragover', (e) => {
  e.preventDefault();
  dropzone.classList.add('ring-2', 'ring-blue-500');
});

dropzone.addEventListener('dragleave', () => {
  dropzone.classList.remove('ring-2', 'ring-blue-500');
});

dropzone.addEventListener('drop', (e) => {
  e.preventDefault();
  dropzone.classList.remove('ring-2', 'ring-blue-500');
  addFiles(e.dataTransfer.files);
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
    const addButton = groupList.querySelector('#openFormBtn')?.parentElement;
    groupList.innerHTML = '';
    if (addButton) groupList.appendChild(addButton);

    if (groups.length === 0) {
        const emptyDiv = document.createElement('div');
        emptyDiv.textContent = 'No groups found.';
        emptyDiv.className = 'text-gray-600 w-full text-center';
        groupList.appendChild(emptyDiv);
        return;
    }

    const transformedGroups = groups.map(group => {
        // Format dates
        const startDate = group.start_date ? formatDate(group.start_date) : null;
        const endDate = group.end_date ? formatDate(group.end_date) : null;
        
        // Determine date display
        let dateDisplay;
        if (!startDate && !endDate) {
            dateDisplay = 'No dates specified';
        } else if (startDate && !endDate) {
            dateDisplay = `Starts: ${startDate}`;
        } else if (!startDate && endDate) {
            dateDisplay = `Ends: ${endDate}`;
        } else if (startDate === endDate) {
            dateDisplay = startDate;
        } else {
            dateDisplay = `${startDate} - ${endDate}`;
        }

        // Determine time display - FIXED THIS SECTION
        let timeDisplay = 'No times specified';
        if (group.start_time || group.end_time) {
            const startTime = group.start_time ? formatTime(group.start_time) : '--:--';
            const endTime = group.end_time ? formatTime(group.end_time) : '--:--';
            timeDisplay = `${startTime} - ${endTime}`;
        }

        return {
            id: group.id,
            name: group.name,
            subject: group.subject_id ? getSubjectName(group.subject_id) : 'No subject specified',
            dateDisplay: dateDisplay,
            timeDisplay: timeDisplay,
            seats: group.members_quantity_limit ?? 0
        };
    });

    const totalPages = Math.ceil(transformedGroups.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentGroups = transformedGroups.slice(startIndex, endIndex);

    currentGroups.forEach(group => {
        const groupDiv = document.createElement('div');
        groupDiv.className = 'group w-[215px] max-w-sm h-[204px] bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700 cursor-pointer hover:bg-blue-700 dark:hover:bg-gray-700 hover:text-white dark:hover:text-white transition duration-300';
        groupDiv.innerHTML = `
            <img class="rounded-t-lg w-full h-[100px] object-cover" src="https://cdn.vectorstock.com/i/500p/33/40/study-concept-for-banner-design-vector-42473340.jpg" alt="study banner" />
            <div class="p-2">
                <h6 class="line-clamp-1 mb-0.5 text-sm font-bold tracking-tight text-gray-900 dark:text-white group-hover:text-white">${group.name}</h6>
                <div class="m-0.5 flex relative flex-col items-start justify-start space-y-1">
                    <span class="text-xs font-normal text-gray-700 dark:text-gray-400 group-hover:text-white">${group.subject}</span>
                    <span class="text-xs font-normal text-gray-700 dark:text-gray-400 group-hover:text-white">${group.dateDisplay}</span>
                    <span class="text-xs font-normal text-gray-700 dark:text-gray-400 group-hover:text-white">${group.timeDisplay}</span>
                    <span class="text-xs font-normal text-gray-700 dark:text-gray-400 group-hover:text-white">${group.seats} Seats Available</span>
                </div>
            </div>
        `;
        groupDiv.addEventListener('click', () => {
            window.location.href = `study-group-001.html?id=${group.id}`;
        });
        groupList.appendChild(groupDiv);
    });

    updatePagination(totalPages);
}

// Helper function to get subject name from ID (you'll need to implement this)
function getSubjectName(subjectId) {
    // You'll need to implement this based on how you store subject data
    // This could be a lookup in an array or an API call
    return `Subject ${subjectId}`; // Placeholder implementation
}

function formatDate(dateString) {
    if (!dateString) return null;
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

function formatTime(timeString) {
    if (!timeString) return null;
    // Ensure the time is in HH:MM format
    if (typeof timeString === 'string') {
        return timeString.length >= 5 ? timeString.substring(0, 5) : timeString;
    }
    // If it's a time object, you might need to format it differently
    return timeString;
}

function updatePagination(totalPages) {
    const paginationList = document.querySelector('nav[aria-label="Page navigation example"] ul');
    if (!paginationList) return;

    paginationList.innerHTML = '';

    const prevDisabled = currentPage === 1;
    paginationList.innerHTML += `
        <li>
            <button onclick="changePage(${currentPage - 1}, ${totalPages})" 
                class="flex items-center justify-center px-3 h-8 ms-0 leading-tight ${prevDisabled ? 'text-gray-500 cursor-not-allowed' : 'text-gray-500 hover:text-white'} bg-transparent border border-gray-300 rounded-s-lg ${prevDisabled ? '' : 'dark:hover:bg-gray-700 hover:bg-blue-600'} dark:border-gray-700 dark:text-gray-400" 
                ${prevDisabled ? 'disabled' : ''}>
                <span class="sr-only">Previous</span>
                <svg class="w-2.5 h-2.5 rtl:rotate-180" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 1 1 5l4 4"/></svg>
            </button>
        </li>
    `;

    for (let i = 1; i <= totalPages; i++) {
        const isActive = currentPage === i;
        paginationList.innerHTML += `
            <li>
                <button onclick="changePage(${i}, ${totalPages})" 
                    class="flex items-center justify-center px-3 h-8 leading-tight ${isActive ? 'text-blue-600 bg-blue-100 dark:bg-gray-700 dark:text-white' : 'text-gray-500 hover:text-white'} bg-transparent border border-gray-300 ${isActive ? '' : 'dark:hover:bg-gray-700 hover:bg-blue-600'} dark:border-gray-700 dark:text-gray-400">${i}</button>
            </li>
        `;
    }

    const nextDisabled = currentPage === totalPages;
    paginationList.innerHTML += `
        <li>
            <button onclick="changePage(${currentPage + 1}, ${totalPages})" 
                class="flex items-center justify-center px-3 h-8 ms-0 leading-tight ${nextDisabled ? 'text-gray-500 cursor-not-allowed' : 'text-gray-500 hover:text-white'} bg-transparent border border-gray-300 rounded-e-lg ${nextDisabled ? '' : 'dark:hover:bg-gray-700 hover:bg-blue-600'} dark:border-gray-700 dark:text-gray-400"
                ${nextDisabled ? 'disabled' : ''}>
                <span class="sr-only">Next</span>
                <svg class="w-2.5 h-2.5 rtl:rotate-180" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 9 4-4-4-4"/></svg>
            </button>
        </li>
    `;
}

window.changePage = function(newPage, totalPages) {
    if (newPage >= 1 && newPage <= totalPages) {
        currentPage = newPage;
        renderGroups(filteredGroups);
    }
};

// Initial fetch logic
const groupList = document.querySelector('.study-group-list');
if (groupList) {
    Array.from(groupList.children).forEach(child => {
        if (!child.querySelector('#openFormBtn')) {
            child.remove();
        }
    });

    const loadingDiv = document.createElement('div');
    loadingDiv.textContent = 'Loading...';
    loadingDiv.className = 'text-center w-full';
    groupList.appendChild(loadingDiv);

    fetchGroups()
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