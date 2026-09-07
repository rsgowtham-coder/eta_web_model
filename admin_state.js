/* =========================================================
   ADMIN PANEL NAVIGATION & STATE SYNCHRONIZATION
========================================================= */

const requiredRole = document.body.dataset.requiredRole;
if (requiredRole && typeof requireRole === 'function') {
  requireRole(requiredRole);
}

// Tab Navigation
function switchTab(event, tabId) {
  const tabs = document.querySelectorAll('.admin-tab');
  const contents = document.querySelectorAll('.tab-content');

  tabs.forEach(tab => tab.classList.remove('active'));
  contents.forEach(content => content.classList.remove('active'));

  event.currentTarget.classList.add('active');
  const targetContent = document.getElementById(tabId);
  if (targetContent) {
    targetContent.classList.add('active');
  }
}

function togglePassword(inputId, button) {
  const input = document.getElementById(inputId);
  if (!input) return;
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
  const trainNameElem = document.getElementById('trainName');
  const locationElem = document.getElementById('currentLocation');
  const platformElem = document.getElementById('platform');
  const delayElem = document.getElementById('currentDelay');
  const etaElem = document.getElementById('aiEta');
  const confidenceElem = document.getElementById('confidence');

  if (!trainNameElem || !locationElem) return;

  const livePayload = {
    trainName: trainNameElem.value,
    location: locationElem.value,
    platform: platformElem ? platformElem.value : '',
    delay: delayElem ? delayElem.value : '',
    eta: etaElem ? etaElem.value : '',
    confidence: confidenceElem ? confidenceElem.value : ''
  };

  localStorage.setItem('railwatch_live_data', JSON.stringify(livePayload));
  showAdminMessage('Live Dashboard updated successfully across user interfaces.', 'liveDataForm');
}

function loadLiveData() {
  const stored = localStorage.getItem('railwatch_live_data');
  if (!stored) return;

  try {
    const liveData = JSON.parse(stored);
    const fields = {
      trainName: liveData.trainName,
      currentLocation: liveData.location,
      platform: liveData.platform,
      currentDelay: liveData.delay,
      aiEta: liveData.eta,
      confidence: liveData.confidence
    };

    Object.entries(fields).forEach(([id, value]) => {
      const field = document.getElementById(id);
      if (field && value !== undefined) field.value = value;
    });
  } catch {
    // Keep defaults if parsing fails
  }
}

const adminAvailabilityStorageKey = 'railwatch_train_availability';
const availabilityDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function getAvailabilityOverrides() {
  try {
    return JSON.parse(localStorage.getItem(adminAvailabilityStorageKey) || '{}');
  } catch {
    return {};
  }
}

function renderAvailabilityEditor() {
  const select = document.getElementById('availabilityTrain');
  const editor = document.getElementById('availabilityEditor');
  if (!select || !editor || typeof trains === 'undefined') return;

  select.innerHTML = trains.map(train =>
    `<option value="${train.number}">${train.number} - ${train.name}</option>`
  ).join('');

  const renderDays = () => {
    const train = trains.find(item => item.number === select.value);
    const overrides = getAvailabilityOverrides();
    const availability = overrides[select.value] || train?.availability || [];
    editor.innerHTML = availabilityDays.map((day, index) => `
      <label class="availability-editor-day">
        <input type="checkbox" data-availability-index="${index}" ${availability[index] ? 'checked' : ''}>
        <span>${day}</span>
      </label>
    `).join('');
  };

  select.addEventListener('change', renderDays);
  renderDays();
}

function saveAvailability() {
  const select = document.getElementById('availabilityTrain');
  const editor = document.getElementById('availabilityEditor');
  if (!select || !editor) return;

  const availability = Array.from(editor.querySelectorAll('[data-availability-index]'), input => input.checked);
  const overrides = getAvailabilityOverrides();
  overrides[select.value] = availability;
  localStorage.setItem(adminAvailabilityStorageKey, JSON.stringify(overrides));

  const selectedTrain = JSON.parse(localStorage.getItem('railwatch_selected_train') || 'null');
  if (selectedTrain?.number === select.value) {
    selectedTrain.availability = availability;
    localStorage.setItem('railwatch_selected_train', JSON.stringify(selectedTrain));
  }
  showAdminMessage('Train availability updated successfully.', 'availabilityForm');
}

/* =========================================================
   2. TRAIN SCHEDULE MANAGEMENT
========================================================= */
let defaultSchedule = [
  { station: "Hazrat Nizamuddin", scheduled: "08:15 AM", eta: "08:15 AM", status: "Departed" },
  { station: "Mathura Junction", scheduled: "10:15 AM", eta: "10:30 AM", status: "Departed" },
  { station: "Guntakal Junction", scheduled: "04:10 PM", eta: "05:30 PM", status: "Departed" },
  { station: "Anantapur", scheduled: "07:55 PM", eta: "09:10 PM", delay: "+1h 15m", status: "Current Stop" },
  { station: "Dharmavaram", scheduled: "09:25 PM", eta: "09:50 PM", delay: "+25m", status: "Not Reached" },
  { station: "KSR Bengaluru", scheduled: "10:30 PM", eta: "12:05 AM", delay: "+1h 35m", status: "Not Reached" }
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
        <button type="button" class="btn-delete" onclick="deleteScheduleRow(${index})">Remove</button>
      </td>
    </tr>
  `).join('');
}

function addScheduleRow() {
  const stationElem = document.getElementById('schedStation');
  const scheduledElem = document.getElementById('schedTime');
  const etaElem = document.getElementById('schedAiTime');
  const statusElem = document.getElementById('schedStatus');

  if (!stationElem || !scheduledElem) return;

  const station = stationElem.value.trim();
  const scheduled = scheduledElem.value.trim();
  const eta = etaElem ? etaElem.value.trim() : '';
  const status = statusElem ? statusElem.value : 'Not Reached';

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
        <button type="button" class="btn-delete" style="margin-top: 5px;" onclick="deleteAlert(${i})">Clear Alert</button>
      </div>
    </div>
  `).join('');
}

function broadcastAlert() {
  const titleElem = document.getElementById('alertTitle');
  const descElem = document.getElementById('alertDesc');
  const severityElem = document.getElementById('alertSeverity');

  if (!titleElem || !descElem) return;

  const title = titleElem.value.trim();
  const desc = descElem.value.trim();
  const severity = severityElem ? severityElem.value : 'low';

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
function renderUsers() {
  const tbody = document.getElementById('userTableBody');
  if (!tbody) return;

  const users = typeof getLoginUsers === 'function' ? getLoginUsers() : [];
  if (users.length === 0) {
    tbody.innerHTML = '<tr><td colspan="3" style="text-align:center; color:#718096;">No login accounts available.</td></tr>';
    return;
  }

  tbody.innerHTML = users.map((user, index) => `
    <tr>
      <td>${user.email}</td>
      <td><span class="status ${user.role === 'admin' || user.role === 'data' ? 'blue-bg' : 'green'}">${user.role === 'admin' ? 'Admin Panel' : user.role === 'data' ? 'Data Console' : user.role === 'user' ? 'Passenger' : 'Loco Pilot Panel'}</span></td>
      <td class="table-actions">
        <button type="button" class="btn-edit" onclick="openEditUser(${index})">Edit</button>
        <button type="button" class="btn-delete" onclick="revokeUser(${index})">Remove</button>
      </td>
    </tr>
  `).join('');
}

function addUser(event) {
  event.preventDefault();

  const emailElem = document.getElementById('loginEmail');
  const passwordElem = document.getElementById('loginPassword');
  const roleElem = document.getElementById('loginRole');

  if (!emailElem || !passwordElem) return;

  const email = emailElem.value.trim().toLowerCase();
  const password = passwordElem.value;
  const role = roleElem ? roleElem.value : 'user';
  const users = typeof getLoginUsers === 'function' ? getLoginUsers() : [];

  if (users.some(user => user.email.toLowerCase() === email)) {
    showAdminMessage('That login ID already exists.', 'userForm');
    return;
  }

  users.push({ email, password, role });
  if (typeof saveLoginUsers === 'function') {
    saveLoginUsers(users);
  } else {
    localStorage.setItem('railwatch_login_users', JSON.stringify(users));
  }

  renderUsers();
  document.getElementById('userForm').reset();
}

let editingUserIndex = -1;

function openEditUser(index) {
  const users = typeof getLoginUsers === 'function' ? getLoginUsers() : [];
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

  const users = typeof getLoginUsers === 'function' ? getLoginUsers() : [];
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

  if (typeof saveLoginUsers === 'function') {
    saveLoginUsers(users);
  } else {
    localStorage.setItem('railwatch_login_users', JSON.stringify(users));
  }

  renderUsers();
  closeEditUser();
}

function revokeUser(index) {
  const users = typeof getLoginUsers === 'function' ? getLoginUsers() : [];
  const user = users[index];
  if (!user) return;

  if (!confirm(`Remove login access for ${user.email}?`)) return;

  users.splice(index, 1);
  if (typeof saveLoginUsers === 'function') {
    saveLoginUsers(users);
  } else {
    localStorage.setItem('railwatch_login_users', JSON.stringify(users));
  }

  renderUsers();
}

/* Initialize Admin Logic on Page Load */
document.addEventListener("DOMContentLoaded", () => {
  loadLiveData();
  renderAvailabilityEditor();
  renderSchedule();
  renderAlerts();
  renderFeedback();
  renderUsers();
});

window.addEventListener('storage', event => {
  if (event.key === 'railwatch_live_data') loadLiveData();
  if (event.key === 'railwatch_alerts') renderAlerts();
  if (event.key === 'railwatch_user_feedback') renderFeedback();
  if (event.key === 'railwatch_users' || event.key === 'railwatch_login_users') renderUsers();
});