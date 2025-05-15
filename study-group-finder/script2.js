document.title = document;
// --- Speed Dial Toggle ---
document.addEventListener('DOMContentLoaded', function() {
  const speedDialButton = document.querySelector('[data-dial-toggle]');
  const speedDialMenu = document.getElementById('speed-dial-menu-horizontal');
  if (speedDialButton && speedDialMenu) {
    speedDialButton.addEventListener('click', function(e) {
      e.stopPropagation();
      const isExpanded = speedDialButton.getAttribute('aria-expanded') === 'true';
      speedDialButton.setAttribute('aria-expanded', !isExpanded);
      speedDialMenu.classList.toggle('hidden');
    });
    document.addEventListener('click', function(e) {
      if (!speedDialButton.contains(e.target) && !speedDialMenu.contains(e.target)) {
        speedDialMenu.classList.add('hidden');
        speedDialButton.setAttribute('aria-expanded', 'false');
      }
    });
  }
});

// Helper: Get query param by name
function getQueryParam(name) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(name);
}

// Helper: Format date
function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date)) return dateString;
  return date.toLocaleDateString();
}

// Helper: Format time
function formatTime(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date)) return '';
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// Fetch group by ID using the API
async function fetchGroupById(id) {
  if (window.fetchGroups) {
    const groups = await window.fetchGroups();
    const groupArr = Array.isArray(groups) ? groups : groups.data || [];
    return groupArr.find(g => String(g.id) === String(id));
  } else {
    // Fallback: fetch directly from backend
    const res = await fetch("https://f7e43c04-432e-44fd-b80d-8887899dbe29-00-3nco8oqvnjjy.worf.replit.dev/group/read.php");
    const groups = await res.json();
    const groupArr = Array.isArray(groups) ? groups : groups.data || [];
    return groupArr.find(g => String(g.id) === String(id));
  }
}

// Main logic
window.addEventListener('DOMContentLoaded', async () => {
  const groupId = getQueryParam('id');
  if (!groupId) {
    document.getElementById('group-title').textContent = 'Group not found';
    return;
  }
  try {
    const group = await fetchGroupById(groupId);
    if (!group) {
      document.getElementById('group-title').textContent = 'Group not found';
      return;
    }
    // Title
    document.getElementById('group-title').textContent = group.name || 'Untitled Group';
    // Meta
    document.getElementById('group-subject').textContent = group.subject || group.subject_id || 'No subject';
    document.getElementById('group-coverage').textContent = group.coverage || '';
    // Details
    const detailsDiv = document.getElementById('group-details');
    if (detailsDiv) {
      detailsDiv.innerHTML = '';
      // Agenda heading
      detailsDiv.innerHTML += `<h2 class='text-2xl font-bold mb-2 mt-2'>Agenda</h2>`;
      detailsDiv.innerHTML += `<div class='mb-4'>${group.agenda ? group.agenda : '<span class="text-gray-400">No agenda provided.</span>'}</div>`;
      // Description
      if (group.description) {
        detailsDiv.innerHTML += `<div class='mb-2'><span class='font-semibold'>Description:</span> ${group.description}</div>`;
      }
      // Attachments heading
      detailsDiv.innerHTML += `<h2 class='text-2xl font-bold mb-2 mt-4'>Attachments</h2>`;
      if (Array.isArray(group.attachments) && group.attachments.length > 0) {
        detailsDiv.innerHTML += `<ul class='list-disc ml-6 mb-2'>`;
        group.attachments.forEach(att => {
          if (att.url) {
            detailsDiv.innerHTML += `<li><a href='${att.url}' target='_blank' class='text-blue-600 underline'>${att.name || att.url}</a></li>`;
          } else {
            detailsDiv.innerHTML += `<li>${att.name || att}</li>`;
          }
        });
        detailsDiv.innerHTML += '</ul>';
      } else {
        detailsDiv.innerHTML += `<div class='text-gray-400 mb-2'>No attachments provided.</div>`;
      }
    }
    // Side Info
    document.getElementById('side-location').textContent = group.location || group.location_code || 'N/A';
    // Date/Time
    let dateStr = '';
    if (group.start_date && group.end_date) {
      if (group.start_date === group.end_date) {
        dateStr = formatDate(group.start_date);
      } else {
        dateStr = `${formatDate(group.start_date)} - ${formatDate(group.end_date)}`;
      }
    } else if (group.start_date) {
      dateStr = formatDate(group.start_date);
    } else if (group.end_date) {
      dateStr = formatDate(group.end_date);
    }
    document.getElementById('side-date').textContent = dateStr || 'N/A';
    document.getElementById('side-time').textContent = formatTime(group.start_date) || 'N/A';
    document.getElementById('side-repetition').textContent = group.session_repetition || group.repetition || 'N/A';
    document.getElementById('side-seats').textContent = group.members_quantity_limit ?? group.seats ?? 'N/A';
    // Members
    const membersList = document.getElementById('members-list');
    if (membersList) {
      membersList.innerHTML = '';
      if (Array.isArray(group.members) && group.members.length > 0) {
        group.members.forEach(m => {
          const li = document.createElement('li');
          li.textContent = m.name || m;
          membersList.appendChild(li);
        });
      } else {
        membersList.innerHTML = '<li>No members listed.</li>';
      }
    }
    // Optionally: handle attachments, comments, etc.
  } catch (err) {
    document.getElementById('group-title').textContent = 'Error loading group';
    console.error(err);
  }
});