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
      // Try to find the modal overlay
      let modalOverlay = document.getElementById('modal-overlay');
      let formPopup = document.getElementById('myForm');
      if (!modalOverlay) {
        // Create modal overlay
        modalOverlay = document.createElement('div');
        modalOverlay.id = 'modal-overlay';
        modalOverlay.style.position = 'fixed';
        modalOverlay.style.top = '0';
        modalOverlay.style.left = '0';
        modalOverlay.style.width = '100vw';
        modalOverlay.style.height = '100vh';
        modalOverlay.style.background = 'rgba(0,0,0,0.5)';
        modalOverlay.style.display = 'flex';
        modalOverlay.style.alignItems = 'center';
        modalOverlay.style.justifyContent = 'center';
        modalOverlay.style.zIndex = '9999';
        document.body.appendChild(modalOverlay);
      }
      // Remove any existing form in the modal
      if (formPopup && formPopup.parentElement !== modalOverlay) {
        formPopup.remove();
        formPopup = null;
      }
      if (!formPopup) {
        try {
          const res = await fetch('study-group-finder.html');
          const html = await res.text();
          const tempDiv = document.createElement('div');
          tempDiv.innerHTML = html;
          // Try to find the actual <form> inside #myForm or as #myForm itself
          let form = tempDiv.querySelector('#myForm');
          if (form && form.tagName !== 'FORM') {
            // If #myForm is a wrapper, get the inner <form>
            const innerForm = form.querySelector('form');
            if (innerForm) form = innerForm;
          }
          if (form && form.tagName === 'FORM') {
            // Remove any parent wrapper if present (prevent double wrapping)
            if (form.parentElement && form.parentElement !== tempDiv) {
              form.parentElement.removeChild(form);
            }
            // Remove all children from modalOverlay before appending form
            while (modalOverlay.firstChild) {
              modalOverlay.removeChild(modalOverlay.firstChild);
            }
            // Remove all parent wrappers: extract only the <form> element if #myForm is a wrapper
            modalOverlay.appendChild(form);
            formPopup = form;
            // Style the form directly
            if (formPopup && formPopup.tagName === 'FORM') {
              formPopup.id = 'myForm';
              formPopup.style.display = 'block';
              formPopup.style.background = '#fff';
              formPopup.style.padding = '2rem';
              formPopup.style.borderRadius = '1rem';
              formPopup.style.boxShadow = '0 2px 16px rgba(0,0,0,0.2)';
              formPopup.style.maxWidth = '600px';
              formPopup.style.width = '100%';
              formPopup.style.position = 'relative';
              formPopup.style.maxHeight = '80vh';
              formPopup.style.overflowY = 'auto';
              // Add close button
              let closeBtn = document.createElement('button');
              closeBtn.textContent = '×';
              closeBtn.setAttribute('aria-label', 'Close');
              closeBtn.style.position = 'absolute';
              closeBtn.style.top = '1rem';
              closeBtn.style.right = '1rem';
              closeBtn.style.fontSize = '2rem';
              closeBtn.style.background = 'none';
              closeBtn.style.border = 'none';
              closeBtn.style.cursor = 'pointer';
              closeBtn.addEventListener('click', function() {
                modalOverlay.style.display = 'none';
              });
              formPopup.prepend(closeBtn);
              modalOverlay.appendChild(formPopup);
              modalOverlay.style.display = 'flex';
              // Animate
              formPopup.scrollTop = 0;
              setTimeout(() => { formPopup.scrollTop = 0; }, 10);
              formPopup.classList.add('animate__animated', 'animate__fadeInDown');
              setTimeout(() => {
                formPopup.classList.remove('animate__animated', 'animate__fadeInDown');
              }, 800);
            }
          } else {
            alert('Group form could not be loaded.');
            return;
          }
        } catch (err) {
          alert('Failed to load group form.');
          return;
        }
      } else {
        modalOverlay.style.display = 'flex';
        formPopup.style.display = 'block';
      }
      // After appending, re-query the form elements
      const groupForm = formPopup && formPopup.tagName === 'FORM' ? formPopup : document.getElementById('group-form');
      if (!groupForm) {
        alert('Group form not found after loading.');
        return;
      }
      // Fetch group data and fill form fields with current page content
      const groupId = getGroupId();
      // Get the content from the current page (not from API)
      const groupName = document.getElementById('group-title')?.textContent || '';
      const groupSubject = document.getElementById('group-subject')?.textContent || '';
      const groupCoverage = document.getElementById('group-coverage')?.textContent || '';
      const groupLocation = document.getElementById('side-location')?.textContent || '';
      const groupDate = document.getElementById('side-date')?.textContent || '';
      const groupTime = document.getElementById('side-time')?.textContent || '';
      const groupRepetition = document.getElementById('side-repetition')?.textContent || '';
      const groupAgenda = (() => {
        const detailsDiv = document.getElementById('group-details');
        if (!detailsDiv) return '';
        const agendaDiv = detailsDiv.querySelector('div.mb-4');
        if (!agendaDiv) return '';
        return agendaDiv.textContent.trim();
      })();
      // Fill form fields
      if (groupForm.querySelector('#group-name')) groupForm.querySelector('#group-name').value = groupName;
      if (groupForm.querySelector('#group-subject')) groupForm.querySelector('#group-subject').value = groupSubject;
      if (groupForm.querySelector('#group-coverage')) groupForm.querySelector('#group-coverage').value = groupCoverage;
      if (groupForm.querySelector('#group-location')) groupForm.querySelector('#group-location').value = groupLocation;
      if (groupForm.querySelector('#datepicker-range-start')) groupForm.querySelector('#datepicker-range-start').value = '';
      if (groupForm.querySelector('#datepicker-range-end')) groupForm.querySelector('#datepicker-range-end').value = '';
      if (groupForm.querySelector('#start-time')) groupForm.querySelector('#start-time').value = '';
      if (groupForm.querySelector('#end-time')) groupForm.querySelector('#end-time').value = '';
      if (groupForm.querySelector('#group-session-repetition')) groupForm.querySelector('#group-session-repetition').value = groupRepetition;
      if (groupForm.querySelector('#agenda')) groupForm.querySelector('#agenda').value = groupAgenda;
      
      
      function initTomSelectFields() {
  fetchSubjects().then(allSubjects => {
    const mappedSubjects = allSubjects.map(subject => ({ id: subject.id, text: subject.code }));
    const subjInput = groupForm.querySelector('#group-subject');
    if (subjInput) {
      if (subjInput.tomselect) subjInput.tomselect.destroy();
      const ts = new TomSelect(subjInput, {
        valueField: 'id',
        labelField: 'text',
        searchField: 'text',
        maxItems: 1,
        preload: true,
        placeholder: 'Select a subject',
        load: function(query, callback) {
          if (!query.length) return callback(mappedSubjects.slice(0, 50));
          const filtered = mappedSubjects.filter(subject => subject.text.toLowerCase().includes(query.toLowerCase()));
          callback(filtered);
        },
        plugins: ['dropdown_input']
      });

      const updatePlaceholder = () => {
        if (ts.getValue()) {
          ts.control_input.setAttribute('placeholder', '');
        } else {
          ts.control_input.setAttribute('placeholder', 'Select a subject');
        }
      };

      ts.on('change', updatePlaceholder);
      ts.on('load', updatePlaceholder);
      ts.on('initialize', updatePlaceholder);

      if (groupSubject) ts.setValue(groupSubject, true);
      subjInput.style.display = 'none';
    }
  });

  fetchLocations().then(allLocations => {
    const mappedLocations = allLocations.map(location => ({ id: location.id, text: location.code }));
    const locInput = groupForm.querySelector('#group-location');
    if (locInput) {
      if (locInput.tomselect) locInput.tomselect.destroy();
      const ts = new TomSelect(locInput, {
        valueField: 'id',
        labelField: 'text',
        searchField: 'text',
        maxItems: 1,
        preload: true,
        placeholder: 'Select a location',
        load: function(query, callback) {
          if (!query.length) return callback(mappedLocations.slice(0, 50));
          const filtered = mappedLocations.filter(location => location.text.toLowerCase().includes(query.toLowerCase()));
          callback(filtered);
        },
        plugins: ['dropdown_input']
      });

      const updatePlaceholder = () => {
        if (ts.getValue()) {
          ts.control_input.setAttribute('placeholder', '');
        } else {
          ts.control_input.setAttribute('placeholder', 'Select a location');
        }
      };

      ts.on('change', updatePlaceholder);
      ts.on('load', updatePlaceholder);
      ts.on('initialize', updatePlaceholder);

      if (groupLocation) ts.setValue(groupLocation, true);
      locInput.style.display = 'none';
    }
  });
}

      // --- TomSelect for subject and location ---
      // Ensure TomSelect library is loaded
      if (typeof TomSelect === 'undefined') {
        const tomSelectScript = document.createElement('script');
        tomSelectScript.src = 'https://cdn.jsdelivr.net/npm/tom-select@2.2.2/dist/js/tom-select.complete.min.js';
        tomSelectScript.onload = () => initTomSelectFields();
        document.body.appendChild(tomSelectScript);
      } else {
        initTomSelectFields();
      }
      function hideHelpTextIfPresent(input, helpTexts) {
        // Remove placeholder from original select
        input.removeAttribute('placeholder');
        // Hide next sibling if it contains help text
        let sibling = input.nextElementSibling;
        if (sibling && sibling.textContent) {
          for (const txt of helpTexts) {
            if (sibling.textContent.trim().includes(txt)) {
              sibling.style.display = 'none';
            }
          }
        }
      }
      function initTomSelectFields() {
        fetchSubjects().then(allSubjects => {
          const mappedSubjects = allSubjects.map(subject => ({ id: subject.id, text: subject.code }));
          const subjInput = groupForm.querySelector('#group-subject');
          if (subjInput) {
            if (subjInput.tomselect) subjInput.tomselect.destroy();
            const ts = new TomSelect(subjInput, {
              valueField: 'id',
              labelField: 'text',
              searchField: 'text',
              maxItems: 1,
              preload: true,
              load: function(query, callback) {
                if (!query.length) return callback(mappedSubjects.slice(0, 50));
                const filtered = mappedSubjects.filter(subject => subject.text.toLowerCase().includes(query.toLowerCase()));
                callback(filtered);
              },
              plugins: ['dropdown_input']
            });
            if (groupSubject) {
              ts.setValue(groupSubject, true);
              ts.input.removeAttribute('placeholder');
              subjInput.removeAttribute('placeholder');
              hideHelpTextIfPresent(subjInput, ['Select a group']);
            }
            subjInput.style.display = 'none';
            ts.on('change', function() {
              if (ts.getValue()) {
                ts.input.removeAttribute('placeholder');
                subjInput.removeAttribute('placeholder');
                hideHelpTextIfPresent(subjInput, ['Select a group']);
              }
            });
            ts.on('initialize', function() {
              if (ts.getValue()) {
                ts.input.removeAttribute('placeholder');
                subjInput.removeAttribute('placeholder');
                hideHelpTextIfPresent(subjInput, ['Select a group']);
              }
            });
          }
        });
        fetchLocations().then(allLocations => {
          const mappedLocations = allLocations.map(location => ({ id: location.id, text: location.code }));
          const locInput = groupForm.querySelector('#group-location');
          if (locInput) {
            if (locInput.tomselect) locInput.tomselect.destroy();
            const ts = new TomSelect(locInput, {
              valueField: 'id',
              labelField: 'text',
              searchField: 'text',
              maxItems: 1,
              preload: true,
              load: function(query, callback) {
                if (!query.length) return callback(mappedLocations.slice(0, 50));
                const filtered = mappedLocations.filter(location => location.text.toLowerCase().includes(query.toLowerCase()));
                callback(filtered);
              },
              plugins: ['dropdown_input']
            });
            if (groupLocation) {
              ts.setValue(groupLocation, true);
              ts.input.removeAttribute('placeholder');
              locInput.removeAttribute('placeholder');
              hideHelpTextIfPresent(locInput, ['e.g S40-1016']);
            }
            locInput.style.display = 'none';
            ts.on('change', function() {
              if (ts.getValue()) {
                ts.input.removeAttribute('placeholder');
                locInput.removeAttribute('placeholder');
                hideHelpTextIfPresent(locInput, ['e.g S40-1016']);
              }
            });
            ts.on('initialize', function() {
              if (ts.getValue()) {
                ts.input.removeAttribute('placeholder');
                locInput.removeAttribute('placeholder');
                hideHelpTextIfPresent(locInput, ['e.g S40-1016']);
              }
            });
          }
        });
      }
      // Show modal
      modalOverlay.style.display = 'flex';
      window.scrollTo({ top: 0, behavior: 'smooth' });
      // On submit, call updateGroup()
      groupForm.onsubmit = async function(ev) {
        ev.preventDefault();
        const updatedGroup = {
          id: groupId,
          name: groupForm.querySelector('#group-name').value.trim(),
          subject: groupForm.querySelector('#group-subject').value,
          coverage: groupForm.querySelector('#group-coverage').value.trim(),
          location: groupForm.querySelector('#group-location').value,
          start_date: groupForm.querySelector('#datepicker-range-start').value,
          end_date: groupForm.querySelector('#datepicker-range-end').value,
          start_time: groupForm.querySelector('#start-time').value,
          end_time: groupForm.querySelector('#end-time').value,
          session_repetition: groupForm.querySelector('#group-session-repetition').value,
          agenda: groupForm.querySelector('#agenda').value,
        };
        try {
          await updateGroup(updatedGroup);
          alert('Group updated successfully!');
          modalOverlay.style.display = 'none';
          location.reload();
        } catch (err) {
          alert('Failed to update group.');
        }
      };
      // Optional: close modal when clicking outside the form
      modalOverlay.addEventListener('click', function(ev) {
        if (ev.target === modalOverlay) {
          modalOverlay.style.display = 'none';
        }
      });
    });
  }

  // 2. Delete (Print) - Delete the group
  if (tooltipPrintBtn) {
    tooltipPrintBtn.addEventListener('click', async function(e) {
      e.preventDefault();
      if (!confirm('Are you sure you want to delete this group?')) return;
      const groupId = getGroupId();
      console.log('Attempting to delete group with ID:', groupId);
      if (!groupId) {
        alert('Error: No group ID found. Cannot delete.');
        return;
      }
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