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
  // Helper to get query param
  function getQueryParam(name) {
    const url = new URL(window.location.href);
    return url.searchParams.get(name);
  }
  // Render group details
  const groupId = getQueryParam('id');
  const detailsDiv = document.getElementById('group-details');
  const groupTitle = document.getElementById('group-title');
  if (groupId && detailsDiv) {
    detailsDiv.textContent = 'Loading...';
    fetch('groups.json')
      .then(r => r.json())
      .then(groups => {
        const group = groups.find(g => String(g.id) === String(groupId));
        if (!group) {
          detailsDiv.innerHTML = '<span class="text-red-600">Group not found.</span>';
          if (groupTitle) groupTitle.textContent = '';
          return;
        }
        if (groupTitle) groupTitle.textContent = group.name;
        document.title = group.name + ' | Study Group';
        // Update breadcrumb nav
        const breadcrumbCurrent = document.querySelector('nav[aria-label="Breadcrumb"] li[aria-current="page"] .ms-1');
        if (breadcrumbCurrent) breadcrumbCurrent.textContent = group.name;
        document.getElementById('group-subject').textContent = group.subject;
        document.getElementById('group-coverage').textContent = group.coverage;
        detailsDiv.innerHTML = `<h2 class='text-2xl font-bold mb-2 text-gray-900 dark:text-white'>Agenda</h2>
          <p class='mb-4 text-gray-700 dark:text-gray-300'>${group.agenda}</p>`;
        // Always show attachment field, even if not present
        detailsDiv.innerHTML += `<h2 class='text-2xl font-bold mb-2 text-gray-900 dark:text-white'>Attachment</h2>
          <p class='mb-4'>${group.attachment ? `<a href="${group.attachment}" target="_blank" class="underline text-blue-400">View Attachment</a>` : '<span class="italic text-gray-400">No attachment</span>'}</p>`;
        // Render side info
        document.getElementById('side-location').textContent = group.location;
        document.getElementById('side-date').textContent = group.date;
        document.getElementById('side-time').textContent = `${group.startTime} - ${group.endTime}`;
        document.getElementById('side-repetition').textContent = group.repetition;
        document.getElementById('side-seats').textContent = group.seats;
        // Render members list
        const membersList = document.getElementById('members-list');
        if (membersList) {
          membersList.innerHTML = group.members.map(member => `
            <li class="flex items-center gap-2 mb-2">
              <img src="${member.avatar}" alt="${member.name}" class="w-8 h-8 rounded-full">
              <a href="${member.profileLink}" class="text-blue-500 hover:underline">${member.name}</a>
            </li>
          `).join('');
        }
      })
      .catch(() => {
        detailsDiv.innerHTML = '<span class="text-red-600">Failed to load group info.</span>';
      });
  }
  // Comments section logic with stars
  const commentsList = document.getElementById('comments-list');
  const commentForm = document.getElementById('comment-form');
  const commentInput = document.getElementById('comment-input');
  const starRating = document.getElementById('star-rating');
  const localKey = `comments-group-${groupId}`;
  let selectedStars = 0;
  function renderStars(selected) {
    if (!starRating) return;
    starRating.innerHTML = '';
    for (let i = 1; i <= 5; i++) {
      const star = document.createElement('span');
      star.innerHTML = `<svg class='w-6 h-6 cursor-pointer ${i <= selected ? 'text-yellow-400' : 'text-gray-300'}' fill='currentColor' viewBox='0 0 20 20'><path d='M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.175c.969 0 1.371 1.24.588 1.81l-3.38 2.455a1 1 0 00-.364 1.118l1.287 3.966c.3.922-.755 1.688-1.54 1.118l-3.38-2.454a1 1 0 00-1.175 0l-3.38 2.454c-.784.57-1.838-.196-1.54-1.118l1.287-3.966a1 1 0 00-.364-1.118L2.049 9.394c-.783-.57-.38-1.81.588-1.81h4.175a1 1 0 00.95-.69l1.286-3.967z'/></svg>`;
      star.addEventListener('click', () => {
        selectedStars = i;
        renderStars(selectedStars);
      });
      starRating.appendChild(star);
    }
  }
  function renderComments() {
    const comments = JSON.parse(localStorage.getItem(localKey) || '[]');
    commentsList.innerHTML = comments.length
      ? comments.map(c => `
        <div class='mb-4 p-4 bg-gray-100 dark:bg-gray-700 rounded'>
          <div class="flex items-center gap-2 mb-2">
            <img src="${c.avatar}" alt="${c.name}" class="w-8 h-8 rounded-full">
            <div>
              <span class='font-semibold'>${c.name}</span>
              <div class="text-yellow-400">${'★'.repeat(c.stars)}${'☆'.repeat(5-c.stars)}</div>
            </div>
          </div>
          <p class="ml-10">${c.text}</p>
        </div>
      `).join('')
      : '<div class="text-gray-500">No comments yet.</div>';
  }
  if (commentForm && commentInput && commentsList && starRating) {
    renderStars(selectedStars);
    renderComments();
    commentForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const val = commentInput.value.trim();
      if (val && selectedStars > 0) {
        const comments = JSON.parse(localStorage.getItem(localKey) || '[]');
        // Randomly select a demo user for the comment
        const demoUsers = [
          { name: 'Sarah', avatar: 'img/sarah.jpg' },
          { name: 'Ahmed', avatar: 'img/ahmed.jpg' },
          { name: 'Lisa', avatar: 'img/lisa.jpg' },
          { name: 'Mohammad', avatar: 'img/mohammad.jpg' }
        ];
        const user = demoUsers[Math.floor(Math.random() * demoUsers.length)];
        comments.push({ 
          text: val, 
          stars: selectedStars,
          name: user.name,
          avatar: user.avatar
        });
        localStorage.setItem(localKey, JSON.stringify(comments));
        commentInput.value = '';
        selectedStars = 0;
        renderStars(selectedStars);
        renderComments();
      }
    });
    
  }
  // Populate with unique demo comments if empty
  if (commentsList && localStorage.getItem(localKey) === null) {
    let demo;
    switch (String(groupId)) {
      case '1':
        demo = [
          { text: 'BIO102 group helped me ace the final!', stars: 5, name: 'Sarah', avatar: 'img/sarah.jpg' },
          { text: 'Very organized and clear explanations.', stars: 4, name: 'Ahmed', avatar: 'img/ahmed.jpg' }
        ]; break;
      case '2':
        demo = [
          { text: 'CS101 project team was super collaborative.', stars: 5, name: 'Lisa', avatar: 'img/lisa.jpg' },
          { text: 'We finished our tasks on time.', stars: 4, name: 'Mohammad', avatar: 'img/mohammad.jpg' }
        ]; break;
      case '3':
        demo = [
          { text: 'Math201 group solved tough problems together.', stars: 5, name: 'Sarah', avatar: 'img/sarah.jpg' },
          { text: 'Sometimes a bit fast-paced.', stars: 3, name: 'Ahmed', avatar: 'img/ahmed.jpg' }
        ]; break;
      case '4':
        demo = [
          { text: 'Physics lab prep was hands-on and fun.', stars: 4, name: 'Lisa', avatar: 'img/lisa.jpg' },
          { text: 'Great for understanding experiments.', stars: 5, name: 'Mohammad', avatar: 'img/mohammad.jpg' }
        ]; break;
      case '5':
        demo = [
          { text: 'Chemistry review was very thorough.', stars: 5, name: 'Sarah', avatar: 'img/sarah.jpg' },
          { text: 'Nice group, good practice questions.', stars: 4, name: 'Ahmed', avatar: 'img/ahmed.jpg' }
        ]; break;
      case '6':
        demo = [
          { text: 'History discussions were insightful.', stars: 5, name: 'Lisa', avatar: 'img/lisa.jpg' },
          { text: 'Loved the essay brainstorming.', stars: 4, name: 'Mohammad', avatar: 'img/mohammad.jpg' }
        ]; break;
      case '7':
        demo = [
          { text: 'Hackathon prep was exciting!', stars: 5, name: 'Sarah', avatar: 'img/sarah.jpg' },
          { text: 'Great team spirit.', stars: 5, name: 'Ahmed', avatar: 'img/ahmed.jpg' }
        ]; break;
      case '8':
        demo = [
          { text: 'Art portfolio feedback was constructive.', stars: 5, name: 'Lisa', avatar: 'img/lisa.jpg' },
          { text: 'Helped me improve my work.', stars: 4, name: 'Mohammad', avatar: 'img/mohammad.jpg' }
        ]; break;
      default:
        demo = [
          { text: 'Great group, very helpful!', stars: 5, name: 'Lisa', avatar: 'img/lisa.jpg' },
          { text: 'Good explanations and friendly members.', stars: 4, name: 'Mohammad', avatar: 'img/mohammad.jpg' },
          { text: 'Nice experience, but could be more organized.', stars: 3, name: 'Sarah', avatar: 'img/sarah.jpg' }
        ];
    }
    localStorage.setItem(localKey, JSON.stringify(demo));
    renderComments();
  }
});