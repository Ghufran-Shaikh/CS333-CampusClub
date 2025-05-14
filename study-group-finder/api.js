// CREATE
async function createSubject(subject) {
  return await fetch('http://localhost:3000/subject/create.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(subject)
  }).then(res => res.json());
}

// READ
async function fetchSubjects() {
  return await fetch('http://localhost:3000/subject/read.php')
    .then(res => res.json());
}

// UPDATE
async function updateSubject(subject) {
  return await fetch('http://localhost:3000/subject/update.php', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(subject)
  }).then(res => res.json());
}

// DELETE
async function deleteSubject(id) {
  return await fetch(`http://localhost:3000/subject/delete.php?id=${id}`, {
    method: 'DELETE'
  }).then(res => res.json());
}

async function createLocation(location) {
  return await fetch('http://localhost:3000/location/create.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(location)
  }).then(res => res.json());
}

async function fetchLocations() {
  return await fetch('http://localhost:3000/location/read.php')
    .then(res => res.json());
}

async function updateLocation(location) {
  return await fetch('http://localhost:3000/location/update.php', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(location)
  }).then(res => res.json());
}

async function deleteLocation(id) {
  return await fetch(`http://localhost:3000/location/delete.php?id=${id}`, {
    method: 'DELETE'
  }).then(res => res.json());
}


async function createStudent(student) {
  return await fetch('http://localhost:3000/student/create.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(student)
  }).then(res => res.json());
}

async function fetchStudents() {
  const response = await fetch('http://localhost:3000/student/read.php');
  const data = await response.json();
  return data;
}

async function updateStudent(student) {
  return await fetch('http://localhost:3000/student/update.php', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(student)
  }).then(res => res.json());
}

async function deleteStudent(id) {
  return await fetch(`http://localhost:3000/student/delete.php?id=${id}`, {
    method: 'DELETE'
  }).then(res => res.json());
}

async function createGroup(group) {
  return await fetch('http://localhost:3000/group/create.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(group)
  }).then(res => res.json());
}

async function fetchGroups() {
  const res = await fetch("https://f7e43c04-432e-44fd-b80d-8887899dbe29-00-3nco8oqvnjjy.worf.replit.dev/group/read.php");
  return await res.json();
}


async function updateGroup(group) {
  return await fetch('http://localhost:3000/group/update.php', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(group)
  }).then(res => res.json());
}

async function deleteGroup(id) {
  return await fetch(`http://localhost:3000/group/delete.php?id=${id}`, {
    method: 'DELETE'
  }).then(res => res.json());
}

// Export fetchGroups to make it available for import
export { fetchGroups };
