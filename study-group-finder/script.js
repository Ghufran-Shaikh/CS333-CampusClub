import {
  fetchGroups, fetchSubjects, fetchLocations,
  createGroup, deleteGroup
} from './api.js';

// ─── State for mappings ───────────────────────────────────────────────────────
let subjectMap = {};   // id => subject code
let locationMap = {};  // id => location code

// ─── Theme toggle ─────────────────────────────────────────────────────────────
function initThemeToggle() {
  const themeToggle = document.getElementById('theme-toggle');
  if (!themeToggle) return;

  themeToggle.addEventListener('click', () => {
    const html = document.documentElement;
    const isDark = html.classList.toggle('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  });
}

// ─── Toast ────────────────────────────────────────────────────────────────────
function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const colors = {
    success: 'bg-green-500',
    error:   'bg-red-500',
    info:    'bg-blue-500',
  };
  const toast = document.createElement('div');
  toast.className = `pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-lg text-white text-sm shadow-lg ${colors[type] ?? colors.info} transition-all duration-300 opacity-0 translate-y-2`;
  toast.textContent = message;
  container.appendChild(toast);
  requestAnimationFrame(() => {
    toast.classList.remove('opacity-0', 'translate-y-2');
  });
  setTimeout(() => {
    toast.classList.add('opacity-0', 'translate-y-2');
    toast.addEventListener('transitionend', () => toast.remove());
  }, 3500);
}

// ─── DOM ready ────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {

  // --- Initialize theme toggle ---
  initThemeToggle();
  const openFormBtn  = document.getElementById('openFormBtn');
  const formOverlay  = document.getElementById('myForm');
  const groupForm    = document.getElementById('group-form');
  const paginationEl = document.querySelector('.pagination-container');

  function openForm() {
    formOverlay.style.display = 'block';
    formOverlay.scrollTop = 0;
    if (paginationEl) paginationEl.style.display = 'none';
  }

  function closeForm() {
    formOverlay.style.display = 'none';
    if (paginationEl) paginationEl.style.display = '';
  }

  if (openFormBtn) openFormBtn.addEventListener('click', openForm);

  formOverlay?.querySelectorAll('.close-form').forEach(btn =>
    btn.addEventListener('click', closeForm)
  );

  // Close on overlay click (outside the form card)
  formOverlay?.addEventListener('click', (e) => {
    if (e.target === formOverlay) closeForm();
  });

  // Reset button – keep form open
  groupForm?.querySelector('.resetBtn')?.addEventListener('click', () => {
    setTimeout(() => {
      selectedFiles = [];
      if (input) input.value = '';
      renderPreview();
    }, 0);
  });

  // --- Save time button ---
  document.getElementById('saveTimeButton')?.addEventListener('click', () => {
    const start = document.getElementById('start-time')?.value;
    const end   = document.getElementById('end-time')?.value;
    if (!start || !end) { showToast('Please select both start and end times.', 'error'); return; }
    if (start >= end)   { showToast('End time must be after start time.', 'error'); return; }
    document.getElementById('time-display').textContent = `${start} – ${end}`;
    document.getElementById('dropdownTimepicker')?.classList.add('hidden');
    showToast(`Time set: ${start} – ${end}`, 'success');
  });

  // --- TomSelect: subjects ---
  fetchSubjects().then(allSubjects => {
    // Build subject map
    subjectMap = {};
    allSubjects.forEach(s => { subjectMap[s.id] = s.code; });
    
    const mapped = allSubjects.map(s => ({ id: s.id, text: s.code }));
    [['#group-subject', 'Search subjects…'], ['#filter-subject', 'All subjects']].forEach(([sel, ph]) => {
      const el = document.querySelector(sel);
      if (!el) return;
      new TomSelect(el, {
        valueField: 'id', labelField: 'text', searchField: 'text',
        maxItems: 1, preload: true, placeholder: ph,
        load: (q, cb) => cb(q ? mapped.filter(s => s.text.toLowerCase().includes(q.toLowerCase())) : mapped.slice(0, 50)),
        plugins: ['dropdown_input'],
      });
    });
    // Re-render groups after mappings are loaded
    if (allGroups.length > 0) {
      renderGroups(filteredGroups);
    }
  }).catch(() => showToast('Could not load subjects.', 'error'));

  // --- TomSelect: locations ---
  fetchLocations().then(allLocations => {
    // Build location map
    locationMap = {};
    allLocations.forEach(l => { locationMap[l.id] = l.code; });
    
    const mapped = allLocations.map(l => ({ id: l.id, text: l.code }));
    [['#group-location', 'Search locations…'], ['#filter-location', 'All locations']].forEach(([sel, ph]) => {
      const el = document.querySelector(sel);
      if (!el) return;
      new TomSelect(el, {
        valueField: 'id', labelField: 'text', searchField: 'text',
        maxItems: 1, preload: true, placeholder: ph,
        load: (q, cb) => cb(q ? mapped.filter(l => l.text.toLowerCase().includes(q.toLowerCase())) : mapped.slice(0, 50)),
        plugins: ['dropdown_input'],
      });
    });
    // Re-render groups after mappings are loaded
    if (allGroups.length > 0) {
      renderGroups(filteredGroups);
    }
  }).catch(() => showToast('Could not load locations.', 'error'));

  // --- File dropzone ---
  const input    = document.getElementById('dropzone-file');
  const dropzone = document.getElementById('dropzone');
  const preview  = document.getElementById('file-preview');
  let selectedFiles = [];

  function renderPreview() {
    if (!preview) return;
    preview.innerHTML = '';
    selectedFiles.forEach((file, index) => {
      const wrap = document.createElement('div');
      wrap.className = 'relative group flex flex-col items-center text-center pointer-events-auto';

      const removeBtn = document.createElement('button');
      removeBtn.type = 'button';
      removeBtn.className = 'absolute -top-1 -right-1 bg-red-500 hover:bg-red-600 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs z-10 hidden group-hover:flex';
      removeBtn.textContent = '×';
      removeBtn.onclick = () => { selectedFiles.splice(index, 1); renderPreview(); };
      wrap.appendChild(removeBtn);

      if (file.type.startsWith('image/')) {
        const img = document.createElement('img');
        img.src = URL.createObjectURL(file);
        img.className = 'w-12 h-12 object-cover rounded shadow border';
        wrap.appendChild(img);
      } else {
        const icon = document.createElement('div');
        icon.className = 'w-12 h-12 flex items-center justify-center bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 rounded shadow border text-xs font-bold';
        icon.textContent = file.name.split('.').pop().toUpperCase();
        wrap.appendChild(icon);
      }

      const label = document.createElement('p');
      label.textContent = file.name.length > 16 ? file.name.slice(0, 13) + '…' : file.name;
      label.className = 'text-[9px] text-gray-600 dark:text-gray-400 mt-0.5 w-12 truncate';
      wrap.appendChild(label);

      preview.appendChild(wrap);
    });
  }

  function addFiles(fileList) {
    for (const file of fileList) {
      if (!selectedFiles.some(f => f.name === file.name && f.size === file.size)) {
        selectedFiles.push(file);
      }
    }
    renderPreview();
  }

  input?.addEventListener('change', e => addFiles(e.target.files));
  dropzone?.addEventListener('dragover', e => { e.preventDefault(); dropzone.classList.add('border-blue-400', 'bg-blue-50', 'dark:bg-blue-900/20'); });
  dropzone?.addEventListener('dragleave', () => dropzone.classList.remove('border-blue-400', 'bg-blue-50', 'dark:bg-blue-900/20'));
  dropzone?.addEventListener('drop', e => { e.preventDefault(); dropzone.classList.remove('border-blue-400', 'bg-blue-50', 'dark:bg-blue-900/20'); addFiles(e.dataTransfer.files); });

  // --- Group form submit ---
  groupForm?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name     = document.getElementById('group-name')?.value.trim();
    const subject  = document.getElementById('group-subject')?.value;
    const location = document.getElementById('group-location')?.value;

    if (!name)     { showToast('Please enter a group name.', 'error'); return; }
    if (!subject)  { showToast('Please select a subject.', 'error'); return; }
    if (!location) { showToast('Please select a location.', 'error'); return; }

    const startDate = document.getElementById('datepicker-range-start')?.value;
    const endDate   = document.getElementById('datepicker-range-end')?.value;
    const startTime = document.getElementById('start-time')?.value;
    const endTime   = document.getElementById('end-time')?.value;

    // Gender constraint
    const femaleChecked = document.getElementById('inline-checkbox')?.checked;
    const maleChecked   = document.getElementById('inline-2-checkbox')?.checked;
    let genderSet = 'both';
    if (femaleChecked && !maleChecked) genderSet = 'female';
    else if (maleChecked && !femaleChecked) genderSet = 'male';

    const group = {
      name,
      subject,
      location,
      coverage:               document.getElementById('group-coverage')?.value.trim() || null,
      start_date:             startDate || null,
      end_date:               endDate   || null,
      start_time:             startTime || null,
      end_time:               endTime   || null,
      repetition:             document.getElementById('group-session-repetition')?.value.trim() || null,
      gender_set:             genderSet,
      members_quantity_limit: parseInt(document.getElementById('quantity-limit')?.value) || 5,
      agenda:                 document.getElementById('agenda')?.value.trim() || null,
    };

    const submitBtn     = document.getElementById('submit-btn');
    const submitSpinner = document.getElementById('submit-spinner');
    if (submitBtn)     submitBtn.disabled = true;
    if (submitSpinner) submitSpinner.classList.remove('hidden');

    try {
      await createGroup(group);
      showToast('Study group created successfully!', 'success');
      groupForm.reset();
      selectedFiles = [];
      renderPreview();
      closeForm();
      // Reload groups list
      const groups = await fetchGroups();
      allGroups = groups;
      filteredGroups = [...groups];
      currentPage = 1;
      applyFiltersAndSearch();
    } catch (err) {
      showToast('Failed to create group. Please try again.', 'error');
      console.error(err);
    } finally {
      if (submitBtn)     submitBtn.disabled = false;
      if (submitSpinner) submitSpinner.classList.add('hidden');
    }
  });

  // --- Search ---
  const searchInput = document.getElementById('default-search');
  searchInput?.addEventListener('input', e => applyFiltersAndSearch(e.target.value.toLowerCase()));

  // --- Filter form ---
  const filterForm = document.getElementById('filter-form');
  filterForm?.addEventListener('submit', e => {
    e.preventDefault();
    applyFiltersAndSearch(searchInput?.value.toLowerCase() || '');
  });
  filterForm?.addEventListener('reset', () => {
    setTimeout(() => applyFiltersAndSearch(''), 0);
  });

  // ─── State ──────────────────────────────────────────────────────────────────
  let allGroups      = [];
  let filteredGroups = [];
  let currentPage    = 1;
  const itemsPerPage = 8;

  function applyFiltersAndSearch(searchTerm = searchInput?.value.toLowerCase() || '') {
    const subject     = document.getElementById('filter-subject')?.value || '';
    const location    = document.getElementById('filter-location')?.value || '';
    const coverage    = document.getElementById('filter-coverage')?.value.trim().toLowerCase() || '';
    const dateStart   = document.getElementById('filter-date-start')?.value || '';
    const dateEnd     = document.getElementById('filter-date-end')?.value || '';
    const timeStart   = document.getElementById('filter-time-start')?.value || '';
    const timeEnd     = document.getElementById('filter-time-end')?.value || '';
    const repetition  = document.getElementById('filter-repetition')?.value.trim().toLowerCase() || '';
    const genderF     = document.getElementById('filter-gender-female')?.checked;
    const genderM     = document.getElementById('filter-gender-male')?.checked;
    const membersLim  = document.getElementById('filter-members-limit')?.value || '';

    filteredGroups = allGroups.filter(g => {
      if (searchTerm && !(g.name || '').toLowerCase().includes(searchTerm)) return false;
      if (subject  && String(g.subject_id) !== subject)  return false;
      if (location && String(g.location_id) !== location) return false;
      if (coverage && !(g.coverage || '').toLowerCase().includes(coverage)) return false;
      if (dateStart && dateEnd) {
        const d = g.start_date ? new Date(g.start_date) : null;
        if (!d || d < new Date(dateStart) || d > new Date(dateEnd)) return false;
      }
      if (timeStart && timeEnd && g.start_time) {
        if (g.start_time < timeStart || g.start_time > timeEnd) return false;
      }
      if (repetition && !(g.repetition || '').toLowerCase().includes(repetition)) return false;
      if (genderF && !genderM && g.gender !== 'female') return false;
      if (genderM && !genderF && g.gender !== 'male')   return false;
      if (membersLim) {
        const limit = g.members_quantity_limit ?? g.seats ?? 0;
        const apiCount   = Array.isArray(g.members) ? g.members.length : 0;
        const localCount = JSON.parse(localStorage.getItem(`local_members_${g.id}`) || '[]').length;
        const seats = Math.max(0, Number(limit) - apiCount - localCount);
        if (seats < parseInt(membersLim)) return false;
      }
      return true;
    });

    currentPage = 1;
    applySort();
  }

  function applySort() {
    const field = document.getElementById('sort-field')?.value || 'date';
    const order = document.getElementById('sort-order')?.value || 'asc';

    const sorted = [...filteredGroups].sort((a, b) => {
      let cmp = 0;
      if (field === 'date') {
        cmp = new Date(a.start_date || 0) - new Date(b.start_date || 0);
      } else if (field === 'subject') {
        cmp = String(a.subject_id || '').localeCompare(String(b.subject_id || ''));
      } else if (field === 'location') {
        cmp = String(a.location_id || '').localeCompare(String(b.location_id || ''));
      } else if (field === 'membersLimit') {
        cmp = (a.members_quantity_limit ?? 0) - (b.members_quantity_limit ?? 0);
      }
      return order === 'desc' ? -cmp : cmp;
    });

    renderGroups(sorted);
  }

  // ─── Render ─────────────────────────────────────────────────────────────────
  function formatDate(str) {
    if (!str) return null;
    const d = new Date(str);
    if (isNaN(d)) return null;
    return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  }

  function renderGroups(groups) {
    const list = document.querySelector('.study-group-list');
    if (!list) return;

    const addBtn = list.querySelector('#openFormBtn')?.parentElement;
    list.innerHTML = '';
    if (addBtn) list.appendChild(addBtn);

    const emptyState = document.getElementById('empty-state');

    if (groups.length === 0) {
      if (emptyState) emptyState.style.display = 'flex';
      updatePagination(0);
      return;
    }
    if (emptyState) emptyState.style.display = 'none';

    const totalPages = Math.ceil(groups.length / itemsPerPage);
    const pageGroups = groups.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    pageGroups.forEach(group => {
      const startDate = formatDate(group.start_date);
      const endDate   = formatDate(group.end_date);
      let dateDisplay = 'No date set';
      if (startDate && endDate && startDate !== endDate) dateDisplay = `${startDate} – ${endDate}`;
      else if (startDate) dateDisplay = startDate;
      else if (endDate)   dateDisplay = endDate;

      const limit = group.members_quantity_limit ?? group.seats ?? 0;
      const apiMemberCount   = Array.isArray(group.members) ? group.members.length : 0;
      const localMemberCount = JSON.parse(localStorage.getItem(`local_members_${group.id}`) || '[]').length;
      const taken = apiMemberCount + localMemberCount;
      const seats = Math.max(0, Number(limit) - taken);

      const card = document.createElement('div');
      card.className = 'group w-full bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700 cursor-pointer hover:shadow-md hover:border-blue-400 dark:hover:border-blue-500 transition-all duration-200 overflow-hidden flex flex-col';
      card.setAttribute('role', 'button');
      card.setAttribute('tabindex', '0');
      card.setAttribute('aria-label', `Open group: ${group.name}`);
      card.innerHTML = `
        <img class="w-full h-[90px] object-cover" src="https://cdn.vectorstock.com/i/500p/33/40/study-concept-for-banner-design-vector-42473340.jpg" alt="" loading="lazy">
        <div class="p-2.5 flex flex-col flex-1 justify-between">
          <h6 class="line-clamp-1 text-sm font-bold text-gray-900 dark:text-white mb-1">${escapeHtml(group.name)}</h6>
          <div class="space-y-0.5">
            <p class="text-xs text-gray-600 dark:text-gray-300 font-medium line-clamp-1 bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded">${escapeHtml(subjectMap[group.subject_id] || String(group.subject_id || '—'))}</p>
            <p class="text-xs text-gray-600 dark:text-gray-300 font-medium line-clamp-1 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">${escapeHtml(locationMap[group.location_id] || String(group.location_id || '—'))}</p>
            <p class="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">${escapeHtml(dateDisplay)}</p>
            <p class="text-xs font-medium ${seats > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}">${seats > 0 ? `${seats} / ${limit} seat${limit !== 1 ? 's' : ''} available` : 'Full'}</p>
          </div>
        </div>
      `;
      const navigate = () => window.location.href = `study-group-001.html?id=${group.id}`;
      card.addEventListener('click', navigate);
      card.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') navigate(); });
      list.appendChild(card);
    });

    updatePagination(totalPages);
  }

  function escapeHtml(str) {
    const d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
  }

  function updatePagination(totalPages) {
    const ul = document.querySelector('.pagination-container nav ul');
    if (!ul) return;
    ul.innerHTML = '';

    if (totalPages <= 1) return;

    const prevBtn = makePageBtn('‹', currentPage - 1, totalPages, currentPage === 1);
    prevBtn.setAttribute('aria-label', 'Previous page');
    ul.appendChild(prevBtn);

    for (let i = 1; i <= totalPages; i++) {
      ul.appendChild(makePageBtn(String(i), i, totalPages, false, i === currentPage));
    }

    const nextBtn = makePageBtn('›', currentPage + 1, totalPages, currentPage === totalPages);
    nextBtn.setAttribute('aria-label', 'Next page');
    ul.appendChild(nextBtn);
  }

  function makePageBtn(label, page, total, disabled, active = false) {
    const li = document.createElement('li');
    const btn = document.createElement('button');
    btn.textContent = label;
    btn.className = [
      'flex items-center justify-center w-8 h-8 rounded-lg text-sm font-medium transition-colors',
      active   ? 'bg-blue-600 text-white'                                                  : '',
      disabled ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'                    : '',
      !active && !disabled ? 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700' : '',
    ].join(' ');
    btn.disabled = disabled;
    btn.addEventListener('click', () => {
      if (page >= 1 && page <= total) {
        currentPage = page;
        applySort();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
    li.appendChild(btn);
    return li;
  }

  // ─── Initial load ───────────────────────────────────────────────────────────
  const groupList = document.querySelector('.study-group-list');
  if (groupList) {
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'col-span-full flex items-center justify-center gap-2 text-gray-500 dark:text-gray-400 py-12';
    loadingDiv.innerHTML = `<svg class="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg> Loading groups…`;
    groupList.appendChild(loadingDiv);

    fetchGroups()
      .then(groups => {
        loadingDiv.remove();
        allGroups = groups;
        filteredGroups = [...groups];
        renderGroups(groups);
      })
      .catch(err => {
        loadingDiv.innerHTML = `<span class="text-red-500">Failed to load groups: ${err.message}</span>`;
      });
  }

  // ─── Profile ────────────────────────────────────────────────────────────────
  const PROFILE_KEY = 'campusclub_profile';

  function getInitials(first, last) {
    const f = (first || '').trim()[0] || '';
    const l = (last  || '').trim()[0] || '';
    return (f + l).toUpperCase() || '?';
  }

  function updateAvatarDisplay(profile) {
    const initials = getInitials(profile?.firstName, profile?.lastName);
    const navBtn   = document.getElementById('profile-avatar-initials');
    const modalAvatar = document.getElementById('profile-modal-avatar');
    if (navBtn) navBtn.textContent = initials;
    if (modalAvatar) modalAvatar.textContent = initials;
  }

  function openProfileModal() {
    const modal = document.getElementById('profileModal');
    if (!modal) return;
    // Populate fields from saved profile
    const profile = JSON.parse(localStorage.getItem(PROFILE_KEY) || '{}');
    document.getElementById('profile-first-name').value = profile.firstName || '';
    document.getElementById('profile-last-name').value  = profile.lastName  || '';
    document.getElementById('profile-email').value      = profile.email     || '';
    document.getElementById('profile-major').value      = profile.major     || '';
    document.getElementById('profile-year').value       = profile.year      || '';
    document.getElementById('profile-bio').value        = profile.bio       || '';
    updateAvatarDisplay(profile);
    modal.style.display = 'flex';
    document.getElementById('profile-first-name').focus();
  }

  function closeProfileModal() {
    const modal = document.getElementById('profileModal');
    if (modal) modal.style.display = 'none';
  }

  // Open
  document.getElementById('profile-btn')?.addEventListener('click', openProfileModal);
  // Close buttons
  document.getElementById('closeProfileBtn')?.addEventListener('click',  closeProfileModal);
  document.getElementById('closeProfileBtn2')?.addEventListener('click', closeProfileModal);
  // Click outside
  document.getElementById('profileModal')?.addEventListener('click', e => {
    if (e.target === document.getElementById('profileModal')) closeProfileModal();
  });

  // Save
  document.getElementById('profile-form')?.addEventListener('submit', e => {
    e.preventDefault();
    const firstName = document.getElementById('profile-first-name').value.trim();
    const lastName  = document.getElementById('profile-last-name').value.trim();
    if (!firstName || !lastName) {
      showToast('First and last name are required.', 'error');
      return;
    }
    const profile = {
      firstName,
      lastName,
      email : document.getElementById('profile-email').value.trim(),
      major : document.getElementById('profile-major').value.trim(),
      year  : document.getElementById('profile-year').value,
      bio   : document.getElementById('profile-bio').value.trim(),
    };
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    updateAvatarDisplay(profile);
    closeProfileModal();
    showToast('Profile saved!', 'success');
  });

  // Clear
  document.getElementById('profile-clear-btn')?.addEventListener('click', () => {
    localStorage.removeItem(PROFILE_KEY);
    updateAvatarDisplay({});
    closeProfileModal();
    showToast('Profile cleared.', 'success');
  });

  // Live avatar preview while typing
  ['profile-first-name', 'profile-last-name'].forEach(id => {
    document.getElementById(id)?.addEventListener('input', () => {
      const first = document.getElementById('profile-first-name').value;
      const last  = document.getElementById('profile-last-name').value;
      const modalAvatar = document.getElementById('profile-modal-avatar');
      if (modalAvatar) modalAvatar.textContent = getInitials(first, last);
    });
  });

  // Initialise avatar from saved profile on page load
  updateAvatarDisplay(JSON.parse(localStorage.getItem(PROFILE_KEY) || '{}'));

  // Ensure modal is closed on page load
  closeProfileModal();

}); // end DOMContentLoaded
