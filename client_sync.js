/* Sync User Dashboard with Admin Settings */
function syncClientDashboard() {

  const alertContainer = document.getElementById('userAlertContainer');
  const storedAlertsValue = localStorage.getItem('railwatch_alerts');
  let storedAlerts = [];
  try {
    storedAlerts = JSON.parse(storedAlertsValue || '[]');
  } catch {
    storedAlerts = [];
  }
  if (!Array.isArray(storedAlerts)) storedAlerts = [];
  if (alertContainer && storedAlertsValue !== null) {
    alertContainer.querySelectorAll('.default-alert').forEach(alert => alert.remove());
    alertContainer.insertAdjacentHTML('afterbegin', storedAlerts.map(alert => `
      <div class="card alert-card-large">
        <div class="alert-symbol ${alert.severity}">🚨</div>
        <div class="alert-content">
          <div class="alert-top">
            <h3>${alert.title}</h3>
            <small>${alert.time}</small>
          </div>
          <p>${alert.desc}</p>
          <span class="alert-tag">${alert.tag}</span>
        </div>
      </div>
    `).join(''));
  }

  // 1. Sync Live Overview Card Data
  let liveData = null;
  try {
    liveData = JSON.parse(localStorage.getItem('railwatch_live_data') || 'null');
  } catch {
    liveData = null;
  }
  if (liveData) {
    const locElem = document.getElementById('dashboardLocation');
    if (locElem && liveData.location) locElem.textContent = liveData.location;

    const platformElem = document.getElementById('dashboardPlatform');
    if (platformElem && liveData.platform) platformElem.textContent = liveData.platform;

    const delayElem = document.getElementById('dashboardDelay');
    if (delayElem && liveData.delay) delayElem.textContent = liveData.delay;

    const etaElem = document.getElementById('dashboardAiEta');
    if (etaElem && liveData.eta) etaElem.textContent = liveData.eta;

    const confElem = document.querySelector(".confidence strong");
    if (confElem && liveData.confidence) confElem.textContent = liveData.confidence + "%";
  }

  // 2. Sync Schedule Table
  let customSchedule = null;
  try {
    customSchedule = JSON.parse(localStorage.getItem('railwatch_schedule') || 'null');
  } catch {
    customSchedule = null;
  }
  if (!Array.isArray(customSchedule)) customSchedule = null;
  const tableBody = document.querySelector("table tbody");
  if (customSchedule && tableBody) {
    tableBody.innerHTML = customSchedule.map(row => `
      <tr class="${row.status === 'Current Stop' ? 'current' : ''}">
        <td><strong>${row.station}</strong></td>
        <td>${row.scheduled}</td>
        <td class="blue">${row.eta || row.scheduled}</td>
        <td>${row.delay || '—'}</td>
        <td><span class="status ${row.status === 'Departed' ? 'green' : row.status === 'Current Stop' ? 'blue-bg' : 'gray'}">${row.status}</span></td>
      </tr>
    `).join('');

    const currentStop = customSchedule.find(row => row.status === 'Current Stop');
    if (currentStop) {
      const locationElement = document.getElementById('dashboardLocation');
      if (locationElement) locationElement.textContent = currentStop.station;
    }

    const destination = customSchedule[customSchedule.length - 1];
    const scheduledEtaElement = document.getElementById('dashboardScheduledEta');
    const aiEtaElement = document.getElementById('dashboardAiEta');
    if (destination?.scheduled && scheduledEtaElement) scheduledEtaElement.textContent = destination.scheduled;
    if (destination?.eta && aiEtaElement) aiEtaElement.textContent = destination.eta;
  }

}

document.addEventListener("DOMContentLoaded", syncClientDashboard);
window.addEventListener('storage', event => {
  if (['railwatch_live_data', 'railwatch_schedule', 'railwatch_alerts'].includes(event.key)) {
    syncClientDashboard();
  }
});