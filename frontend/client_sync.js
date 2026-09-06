/* Sync User Dashboard with Admin Settings */
document.addEventListener("DOMContentLoaded", () => {

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

  // 3. Sync User Feedbacks to LocalStorage for Admin Panel
  window.submitFeedback = function() {
    const textInput = document.getElementById("feedbackText");
    const typeSelect = document.querySelector(".feedback-form select");

    if (!textInput || textInput.value.trim() === "") {
      alert("Please enter your feedback.");
      return;
    }

    const feedbackList = JSON.parse(localStorage.getItem('railwatch_user_feedback') || '[]');
    feedbackList.unshift({
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: typeSelect ? typeSelect.value : 'General',
      text: textInput.value.trim(),
      rating: '😊'
    });

    localStorage.setItem('railwatch_user_feedback', JSON.stringify(feedbackList));
    alert("Thank you! Your feedback has been sent to the Admin team.");
    textInput.value = "";
  };

});