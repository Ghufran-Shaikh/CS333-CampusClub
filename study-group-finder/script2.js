import {
  fetchGroups, fetchSubjects, fetchLocations,
  updateGroup, deleteGroup
} from './api.js';

// ─── State for mappings ───────────────────────────────────────────────────────
let subjectMap = {};
let locationMap = {};

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
  const colors = { success: 'bg-green-500', error: 'bg-red-500', info: 'bg-blue-500' };
  const toast = document.createElement('div');
  toast.className = `pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-lg text-white text-sm shadow-lg ${colors[type] ?? colors.info} transition-all duration-300 opacity-0 translate-y-2`;
  toast.textContent = message;
  container.appendChild(toast);
  requestAnimationFrame(() => toast.classList.remove('opacity-0', 'translate-y-2'));
  setTimeout(() => {
    toast.classList.add('opacity-0', 'translate-y-2');
    toast.addEventListener('transitionend', () => toast.remove());
  }, 3500);
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getQueryParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

function formatDate(str) {
  if (!str) return '';
  const d = new Date(str);
  if (isNaN(d)) return str;
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

function formatTime(str) {
  if (!str) return '';
  // Handle "HH:MM:SS" or ISO string
  const parts = str.split(':');
  if (parts.length >= 2) {
    const h = parseInt(parts[0]);
    const m = parts[1];
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${h12}:${m} ${ampm}`;
  }
  const d = new Date(str);
  if (!isNaN(d)) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return '';
}

function escapeHtml(str) {
  const d = document.createElement('div');
  d.textContent = String(str ?? '');
  return d.innerHTML;
}

async function fetchGroupById(id) {
  const response = await fetchGroups();
  const groups = Array.isArray(response) ? response : (response?.data || []);
  return groups.find(g => String(g.id) === String(id)) || null;
}

// ─── Join button state helpers (module-scope so both DOMContentLoaded blocks can use them) ──
function setJoinedState(joinBtn) {
  joinBtn.textContent = '✓ Joined';
  joinBtn.dataset.state = 'joined';
  joinBtn.classList.remove('bg-blue-600', 'hover:bg-blue-700', 'dark:bg-blue-600', 'dark:hover:bg-blue-700');
  joinBtn.classList.add('bg-green-600', 'hover:bg-red-600', 'dark:bg-green-600', 'dark:hover:bg-red-600');
  joinBtn.title = 'Click to leave the group';
}

function setUnjoinedState(joinBtn) {
  joinBtn.textContent = 'Join Group';
  joinBtn.dataset.state = 'unjoined';
  joinBtn.classList.remove('bg-green-600', 'hover:bg-red-600', 'dark:bg-green-600', 'dark:hover:bg-red-600');
  joinBtn.classList.add('bg-blue-600', 'hover:bg-blue-700', 'dark:bg-blue-600', 'dark:hover:bg-blue-700');
  joinBtn.title = '';
}

// ─── Members list renderer (module-scope so both DOMContentLoaded blocks can use it) ──
function renderMembersList(apiMembers) {
  const groupId    = getQueryParam('id');
  const joinKey    = `joined_groups_${groupId}`;
  const membersKey = `local_members_${groupId}`;
  const membersList = document.getElementById('members-list');
  if (!membersList) return;
  const localMembers = JSON.parse(localStorage.getItem(membersKey) || '[]');
  const combined = [
    ...(Array.isArray(apiMembers) ? apiMembers : []),
    ...localMembers,
  ];
  if (combined.length === 0) {
    membersList.innerHTML = '<li class="text-gray-400 dark:text-gray-500 italic text-sm">No members listed.</li>';
    return;
  }
  const joinRecord = JSON.parse(localStorage.getItem(joinKey) || '{}');
  const joinedName = joinRecord.userId || null;
  membersList.innerHTML = combined.map(m => {
    const name    = m.name || m;
    const isLocal = m._local === true;
    const isYou   = isLocal && name === joinedName;
    return `
      <li class="flex items-center gap-2">
        <span class="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-300 text-xs font-bold shrink-0">
          ${escapeHtml(name?.[0]?.toUpperCase() || '?')}
        </span>
        <span class="${isYou ? 'font-semibold text-blue-600 dark:text-blue-400' : ''}">${escapeHtml(name)}</span>
        ${isYou ? '<span class="ml-auto text-xs text-blue-400 dark:text-blue-500">(you)</span>' : ''}
      </li>`;
  }).join('');
}

// ─── Seats display ────────────────────────────────────────────────────────────
function updateSeatsDisplay() {
  const el = document.getElementById('side-seats');
  if (!el) return;
  const limit = window._seatsLimit;
  if (limit == null || limit === '—') { el.textContent = '—'; return; }
  const groupId    = getQueryParam('id');
  const membersKey = `local_members_${groupId}`;
  const apiCount   = (window._apiMembers || []).length;
  const localCount = JSON.parse(localStorage.getItem(membersKey) || '[]').length;
  const taken      = apiCount + localCount;
  const remaining  = Math.max(0, Number(limit) - taken);
  el.textContent   = `${remaining} / ${limit}`;
}

// ─── Speed dial ───────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // --- Initialize theme toggle ---
  initThemeToggle();

  const dialBtn  = document.querySelector('[data-dial-toggle]');
  const dialMenu = document.getElementById('speed-dial-menu-horizontal');

  if (dialBtn && dialMenu) {
    dialBtn.addEventListener('click', e => {
      e.stopPropagation();
      const isHidden = dialMenu.style.display === 'none' || dialMenu.style.display === '';
      dialBtn.setAttribute('aria-expanded', String(isHidden));
      dialMenu.style.display = isHidden ? 'flex' : 'none';
      if (isHidden) {
        dialMenu.style.alignItems = 'center';
      }
    });
    document.addEventListener('click', e => {
      if (!dialBtn.contains(e.target) && !dialMenu.contains(e.target)) {
        dialMenu.style.display = 'none';
        dialBtn.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // ─── Star rating ─────────────────────────────────────────────────────────────
  const starContainer = document.getElementById('star-rating');
  const ratingLabel   = document.getElementById('rating-label');
  let currentRating   = 0;
  const labels        = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];

  if (starContainer) {
    for (let i = 1; i <= 5; i++) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'star-btn text-gray-300 dark:text-gray-600 text-2xl leading-none focus:outline-none transition-colors';
      btn.textContent = '★';
      btn.dataset.value = i;
      btn.setAttribute('aria-label', `Rate ${i} star${i > 1 ? 's' : ''}`);
      btn.addEventListener('click', () => {
        currentRating = i;
        updateStars(i);
        if (ratingLabel) ratingLabel.textContent = labels[i];
      });
      btn.addEventListener('mouseenter', () => updateStars(i));
      starContainer.appendChild(btn);
    }
    starContainer.addEventListener('mouseleave', () => updateStars(currentRating));
  }

  function updateStars(rating) {
    if (!starContainer) return;
    starContainer.querySelectorAll('.star-btn').forEach(s => {
      const v = parseInt(s.dataset.value);
      s.classList.toggle('text-yellow-400', v <= rating);
      s.classList.toggle('dark:text-yellow-300', v <= rating);
      s.classList.toggle('text-gray-300', v > rating);
      s.classList.toggle('dark:text-gray-600', v > rating);
    });
  }

  // ─── Char counter ────────────────────────────────────────────────────────────
  const commentInput = document.getElementById('comment-input');
  const charCount    = document.getElementById('char-count');
  commentInput?.addEventListener('input', () => {
    const len = commentInput.value.length;
    if (charCount) charCount.textContent = `${len} / 500`;
  });

  // ─── Comments (localStorage mock) ────────────────────────────────────────────
  const groupId = getQueryParam('id');
  const storageKey = `comments_group_${groupId}`;
  let comments = JSON.parse(localStorage.getItem(storageKey) || '[]');

  function renderComments() {
    const list = document.getElementById('comments-list');
    if (!list) return;
    if (comments.length === 0) {
      list.innerHTML = '<p class="text-sm text-gray-400 dark:text-gray-500 italic">No comments yet. Be the first!</p>';
      return;
    }
    list.innerHTML = comments.map((c, i) => `
      <div class="comment-card flex gap-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
        <div class="shrink-0 w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-300 font-bold text-sm">
          ${escapeHtml(c.author?.[0]?.toUpperCase() || 'A')}
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex items-center justify-between gap-2 mb-1">
            <span class="text-sm font-semibold text-gray-900 dark:text-white">${escapeHtml(c.author || 'Anonymous')}</span>
            <div class="flex items-center gap-2">
              <span class="text-yellow-400 text-sm">${'★'.repeat(c.rating)}${'☆'.repeat(5 - c.rating)}</span>
              <button type="button" data-index="${i}" class="delete-comment text-gray-300 hover:text-red-400 dark:text-gray-600 dark:hover:text-red-400 text-xs transition-colors" aria-label="Delete comment">✕</button>
            </div>
          </div>
          <p class="text-sm text-gray-700 dark:text-gray-300">${escapeHtml(c.text)}</p>
          <p class="text-xs text-gray-400 dark:text-gray-500 mt-1">${c.date}</p>
        </div>
      </div>
    `).join('');

    list.querySelectorAll('.delete-comment').forEach(btn => {
      btn.addEventListener('click', () => {
        comments.splice(parseInt(btn.dataset.index), 1);
        localStorage.setItem(storageKey, JSON.stringify(comments));
        renderComments();
      });
    });
  }

  renderComments();

  document.getElementById('comment-form')?.addEventListener('submit', e => {
    e.preventDefault();
    const text = commentInput?.value.trim();
    if (!text) { showToast('Please write a comment.', 'error'); return; }
    comments.unshift({
      author: 'You',
      text,
      rating: currentRating,
      date: new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
    });
    localStorage.setItem(storageKey, JSON.stringify(comments));
    renderComments();
    if (commentInput) commentInput.value = '';
    if (charCount) charCount.textContent = '0 / 500';
    currentRating = 0;
    updateStars(0);
    if (ratingLabel) ratingLabel.textContent = '';
    showToast('Comment posted!', 'success');
  });

  // ─── Join / Unjoin ────────────────────────────────────────────────────────────
  const PROFILE_KEY   = 'campusclub_profile';
  const joinGroupId   = getQueryParam('id');
  const joinKey       = `joined_groups_${joinGroupId}`;
  const membersKey    = `local_members_${joinGroupId}`;

  function getLocalMembers() {
    return JSON.parse(localStorage.getItem(membersKey) || '[]');
  }

  function saveLocalMembers(list) {
    localStorage.setItem(membersKey, JSON.stringify(list));
  }

  document.getElementById('join-btn')?.addEventListener('click', () => {
    const joinBtn = document.getElementById('join-btn');
    if (!joinBtn) return;

    // ── Unjoin ──
    if (joinBtn.dataset.state === 'joined') {
      const joinRecord = JSON.parse(localStorage.getItem(joinKey) || '{}');
      const joinedName = joinRecord.userId || '';
      const members    = getLocalMembers().filter(m => m.name !== joinedName);
      saveLocalMembers(members);
      localStorage.removeItem(joinKey);
      setUnjoinedState(joinBtn);
      renderMembersList(window._apiMembers || []);
      updateSeatsDisplay();
      showToast('You have left the group.', 'info');
      return;
    }

    // ── Join ──
    // Check if group is full
    if (window._seatsLimit != null) {
      const membersKey2 = `local_members_${joinGroupId}`;
      const taken = (window._apiMembers || []).length + JSON.parse(localStorage.getItem(membersKey2) || '[]').length;
      if (taken >= Number(window._seatsLimit)) {
        showToast('This group is full.', 'error');
        return;
      }
    }

    const profile = JSON.parse(localStorage.getItem(PROFILE_KEY) || '{}');
    if (!profile.firstName || !profile.lastName) {
      showToast('Please fill in your profile before joining a group.', 'error');
      return;
    }

    const fullName = `${profile.firstName} ${profile.lastName}`.trim();
    const joinedAt = new Date().toLocaleString();

    // Add to local members list
    const members = getLocalMembers();
    if (!members.find(m => m.name === fullName)) {
      members.push({ name: fullName, _local: true });
      saveLocalMembers(members);
    }

    localStorage.setItem(joinKey, JSON.stringify({ userId: fullName, joinedAt, groupId: joinGroupId }));
    setJoinedState(joinBtn);
    renderMembersList(window._apiMembers || []);
    updateSeatsDisplay();
    showToast(`Welcome to the group, ${profile.firstName}!`, 'success');
  });

  // ─── Speed dial actions ────────────────────────────────────────────────────────
  // Edit (tooltip-edit button)
  document.querySelector('[data-tooltip-target="tooltip-edit"]')?.addEventListener('click', async () => {
    if (!groupId) return;
    const newName = prompt('Enter new group name:');
    if (!newName?.trim()) return;
    try {
      await updateGroup({ id: groupId, name: newName.trim() });
      showToast('Group updated!', 'success');
      document.getElementById('group-title').textContent = newName.trim();
      document.title = `${newName.trim()} – Study Group`;
    } catch {
      showToast('Failed to update group.', 'error');
    }
  });

  // Delete (tooltip-delete button)
  document.querySelector('[data-tooltip-target="tooltip-delete"]')?.addEventListener('click', async () => {
    if (!groupId) return;
    if (!confirm('Delete this group? This cannot be undone.')) return;
    try {
      await deleteGroup(groupId);
      showToast('Group deleted.', 'success');
      setTimeout(() => window.location.href = 'study-group-finder.html', 1200);
    } catch {
      showToast('Failed to delete group.', 'error');
    }
  });

  // Print / download
  document.querySelector('[data-tooltip-target="tooltip-download"]')?.addEventListener('click', () => window.print());

  // Copy link
  document.querySelector('[data-tooltip-target="tooltip-copy"]')?.addEventListener('click', () => {
    navigator.clipboard.writeText(window.location.href).then(() => showToast('Link copied to clipboard!', 'info'));
  });
});

// ─── Main: load group data ─────────────────────────────────────────────────────
window.addEventListener('DOMContentLoaded', async () => {
  const groupId = getQueryParam('id');

  if (!groupId) {
    document.getElementById('group-title').textContent = 'Group not found';
    return;
  }

  try {
    // Load mappings and group data in parallel
    const [subjects, locations, group] = await Promise.all([
      fetchSubjects().catch(() => []),
      fetchLocations().catch(() => []),
      fetchGroupById(groupId),
    ]);

    // Populate maps so subject/location names resolve correctly
    (Array.isArray(subjects) ? subjects : (subjects?.data || [])).forEach(s => { subjectMap[s.id] = s.code; });
    (Array.isArray(locations) ? locations : (locations?.data || [])).forEach(l => { locationMap[l.id] = l.code; });

    if (!group) {
      document.getElementById('group-title').textContent = 'Group not found';
      return;
    }

    // Title + meta
    const title = group.name || 'Untitled Group';
    document.title = `${title} – Study Group`;
    document.getElementById('group-title').textContent = title;

    const subjectEl  = document.getElementById('group-subject');
    const coverageEl = document.getElementById('group-coverage');
    if (subjectEl)  subjectEl.textContent  = subjectMap[group.subject_id] || group.subject || group.subject_id || '';
    if (coverageEl) coverageEl.textContent = group.coverage ? `Coverage: ${group.coverage}` : '';
    if (coverageEl && !group.coverage) coverageEl.style.display = 'none';

    // Details panel
    const detailsDiv = document.getElementById('group-details');
    if (detailsDiv) {
      let html = '';

      if (group.agenda) {
        html += `<h2 class="text-lg font-bold text-gray-900 dark:text-white mb-2">Agenda</h2>
                 <div class="text-gray-700 dark:text-gray-300 whitespace-pre-line mb-6">${escapeHtml(group.agenda)}</div>`;
      } else {
        html += `<h2 class="text-lg font-bold text-gray-900 dark:text-white mb-2">Agenda</h2>
                 <p class="text-gray-400 dark:text-gray-500 italic mb-6">No agenda provided.</p>`;
      }

      if (group.description) {
        html += `<h2 class="text-lg font-bold text-gray-900 dark:text-white mb-2">Description</h2>
                 <p class="text-gray-700 dark:text-gray-300 mb-6">${escapeHtml(group.description)}</p>`;
      }

      html += `<h2 class="text-lg font-bold text-gray-900 dark:text-white mb-2">Attachments</h2>`;
      if (Array.isArray(group.attachments) && group.attachments.length > 0) {
        html += '<ul class="space-y-1">';
        group.attachments.forEach(att => {
          if (att.url) {
            html += `<li><a href="${escapeHtml(att.url)}" target="_blank" rel="noopener" class="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"/></svg>
              ${escapeHtml(att.name || att.url)}
            </a></li>`;
          } else {
            html += `<li class="text-gray-600 dark:text-gray-400">${escapeHtml(att.name || att)}</li>`;
          }
        });
        html += '</ul>';
      } else {
        html += '<p class="text-gray-400 dark:text-gray-500 italic">No attachments.</p>';
      }

      detailsDiv.innerHTML = html;
    }

    // Side info
    setText('side-subject', subjectMap[group.subject_id] || group.subject || '—');
    setText('side-location', locationMap[group.location_id] || group.location || group.location_code || '—');

    let dateStr = '';
    if (group.start_date && group.end_date && group.start_date !== group.end_date) {
      dateStr = `${formatDate(group.start_date)} – ${formatDate(group.end_date)}`;
    } else if (group.start_date) {
      dateStr = formatDate(group.start_date);
    } else if (group.end_date) {
      dateStr = formatDate(group.end_date);
    }
    setText('side-date', dateStr || '—');

    const timeStr = formatTime(group.start_time) + (group.end_time ? ` – ${formatTime(group.end_time)}` : '');
    setText('side-time', timeStr || '—');
    setText('side-repetition', group.session_repetition || group.repetition || '—');

    // Store seat limit globally so join/unjoin can update the display
    window._seatsLimit = group.members_quantity_limit ?? group.seats ?? null;

    // Members — store API members globally so join/unjoin can re-render
    window._apiMembers = Array.isArray(group.members) ? group.members : [];
    renderMembersList(window._apiMembers);
    updateSeatsDisplay();

    // Restore join button state
    const joinBtn = document.getElementById('join-btn');
    if (joinBtn && localStorage.getItem(`joined_groups_${groupId}`)) {
      setJoinedState(joinBtn);
    }

  } catch (err) {
    document.getElementById('group-title').textContent = 'Error loading group';
    document.getElementById('group-details').innerHTML = '<p class="text-red-500 text-sm">Failed to load group data. Please check your connection and try again.</p>';
    console.error(err);
  }
});

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}
