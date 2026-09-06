/* =========================================================
   LOCO PILOT EVENT & TELEMETRY CONTROLLER
========================================================= */

let selectedFactor = "Heavy Traffic";

function showPilotMessage(message) {
  const comments = document.getElementById('pilotComments');
  const container = comments ? comments.closest('.section') : null;
  if (!container) return;
  let messageElement = container.querySelector('.js-message');
  if (!messageElement) {
    messageElement = document.createElement('p');
    messageElement.className = 'js-message';
    container.appendChild(messageElement);
  }
  messageElement.textContent = message;
}

// Handle Operational Factor Selection
function selectFactor(button, factorName) {
  document.querySelectorAll('.factor-btn').forEach(btn => btn.classList.remove('active'));
  button.classList.add('active');
  selectedFactor = factorName;

  const otherContainer = document.getElementById('otherFactorContainer');
  const otherInput = document.getElementById('otherFactor');
  const isOther = factorName === 'Others';
  if (otherContainer) otherContainer.style.display = isOther ? 'flex' : 'none';
  if (isOther && otherInput) otherInput.focus();
  if (!isOther && otherInput) otherInput.value = '';
}

// Default initial log dataset
const defaultLogs = [
  { time: "16:15 IST", factor: "Signal Issue", impact: "Medium Impact", location: "Dharmavaram | Signal congested, holding short." },
  { time: "15:45 IST", factor: "Weather", impact: "Low Impact", location: "Dharmavaram | Light rain, speed limit 60 km/h." }
];

function getPilotLogs() {
  const stored = localStorage.getItem('railwatch_pilot_logs');
  return stored ? JSON.parse(stored) : defaultLogs;
}

// Render the Timeline Log
function renderPilotLogs() {
  const container = document.getElementById('pilotLogContainer');
  if (!container) return;

  const logs = getPilotLogs();

  if (logs.length === 0) {
    container.innerHTML = `<p style="text-align:center; color:#94a3b8; font-size:13px;">No events reported yet.</p>`;
    return;
  }

  container.innerHTML = logs.map(log => `
    <div class="log-item">
      <div>
        <strong>${log.factor}</strong> <span class="telemetry-badge">${log.impact}</span>
        <p style="font-size: 12px; color: #475569; margin-top: 4px;">${log.location}</p>
      </div>
      <div class="log-time">${log.time}</div>
    </div>
  `).join('');
}

// Submit Event & Synchronize with Admin Panel and User Dashboard
function submitPilotEvent() {
  const comments = document.getElementById('pilotComments').value.trim();
  const otherFactor = document.getElementById('otherFactor')?.value.trim() || '';
  const impact = document.getElementById('pilotImpact').value;

  if (selectedFactor === 'Others' && !otherFactor) {
    showPilotMessage('Describe the Other Factors');
    return;
  }

  if (!comments) {
    showPilotMessage('Mention the location / comments');
    return;
  }

  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + " IST";

  const newLog = {
    time: timeStr,
    factor: selectedFactor,
    impact: impact,
    location: selectedFactor === 'Others' ? `${otherFactor} | ${comments}` : comments
  };

  // 1. Save locally to Pilot Log Timeline
  const logs = getPilotLogs();
  logs.unshift(newLog);
  localStorage.setItem('railwatch_pilot_logs', JSON.stringify(logs));

  // 2. Automatically dispatch to System Alerts (Visible on Admin & Dashboard)
  const existingAlerts = JSON.parse(localStorage.getItem('railwatch_alerts') || '[]');
  existingAlerts.unshift({
    title: `${selectedFactor} Reported by Loco Pilot`,
    desc: selectedFactor === 'Others' ? `${otherFactor} | ${comments}` : comments,
    tag: impact,
    severity: impact.includes('High') ? 'danger-bg' : 'warning-bg',
    time: timeStr,
    source: 'Loco Pilot Update'
  });
  localStorage.setItem('railwatch_alerts', JSON.stringify(existingAlerts));

  // Reset & Re-render
  document.getElementById('pilotComments').value = '';
  renderPilotLogs();

  showPilotMessage('Event successfully transmitted to Admin Console and Live Dashboard.');
}

// Initialize on Page Load
document.addEventListener("DOMContentLoaded", () => {
  renderPilotLogs();
});