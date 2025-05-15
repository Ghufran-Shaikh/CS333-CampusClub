// CREATE
async function createSubject(subject) {
  return await fetch('https://f7e43c04-432e-44fd-b80d-8887899dbe29-00-3nco8oqvnjjy.worf.replit.dev/subject/create.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(subject)
  }).then(res => res.json());
}

// READ
async function fetchSubjects() {
  return await fetch('https://f7e43c04-432e-44fd-b80d-8887899dbe29-00-3nco8oqvnjjy.worf.replit.dev/subject/read.php')
    .then(res => res.json());
}

// UPDATE
async function updateSubject(subject) {
  return await fetch('https://f7e43c04-432e-44fd-b80d-8887899dbe29-00-3nco8oqvnjjy.worf.replit.dev/subject/update.php', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(subject)
  }).then(res => res.json());
}

// DELETE
async function deleteSubject(id) {
  return await fetch(`https://f7e43c04-432e-44fd-b80d-8887899dbe29-00-3nco8oqvnjjy.worf.replit.dev/subject/delete.php?id=${id}`, {
    method: 'DELETE'
  }).then(res => res.json());
}

async function createLocation(location) {
  return await fetch('https://f7e43c04-432e-44fd-b80d-8887899dbe29-00-3nco8oqvnjjy.worf.replit.dev/location/create.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(location)
  }).then(res => res.json());
}

async function fetchLocations() {
  return await fetch('https://f7e43c04-432e-44fd-b80d-8887899dbe29-00-3nco8oqvnjjy.worf.replit.dev/location/read.php')
    .then(res => res.json());
}

async function updateLocation(location) {
  return await fetch('https://f7e43c04-432e-44fd-b80d-8887899dbe29-00-3nco8oqvnjjy.worf.replit.dev/location/update.php', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(location)
  }).then(res => res.json());
}

async function deleteLocation(id) {
  return await fetch(`https://f7e43c04-432e-44fd-b80d-8887899dbe29-00-3nco8oqvnjjy.worf.replit.dev/location/delete.php?id=${id}`, {
    method: 'DELETE'
  }).then(res => res.json());
}


async function createStudent(student) {
  return await fetch('https://f7e43c04-432e-44fd-b80d-8887899dbe29-00-3nco8oqvnjjy.worf.replit.dev/student/create.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(student)
  }).then(res => res.json());
}

async function fetchStudents() {
  const response = await fetch('https://f7e43c04-432e-44fd-b80d-8887899dbe29-00-3nco8oqvnjjy.worf.replit.dev/student/read.php');
  const data = await response.json();
  return data;
}

async function updateStudent(student) {
  return await fetch('https://f7e43c04-432e-44fd-b80d-8887899dbe29-00-3nco8oqvnjjy.worf.replit.dev/student/update.php', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(student)
  }).then(res => res.json());
}

async function deleteStudent(id) {
  return await fetch(`https://f7e43c04-432e-44fd-b80d-8887899dbe29-00-3nco8oqvnjjy.worf.replit.dev/student/delete.php?id=${id}`, {
    method: 'DELETE'
  }).then(res => res.json());
}

async function createGroup(group) {
  console.log("Sending to server:", group); // Verify outgoing data
  
  try {
    const response = await fetch('https://f7e43c04-432e-44fd-b80d-8887899dbe29-00-3nco8oqvnjjy.worf.replit.dev/group/create.php', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(group)
    });

    console.log("Received response status:", response.status);
    
    if (!response.ok) {
      // Get error details even if response isn't JSON
      const errorText = await response.text();
      console.error("Server responded with error:", errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log("Parsed JSON response:", result);
    return result;
    
  } catch (error) {
    console.error("Network/parsing error:", {
      error: error,
      message: error.message,
      stack: error.stack
    });
    throw error; // Re-throw for handling in calling function
  }
}

async function fetchGroups() {
  const res = await fetch("https://f7e43c04-432e-44fd-b80d-8887899dbe29-00-3nco8oqvnjjy.worf.replit.dev/group/read.php");
  return await res.json();
}




async function updateGroup(group) {
  return await fetch('https://f7e43c04-432e-44fd-b80d-8887899dbe29-00-3nco8oqvnjjy.worf.replit.dev/group/update.php', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(group)
  }).then(res => res.json());
}

async function deleteGroup(id) {
  return await fetch(`https://f7e43c04-432e-44fd-b80d-8887899dbe29-00-3nco8oqvnjjy.worf.replit.dev/group/delete.php?id=${id}`, {
    method: 'DELETE'
  }).then(res => res.json());
}

// Export fetchGroups to make it available for import
export { fetchGroups, fetchSubjects, fetchLocations, fetchStudents, createGroup, createSubject, createLocation, createStudent, updateGroup, updateSubject, updateLocation, updateStudent, deleteGroup, deleteSubject, deleteLocation, deleteStudent};
