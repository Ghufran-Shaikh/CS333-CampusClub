document.addEventListener('DOMContentLoaded', function () {
  let allNotes = []; // Store all notes globally
  const url = "https://22dc9f8a-91aa-4bf0-8ae5-cda91c5728cf-00-1kektu7zbblns.sisko.replit.dev"; // API URL

  async function fetchColleges() {
    try {
      const response = await fetch(`${url}/api.php/colleges`);
      if (!response.ok) throw new Error('Network response was not ok');
      const colleges = await response.json();
       console.log(JSON.stringify(colleges)); 
      const collegeSelect = document.getElementById('college');
      collegeSelect.innerHTML = '<option value="">Select a College</option>'; // Clear existing options
      colleges.forEach(college => {
        collegeSelect.innerHTML += `<option value="${college.id}">${college.name}</option>`;
      });
    } catch (error) {
      console.error('Error fetching colleges:', error);
    }
  }

  async function fetchCourses(collegeId) {
      try {
          const response = await fetch(`${url}/api.php/courses?college=${collegeId}`);
          if (!response.ok) throw new Error('Network response was not ok');

          const courses = await response.json();
          console.log(JSON.stringify(courses)); 

          const courseSelect = document.getElementById('course');
          courseSelect.innerHTML = '<option value="">Select a Course</option>'; // Clear existing options

          const uniqueCourseTitles = new Set(); // Track unique course titles

          courses.forEach(course => {
              if (!uniqueCourseTitles.has(course.course_title)) {
                  uniqueCourseTitles.add(course.course_title);
                  courseSelect.innerHTML += `<option value="${course.id}">${course.course_title}</option>`;
              }
          });
      } catch (error) {
          console.error('Error fetching courses:', error);
      }
  }

  function handleCollegeChange() {
    const collegeSelect = document.getElementById('college');
    collegeSelect.addEventListener('change', function () {
      const selectedCollegeId = collegeSelect.value;
      if (selectedCollegeId) {
        fetchCourses(selectedCollegeId);
      } else {
        document.getElementById('course').innerHTML = '<option value="">Select a Course</option>'; // Reset courses
      }
    });
  }

  async function fetchNotes(collegeId) {
    try {
      const response = await fetch(`${url}/api.php?notesCollege=${collegeId}`);
      if (!response.ok) throw new Error('Network response was not ok');
      allNotes = await response.json();
      console.log(JSON.stringify(allNotes));
      displayNotes(allNotes); // Display all notes initially
      handleSearchAndFilter(); // Initialize search and filter
    } catch (error) {
      console.error('Error fetching notes:', error);
    }
  }

  function displayNotes(notes) {
    const notesContainer = document.getElementById('notes-container');
    notesContainer.innerHTML = '';

    if (notes.length === 0) {
      notesContainer.innerHTML = '<p>No notes found.</p>';
      return;
    }

    // Generate HTML for each note
    notes.forEach(note => {
      notesContainer.innerHTML += `
        <div class="bg-white rounded-xl shadow-md overflow-hidden mb-4">
          <div class="bg-blue-950 p-6 border-b">
            <h4 class="font-semibold text-white">${note.course_title}</h4>
          </div>
          <div class="p-6 border-t border-gray-200">
            <h3 class="text-lg font-semibold text-blue-950 mb-2">${note.title}</h3>
            <p class="text-gray-600 text-sm mb-3">${note.content}</p>
            <a href="${note.path}" class="bg-pink-600 hover:bg-pink-700 text-white px-3 py-1 rounded-md text-sm font-medium">
              <i class="fas fa-download mr-1"></i> Download
            </a>
            <button onclick="deleteNote(${note.id})" class="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md text-sm font-medium ml-2">
              <i class="fas fa-trash"></i> Delete
            </button>
          </div>
        </div>
      `;
    });
  }

  // Update the filterNotes function in courseNotes.js
  
  function filterNotes(searchTerm, sortOrder) {
      let filteredNotes = allNotes.filter(note =>
          note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
          note.course_title.toLowerCase().includes(searchTerm.toLowerCase())
      );

      if (sortOrder === 'a-z') {
          filteredNotes.sort((a, b) => a.course_title.localeCompare(b.course_title));
      } else if (sortOrder === 'z-a') {
          filteredNotes.sort((a, b) => b.course_title.localeCompare(a.course_title));
      }

      return filteredNotes;
  }

  function handleSearchAndFilter() {
    const searchBar = document.getElementById('search-bar');
    const filterDropdown = document.getElementById('filter-dropdown');

    searchBar.addEventListener('input', () => {
      const searchTerm = searchBar.value;
      const sortOrder = filterDropdown.value;
      const filteredNotes = filterNotes(searchTerm, sortOrder);
      displayNotes(filteredNotes);
    });

    filterDropdown.addEventListener('change', () => {
      const searchTerm = searchBar.value;
      const sortOrder = filterDropdown.value;
      const filteredNotes = filterNotes(searchTerm, sortOrder);
      displayNotes(filteredNotes);
    });
  }

  async function submitNote() {
    const noteForm = document.getElementById('noteForm');
    const formData = new FormData(noteForm);
    const newNote = {
      title: formData.get('title'),
      content: formData.get('content'),
      path: formData.get('file'),
      course_id: formData.get('course'),
      college_id: formData.get('college'),
    };

    try {
      const response = await fetch(`${url}/api.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newNote),
      });

      if (!response.ok) throw new Error('Network response was not ok');
      const result = await response.json();
      console.log('New note created:', result);
      showNotification('Note added successfully!');
      fetchNotes(newNote.college_id); // Refresh notes list after submission
      noteForm.reset(); // Reset the form after submission
      document.getElementById('addNoteModal').classList.add('hidden'); // Hide modal after submission
    } catch (error) {
      console.error('Error submitting note:', error);
    }
  }

  function showNotification(message) {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.style.display = 'block';

    setTimeout(() => {
      notification.style.display = 'none';
    }, 3000); // Hide notification after 3 seconds
  }

  // Create Modal
  function createModal() {
    const modalHTML = `
    
      <div id="addNoteModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center hidden z-50">
        <div class="bg-white rounded-xl p-6 w-full max-w-md mx-4">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-xl font-bold text-blue-950">Add New Note</h3>
            <button id="closeModal" class="text-gray-500 hover:text-gray-700">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <form id="noteForm" class="space-y-4">
            <div>
              <label for="college" class="block text-sm font-medium text-gray-700 mb-1">College</label>
              <select id="college" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required>
                <option value="">Select a College</option>
              </select>
            </div>
            <div>
              <label for="course" class="block text-sm font-medium text-gray-700 mb-1">Course</label>
              <select id="course" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required>
                <option value="">Select a Course</option>
              </select>
            </div>
            <div>
              <label for="title" class="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input type="text" id="title" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Note title" required>
            </div>
            <div>
              <label for="content" class="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea id="content" rows="5" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Write your note here..." required></textarea>
            </div>
            <div class="mb-4">
              <label class="block text-gray-700 text-sm font-bold mb-2" for="file">Upload File</label>
              <input id="file" type="file" class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required>
            </div>
            <div class="flex justify-end space-x-3 pt-2">
              <button type="button" id="cancelNote" class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100">Cancel</button>
              <button type="submit" class="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700">Submit</button>
            </div>
          </form>
        </div>
      </div>
    `;

    const modalContainer = document.createElement('div');
    modalContainer.innerHTML = modalHTML;
    document.body.appendChild(modalContainer);

    // Fetch colleges on modal open
    fetchColleges();

    // Event listeners for opening and closing
    document.getElementById('openFormButton').addEventListener('click', function () {
      document.getElementById('addNoteModal').classList.remove('hidden'); // Show modal
    });

    document.getElementById('closeModal').addEventListener('click', function () {
      document.getElementById('addNoteModal').classList.add('hidden'); // Hide modal
    });

    document.getElementById('cancelNote').addEventListener('click', function () {
      document.getElementById('addNoteModal').classList.add('hidden'); // Hide modal
    });

    // Handle college change to fetch courses
    handleCollegeChange();

    // Handle form submission
    document.getElementById('noteForm').addEventListener('submit', function (e) {
      e.preventDefault(); // Prevent default form submission
      submitNote(); // Call the submitNote function
    });
  }

  // Call the modal creation function
  createModal();

  // Call the fetchNotes function on page load for a specific college
  const initialCollegeId = document.getElementById('college').value; // Get initial college ID if needed
  if (initialCollegeId) {
      fetchNotes(initialCollegeId);
  }

});



{/* 
//search
//filter
//ADD NOTE (FORM TO SUBMIT TO DATABASE USING API POST AND GET THE RESULT IN THE SCREEN IN A SPECIFIC COURSE NAME )
//UPDATE NOTE (FORM TO SUBMIT TO DATABASE USING API PUT AND GET THE RESULT IN THE SCREEN IN A SPECIFIC COURSE NAME)

// FOR EACH COURSE HAVE BUTTON FOR ITS OWN COMMENT , SO I WANT WHEN IT CLICKED IT TAKES TO comment.php then theere the user can add his comment based on the course name 
//update the comment
//delete the comment
//pagination
*/}




