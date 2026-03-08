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
  // Fix keys and convert dates
   const payload = {
  name: group.name.toString().trim(),
  subject_id: Number(group.subject),
location_id: Number(group.location),
  coverage: group.coverage ? group.coverage.toString().trim() : null,
  start_date: convertDateToSQLFormat(group.start_date),
  end_date: convertDateToSQLFormat(group.end_date),
  start_time: group.start_time ? group.start_time.toString().trim() : null,
  end_time: group.end_time ? group.end_time.toString().trim() : null,
  repetition: group.repetition ? group.repetition.toString().trim() : null,
  gender_set: group.gender_set ? group.gender_set.toString().trim() : 'both',
  members_quantity_limit: group.members_quantity_limit ? Number(group.members_quantity_limit) : 0,
  agenda: group.agenda ? group.agenda.toString().trim() : null,
  attachment_path: group.attachment_path ? group.attachment_path.toString().trim() : null
};


  delete payload.subject;
  delete payload.location;

  console.log("Sending to server (after fix):", payload);

  try {
    const response = await fetch('https://f7e43c04-432e-44fd-b80d-8887899dbe29-00-3nco8oqvnjjy.worf.replit.dev/group/create.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    console.log("Received response status:", response.status);

    if (!response.ok) {
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
    throw error;
  }
}
function convertDateToSQLFormat(dateStr) {
  if (!dateStr) return null;
  // Handle "DD-MM-YYYY" (flowbite datepicker default)
  if (/^\d{2}-\d{2}-\d{4}$/.test(dateStr)) {
    const [day, month, year] = dateStr.split('-');
    return `${year}-${month}-${day}`;
  }
  // Handle "MM/DD/YYYY"
  if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateStr)) {
    const [month, day, year] = dateStr.split('/');
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }
  // Already in YYYY-MM-DD or other format — pass through
  return dateStr;
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
