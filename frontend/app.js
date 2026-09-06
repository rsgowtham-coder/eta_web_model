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

  alert(
    "Thank you! Your feedback has been submitted."
  );

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
    });

    button.style.background = "#eaf2ff";

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