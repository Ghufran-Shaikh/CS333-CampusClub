import { fetchGroups, fetchSubjects, fetchLocations, fetchStudents, createGroup, createSubject, createLocation, createStudent, updateGroup, updateSubject, updateLocation, updateStudent, deleteGroup, deleteSubject, deleteLocation, deleteStudent} from './api.js';  // Adjust the path based on your project structure

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

  // --- Speed Dial Tooltips Functionality ---
  // Tooltip buttons
  const tooltipShareBtn = document.querySelector('[data-tooltip-target="tooltip-share"]');
  const tooltipPrintBtn = document.querySelector('[data-tooltip-target="tooltip-print"]');
  const tooltipDownloadBtn = document.querySelector('[data-tooltip-target="tooltip-download"]');
  const tooltipCopyBtn = document.querySelector('[data-tooltip-target="tooltip-copy"]');

  // Helper to get groupId from URL
  function getGroupId() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
  }

  // 1. Edit (Share) - Pop up group-form with current group data
  if (tooltipShareBtn) {
    tooltipShareBtn.addEventListener('click', async function(e) {
      e.preventDefault();
      // Show the group-form popup (clone from study-group-finder.html)
      let formPopup = document.getElementById('myForm');
      if (!formPopup) {
        // If not present, create and append it from study-group-finder.html
        // For simplicity, alert if not found
        alert('Group form not found on this page.');
        return;
      }
      // Fetch group data
      const groupId = getGroupId();
      const group = await fetchGroupById(groupId);
      if (!group) {
        alert('Group not found.');
        return;
      }
      // Fill form fields with group data
      document.getElementById('group-name').value = group.name || '';
      document.getElementById('group-subject').value = group.subject_id || group.subject || '';
      document.getElementById('group-coverage').value = group.coverage || '';
      document.getElementById('group-location').value = group.location_code || group.location || '';
      document.getElementById('datepicker-range-start').value = group.start_date || '';
      document.getElementById('datepicker-range-end').value = group.end_date || '';
      document.getElementById('start-time').value = group.start_time || '';
      document.getElementById('end-time').value = group.end_time || '';
      document.getElementById('group-session-repetition').value = group.session_repetition || group.repetition || '';
      document.getElementById('agenda').value = group.agenda || '';
      // Show the form
      formPopup.style.display = 'block';
      window.scrollTo({ top: 0, behavior: 'smooth' });
      // On submit, call updateGroup()
      const groupForm = document.getElementById('group-form');
      if (groupForm) {
        groupForm.onsubmit = async function(ev) {
          ev.preventDefault();
          // Gather form values
          const updatedGroup = {
            id: groupId,
            name: document.getElementById('group-name').value.trim(),
            subject: document.getElementById('group-subject').value,
            coverage: document.getElementById('group-coverage').value.trim(),
            location: document.getElementById('group-location').value,
            start_date: document.getElementById('datepicker-range-start').value,
            end_date: document.getElementById('datepicker-range-end').value,
            start_time: document.getElementById('start-time').value,
            end_time: document.getElementById('end-time').value,
            session_repetition: document.getElementById('group-session-repetition').value,
            agenda: document.getElementById('agenda').value,
            // Add other fields as needed
          };
          try {
            await updateGroup(updatedGroup);
            alert('Group updated successfully!');
            formPopup.style.display = 'none';
            location.reload();
          } catch (err) {
            alert('Failed to update group.');
          }
        };
      }
    });
  }

  // 2. Delete (Print) - Delete the group
  if (tooltipPrintBtn) {
    tooltipPrintBtn.addEventListener('click', async function(e) {
      e.preventDefault();
      if (!confirm('Are you sure you want to delete this group?')) return;
      const groupId = getGroupId();
      try {
        // Ensure deleteGroup is available (import if needed)
        if (typeof deleteGroup !== 'function') {
          if (window.deleteGroup) {
            await window.deleteGroup(groupId);
          } else if (window.api && typeof window.api.deleteGroup === 'function') {
            await window.api.deleteGroup(groupId);
          } else {
            alert('deleteGroup() function not found.');
            return;
          }
        } else {
          await deleteGroup(groupId);
        }
        alert('Group deleted successfully!');
        window.location.href = 'study-group-finder.html';
      } catch (err) {
        alert('Failed to delete group.');
        console.error(err);
      }
    });
  }

  // 3. Download (Download) - Download page as PDF
  if (tooltipDownloadBtn) {
    tooltipDownloadBtn.addEventListener('click', function(e) {
      e.preventDefault();
      window.print();
    });
  }

  // 4. Copy (optional, not requested)
  if (tooltipCopyBtn) {
    tooltipCopyBtn.addEventListener('click', function(e) {
      e.preventDefault();
      navigator.clipboard.writeText(window.location.href);
      alert('Page URL copied to clipboard!');
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