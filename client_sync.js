/* Sync User Dashboard with Admin Settings */
document.addEventListener("DOMContentLoaded", () => {

  const alertContainer = document.getElementById('userAlertContainer');
  const storedAlerts = JSON.parse(localStorage.getItem('railwatch_alerts') || '[]');
  if (alertContainer && storedAlerts.length) {
    alertContainer.querySelectorAll('.default-alert').forEach(alert => alert.remove());
    alertContainer.insertAdjacentHTML('afterbegin', storedAlerts.map(alert => `s
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
  const liveData = JSON.parse(localStorage.getItem('railwatch_live_data'));
  if (liveData) {
    const locElem = document.querySelector(".stat-card h2");
    if (locElem && liveData.location) locElem.textContent = liveData.location;

    const delayElem = document.querySelector(".stat-card .danger");
    if (delayElem && liveData.delay) delayElem.textContent = liveData.delay;

    const etaElem = document.querySelector(".eta-box .success");
    if (etaElem && liveData.eta) etaElem.textContent = liveData.eta;

    const confElem = document.querySelector(".confidence strong");
    if (confElem && liveData.confidence) confElem.textContent = liveData.confidence + "%";
  }

  // 2. Sync Schedule Table
  const customSchedule = JSON.parse(localStorage.getItem('railwatch_schedule'));
  const tableBody = document.querySelector("table tbody");
  if (customSchedule && tableBody) {
    tableBody.innerHTML = customSchedule.map(row => `
      <tr class="${row.status === 'Current Stop' ? 'current' : ''}">
        <td><strong>${row.station}</strong></td>
        <td>${row.scheduled}</td>
        <td>—</td>
        <td class="blue">${row.eta}</td>
        <td>—</td>
        <td><span class="status ${row.status === 'Departed' ? 'green' : row.status === 'Current Stop' ? 'blue-bg' : 'gray'}">${row.status}</span></td>
      </tr>
    `).join('');
  }

});