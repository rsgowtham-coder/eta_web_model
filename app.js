/* =========================
   TRAIN SEARCH
========================= */

function searchTrain() {

  const input = document
    .getElementById("trainInput");

  if (!input) return;

  const value = input.value.trim();

  if (value === "") {
    alert("Please enter a train number or name.");
    return;
  }

  alert(
    "Searching for train: " + value
  );
}


/* =========================
   FEEDBACK
========================= */

function submitFeedback() {

  const text = document
    .getElementById("feedbackText");

  if (!text) return;

  if (text.value.trim() === "") {

    alert("Please enter your feedback.");

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
  alert("Thank you! Your feedback has been sent to the Admin team.");

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

      alert(
        "Train status copied to clipboard."
      );

    }

  });

}