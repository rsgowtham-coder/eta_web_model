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
  alert("Live Dashboard updated successfully across user interfaces!");
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
    alert("Please enter station details.");
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
    alert("Please enter alert title and description.");
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

/* Initialize Admin Logic on Page Load */
document.addEventListener("DOMContentLoaded", () => {
  renderSchedule();
  renderAlerts();
  renderFeedback();
});