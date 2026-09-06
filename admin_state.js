/* =========================================================
   ADMIN PANEL NAVIGATION & STATE SYNCHRONIZATION
========================================================= */

// Tab Navigation
function switchTab(event, tabId) {
  const tabs = document.querySelectorAll('.admin-tab');
  const contents = document.querySelectorAll('.tab-content');

  tabs.forEach(tab => tab.classList.remove('active'));
  contents.forEach(content => content.classList.remove('active'));

  event.currentTarget.classList.add('active');
  document.getElementById(tabId).classList.add('active');
}

function togglePassword(inputId, button) {
  const input = document.getElementById(inputId);
  const showing = input.type === 'text';
  input.type = showing ? 'password' : 'text';
  button.textContent = showing ? '◉' : '◎';
  button.setAttribute('aria-label', showing ? 'Show password' : 'Hide password');
}

function showAdminMessage(message, elementId) {
  const element = document.getElementById(elementId);
  if (!element) return;
  let messageElement = element.querySelector('.js-message');
  if (!messageElement) {
    messageElement = document.createElement('p');
    messageElement.className = 'js-message';
    element.appendChild(messageElement);
  }
  messageElement.textContent = message;
}

/* =========================================================
   1. LIVE DATA MANAGEMENT
========================================================= */
function saveLiveData() {
  const livePayload = {
    trainName: document.getElementById('trainName').value,
    location: document.getElementById('currentLocation').value,
    platform: document.getElementById('platform').value,
    delay: document.getElementById('currentDelay').value,
    eta: document.getElementById('aiEta').value,
    confidence: document.getElementById('confidence').value
  };

  localStorage.setItem('railwatch_live_data', JSON.stringify(livePayload));
  showAdminMessage('Live Dashboard updated successfully across user interfaces.', 'liveDataForm');
}

/* =========================================================
   2. TRAIN SCHEDULE MANAGEMENT
========================================================= */
let defaultSchedule = [
  { station: "Hazrat Nizamuddin", scheduled: "08:15 AM", eta: "08:15 AM", status: "Departed" },
  { station: "Guntakal Junction", scheduled: "04:10 PM", eta: "05:30 PM", status: "Departed" },
  { station: "Anantapur", scheduled: "07:55 PM", eta: "09:10 PM", status: "Current Stop" },
  { station: "Dharmavaram", scheduled: "09:25 PM", eta: "09:50 PM", status: "Not Reached" }
];

function getSchedule() {
  const stored = localStorage.getItem('railwatch_schedule');
  return stored ? JSON.parse(stored) : defaultSchedule;
}

function renderSchedule() {
  const tbody = document.getElementById('scheduleTableBody');
  if (!tbody) return;
  const schedule = getSchedule();

  tbody.innerHTML = schedule.map((item, index) => `
    <tr>
      <td><strong>${item.station}</strong></td>
      <td>${item.scheduled}</td>
      <td>${item.eta}</td>
      <td><span class="status ${item.status === 'Departed' ? 'green' : item.status === 'Current Stop' ? 'blue-bg' : 'gray'}">${item.status}</span></td>
      <td class="table-actions">
        <button class="btn-delete" onclick="deleteScheduleRow(${index})">Remove</button>
      </td>
    </tr>
  `).join('');
}

function addScheduleRow() {
  const station = document.getElementById('schedStation').value.trim();
  const scheduled = document.getElementById('schedTime').value.trim();
  const eta = document.getElementById('schedAiTime').value.trim();
  const status = document.getElementById('schedStatus').value;

  if (!station || !scheduled) {
    showAdminMessage('Please enter station details.', 'scheduleForm');
    return;
  }

  const schedule = getSchedule();
  schedule.push({ station, scheduled, eta: eta || scheduled, status });
  localStorage.setItem('railwatch_schedule', JSON.stringify(schedule));
  
  renderSchedule();
  document.getElementById('scheduleForm').reset();
}

function deleteScheduleRow(index) {
  const schedule = getSchedule();
  schedule.splice(index, 1);
  localStorage.setItem('railwatch_schedule', JSON.stringify(schedule));
  renderSchedule();
}

/* =========================================================
   3. ALERT CONFIGURATION
========================================================= */
let defaultAlerts = [
  { title: "Train Delay Detected", desc: "Train 12627 is currently delayed by 1 hour 12 minutes.", tag: "High Impact", severity: "danger-bg", time: "Just now" }
];

function getAlerts() {
  const stored = localStorage.getItem('railwatch_alerts');
  return stored ? JSON.parse(stored) : defaultAlerts;
}

function renderAlerts() {
  const container = document.getElementById('adminAlertContainer');
  if (!container) return;
  const alerts = getAlerts();

  container.innerHTML = alerts.map((a, i) => `
    <div class="card alert-card-large">
      <div class="alert-symbol ${a.severity}">🚨</div>
      <div class="alert-content">
        <div class="alert-top">
          <h3>${a.title}</h3>
          <small>${a.time}</small>
        </div>
        <p>${a.desc}</p>
        ${a.source ? `<span class="alert-tag">${a.source}</span>` : ''}
        <button class="btn-delete" style="margin-top: 5px;" onclick="deleteAlert(${i})">Clear Alert</button>
      </div>
    </div>
  `).join('');
}

function broadcastAlert() {
  const title = document.getElementById('alertTitle').value.trim();
  const desc = document.getElementById('alertDesc').value.trim();
  const severity = document.getElementById('alertSeverity').value;

  if (!title || !desc) {
    showAdminMessage('Please enter alert title and description.', 'alertForm');
    return;
  }

  const alerts = getAlerts();
  const bgMap = { high: "danger-bg", medium: "warning-bg", low: "blue-bg" };
  const tagMap = { high: "High Impact", medium: "Warning", low: "Live Update" };

  alerts.unshift({ title, desc, tag: tagMap[severity], severity: bgMap[severity], time: "Just now" });
  localStorage.setItem('railwatch_alerts', JSON.stringify(alerts));

  renderAlerts();
  document.getElementById('alertForm').reset();
}

function deleteAlert(index) {
  const alerts = getAlerts();
  alerts.splice(index, 1);
  localStorage.setItem('railwatch_alerts', JSON.stringify(alerts));
  renderAlerts();
}

/* =========================================================
   4. PASSENGER FEEDBACK INGESTION
========================================================= */
function renderFeedback() {
  const tbody = document.getElementById('feedbackTableBody');
  if (!tbody) return;

  const storedFeedback = JSON.parse(localStorage.getItem('railwatch_user_feedback') || '[]');

  if (storedFeedback.length === 0) {
    tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; color:#718096;">No user feedback submitted yet.</td></tr>`;
    return;
  }

  tbody.innerHTML = storedFeedback.map(item => `
    <tr>
      <td>${item.timestamp}</td>
      <td><strong>${item.type}</strong></td>
      <td>${item.text}</td>
      <td>${item.rating || 'N/A'}</td>
    </tr>
  `).join('');
}

/* =========================================================
   5. USER MANAGEMENT
========================================================= */
const defaultUsers = [
  { id: "#USR-8821", name: "alex.m@example.com", role: "Passenger", status: "Active" },
  { id: "#ADM-0001", name: "admin.jane@railwatch.ai", role: "Admin", status: "Active" }
];

function getUsers() {
  const stored = localStorage.getItem('railwatch_users');
  return stored ? JSON.parse(stored) : defaultUsers;
}

function renderUsers() {
  const tbody = document.getElementById('userTableBody');
  if (!tbody) return;

  const users = getLoginUsers();
  if (users.length === 0) {
    tbody.innerHTML = '<tr><td colspan="3" style="text-align:center; color:#718096;">No login accounts available.</td></tr>';
    return;
  }

  tbody.innerHTML = users.map((user, index) => `
    <tr>
      <td>${user.email}</td>
      <td><span class="status ${user.role === 'admin' ? 'blue-bg' : 'green'}">${user.role === 'admin' ? 'Admin Panel' : 'Loco Pilot Panel'}</span></td>
      <td class="table-actions">
        <button class="btn-edit" onclick="openEditUser(${index})">Edit</button>
        <button class="btn-delete" onclick="revokeUser(${index})">Remove</button>
      </td>
    </tr>
  `).join('');
}

function addUser(event) {
  event.preventDefault();

  const email = document.getElementById('loginEmail').value.trim().toLowerCase();
  const password = document.getElementById('loginPassword').value;
  const role = document.getElementById('loginRole').value;
  const users = getLoginUsers();

  if (users.some(user => user.email.toLowerCase() === email)) {
    showAdminMessage('That login ID already exists.', 'userForm');
    return;
  }

  users.push({ email, password, role });
  saveLoginUsers(users);
  renderUsers();
  document.getElementById('userForm').reset();
}

let editingUserIndex = -1;

function openEditUser(index) {
  const users = getLoginUsers();
  const user = users[index];
  if (!user) return;

  editingUserIndex = index;
  document.getElementById('editLoginEmail').value = user.email;
  document.getElementById('editLoginPassword').value = user.password;
  document.getElementById('editLoginRole').value = user.role;
  document.getElementById('editLoginError').textContent = '';
  document.getElementById('editLoginModal').classList.add('open');
}

function closeEditUser() {
  editingUserIndex = -1;
  document.getElementById('editLoginModal').classList.remove('open');
}

function saveEditedUser(event) {
  event.preventDefault();

  const users = getLoginUsers();
  const user = users[editingUserIndex];
  const email = document.getElementById('editLoginEmail').value.trim().toLowerCase();
  const password = document.getElementById('editLoginPassword').value;
  const role = document.getElementById('editLoginRole').value;
  const error = document.getElementById('editLoginError');

  if (!user || !email || !password) return;
  if (users.some((item, index) => index !== editingUserIndex && item.email.toLowerCase() === email)) {
    error.textContent = 'That login ID already exists.';
    return;
  }

  user.email = email;
  user.password = password;
  user.role = role;
  saveLoginUsers(users);
  renderUsers();
  closeEditUser();
}

function revokeUser(index) {
  const users = getLoginUsers();
  const user = users[index];
  if (!user) return;

  if (!confirm(`Remove login access for ${user.email}?`)) return;

  users.splice(index, 1);
  saveLoginUsers(users);
  renderUsers();
}

/* Initialize Admin Logic on Page Load */
document.addEventListener("DOMContentLoaded", () => {
  renderSchedule();
  renderAlerts();
  renderFeedback();
  renderUsers();
});

window.addEventListener('storage', event => {
  if (event.key === 'railwatch_alerts') renderAlerts();
  if (event.key === 'railwatch_user_feedback') renderFeedback();
  if (event.key === 'railwatch_users' || event.key === 'railwatch_login_users') renderUsers();
});