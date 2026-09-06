/* =========================
   TRAIN SEARCH
========================= */

const trains = [
  { number: "12627", name: "Karnataka Sampark Kranti Express", from: "Hazrat Nizamuddin", to: "KSR Bengaluru" },
  { number: "12628", name: "Karnataka Express", from: "KSR Bengaluru", to: "New Delhi" },
  { number: "12951", name: "Mumbai Rajdhani Express", from: "Mumbai Central", to: "New Delhi" }
];

function showAppMessage(message, element) {
  if (!element) return;
  let messageElement = element.querySelector('.js-message');
  if (!messageElement) {
    messageElement = document.createElement('p');
    messageElement.className = 'js-message';
    element.appendChild(messageElement);
  }
  messageElement.textContent = message;
}

function renderTrainResults(results) {
  const container = document.getElementById("trainResults");
  if (!container) return;

  container.innerHTML = results.length
    ? results.map(train => `
        <div class="card train-result">
          <div class="train-result-icon">🚆</div>
          <div class="train-result-info">
            <h3>${train.number} - ${train.name}</h3>
            <p>${train.from} → ${train.to}</p>
          </div>
        </div>
      `).join("")
    : '<div class="card section"><p>No matching trains found.</p></div>';
}

function searchTrain() {
  const input = document.getElementById("trainInput");
  const status = document.getElementById("searchStatus");
  if (!input) return;

  const query = input.value.trim().toLowerCase();
  const from = (document.getElementById("fromInput")?.value || "").trim().toLowerCase();
  const to = (document.getElementById("toInput")?.value || "").trim().toLowerCase();

  if (!query) {
    if (status) status.textContent = "Please enter a train number or name.";
    renderTrainResults([]);
    return;
  }

  const results = trains.filter(train =>
    (`${train.number} ${train.name}`).toLowerCase().includes(query) &&
    (!from || train.from.toLowerCase().includes(from)) &&
    (!to || train.to.toLowerCase().includes(to))
  );

  if (status) status.textContent = `${results.length} train${results.length === 1 ? "" : "s"} found.`;
  renderTrainResults(results);
}

const searchButton = document.getElementById("searchButton");
if (searchButton) searchButton.addEventListener("click", searchTrain);

if (document.getElementById("trainResults")) renderTrainResults(trains);


/* =========================
   FEEDBACK
========================= */

function submitFeedback() {

  const text = document
    .getElementById("feedbackText");

  if (!text) return;

  if (text.value.trim() === "") {

    showAppMessage('Please enter your feedback.', text.closest('.feedback-form'));

    return;
  }

  const typeSelect = document.querySelector(".feedback-form select");
  const selectedRating = document.querySelector(".rating button[data-selected='true']");
  const feedbackList = JSON.parse(localStorage.getItem("railwatch_user_feedback") || "[]");

  feedbackList.unshift({
    timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    type: typeSelect ? typeSelect.value : "General",
    text: text.value.trim(),
    rating: selectedRating ? selectedRating.textContent : "N/A"
  });

  localStorage.setItem("railwatch_user_feedback", JSON.stringify(feedbackList));
  showAppMessage('Thank you! Your feedback has been sent to the Admin team.', text.closest('.feedback-form'));

  text.value = "";

}


/* =========================
   RATING
========================= */

const ratings =
  document.querySelectorAll(".rating button");

ratings.forEach(button => {

  button.addEventListener("click", () => {

    ratings.forEach(item => {
      item.style.background = "white";
      item.dataset.selected = "false";
    });

    button.style.background = "#eaf2ff";
    button.dataset.selected = "true";

  });

});


/* =========================
   SHARE STATUS
========================= */

const shareButton =
  document.querySelector(".topbar button");

if (shareButton) {

  shareButton.addEventListener("click", async () => {

    const message =
      "Train 12627 is currently delayed by 1h 12m. AI predicted ETA: 12:05 AM.";

    if (navigator.share) {

      await navigator.share({
        title: "RailWatch AI",
        text: message
      });

    } else {

      navigator.clipboard.writeText(message);

      showAppMessage('Train status copied to clipboard.', shareButton.parentElement);

    }

  });

}