/* =========================
   TRAIN SEARCH
========================= */

const trains = [
  { number: "12627", name: "Karnataka Sampark Kranti Express", from: "Hazrat Nizamuddin", to: "KSR Bengaluru", availability: [true, true, false, true, true, false, true] },
  { number: "12629", name: "Karnataka Superfast Express", from: "Hazrat Nizamuddin", to: "KSR Bengaluru", availability: [true, false, true, true, false, true, true] },
  { number: "12628", name: "Karnataka Express", from: "KSR Bengaluru", to: "New Delhi", availability: [true, false, true, true, false, true, false] },
  { number: "12630", name: "Karnataka Intercity Express", from: "KSR Bengaluru", to: "New Delhi", availability: [false, true, true, false, true, true, false] },
  { number: "12951", name: "New Delhi Rajdhani Express", from: "New Delhi", to: "Mathura Junction", availability: [false, true, true, false, true, true, false] },
  { number: "12953", name: "Mathura Shatabdi Express", from: "New Delhi", to: "Mathura Junction", availability: [true, true, false, true, false, true, true] },
  { number: "12001", name: "Mathura Guntakal Express", from: "Mathura Junction", to: "Guntakal Junction", availability: [true, true, true, false, true, false, true] },
  { number: "12003", name: "Mathura South Express", from: "Mathura Junction", to: "Guntakal Junction", availability: [false, true, true, true, false, true, false] },
  { number: "12785", name: "Guntakal Anantapur Express", from: "Guntakal Junction", to: "Anantapur", availability: [true, false, true, true, true, false, false] },
  { number: "12787", name: "Guntakal Passenger Express", from: "Guntakal Junction", to: "Anantapur", availability: [true, true, false, true, false, true, true] },
  { number: "12786", name: "Anantapur Dharmavaram Express", from: "Anantapur", to: "Dharmavaram", availability: [false, true, true, true, false, true, true] },
  { number: "12788", name: "Anantapur Shuttle Express", from: "Anantapur", to: "Dharmavaram", availability: [true, false, true, false, true, true, true] },
  { number: "16525", name: "Dharmavaram Kolar Express", from: "Dharmavaram", to: "Kolar", availability: [true, true, false, true, false, true, true] },
  { number: "16527", name: "Dharmavaram Kolar Intercity", from: "Dharmavaram", to: "Kolar", availability: [false, true, true, false, true, true, true] },
  { number: "16526", name: "Kolar Nizamuddin Express", from: "Kolar", to: "Hazrat Nizamuddin", availability: [true, false, true, true, false, true, true] },
  { number: "16528", name: "Kolar Delhi Express", from: "Kolar", to: "Hazrat Nizamuddin", availability: [true, true, false, true, true, false, true] }
];

const selectedTrainStorageKey = "railwatch_selected_train";
const availabilityStorageKey = "railwatch_train_availability";

function getAvailabilityOverrides() {
  try {
    return JSON.parse(localStorage.getItem(availabilityStorageKey) || "{}");
  } catch {
    return {};
  }
}

function getTrainWithAvailability(train) {
  if (!train) return train;
  const overrides = getAvailabilityOverrides();
  return { ...train, availability: overrides[train.number] || train.availability };
}

function showAppMessage(message, element, type = "error") {
  if (!element) return;
  let messageElement = element.querySelector('.js-message');
  if (!messageElement) {
    messageElement = document.createElement('p');
    messageElement.className = 'js-message';
    element.appendChild(messageElement);
  }
  messageElement.className = `js-message ${type}`;
  messageElement.textContent = message;
}

const alertStorageKey = "railwatch_alerts";
const defaultAlertCount = 4;

function updateAlertCounts() {
  const storedAlerts = localStorage.getItem(alertStorageKey);
  let alertCount = defaultAlertCount;

  if (storedAlerts !== null) {
    try {
      const alerts = JSON.parse(storedAlerts);
      alertCount = Array.isArray(alerts) ? alerts.length : defaultAlertCount;
    } catch {
      alertCount = defaultAlertCount;
    }
  }

  document.querySelectorAll("[data-alert-count]").forEach(element => {
    element.textContent = alertCount;
    element.setAttribute("aria-label", `${alertCount} alerts`);
  });
}

updateAlertCounts();
window.addEventListener("storage", event => {
  if (event.key === alertStorageKey) updateAlertCounts();
});
window.addEventListener("pageshow", updateAlertCounts);

function renderTrainResults(results) {
  const container = document.getElementById("trainResults");
  if (!container) return;

  container.innerHTML = results.length
    ? results.map(train => `
        <div class="card train-result" data-train-number="${train.number}" role="button" tabindex="0" aria-label="View ${train.name} details">
          <div class="train-result-icon">🚆</div>
          <div class="train-result-info">
            <h3>${train.number} - ${train.name}</h3>
            <p>${train.from} → ${train.to}</p>
          </div>
        </div>
      `).join("")
    : '<div class="card section"><p>No matching trains found.</p></div>';
}

function renderTrainDetails(train) {
  const details = document.getElementById("trainDetails");
  if (!details || !train) return;

  train = getTrainWithAvailability(train);

  localStorage.setItem(selectedTrainStorageKey, JSON.stringify(train));

  document.getElementById("detailsNumber").textContent = train.number;
  document.getElementById("detailsName").textContent = train.name;
  document.getElementById("detailsPath").textContent = `${train.from} → ${train.to}`;
  document.getElementById("detailsAvailability").innerHTML = train.availability
    .map((available, index) => {
      const day = ["S", "M", "T", "W", "T", "F", "S"][index];
      return `<span class="availability-day ${available ? "available" : "unavailable"}" title="${available ? "Available" : "Not available"} on ${day}">${day}</span>`;
    })
    .join("");

  details.hidden = false;
  details.scrollIntoView({ behavior: "smooth", block: "nearest" });

  const liveDashboardLink = document.getElementById("liveDashboardLink");
  if (liveDashboardLink) liveDashboardLink.href = "index.html";
}

function searchTrain() {
  const status = document.getElementById("searchStatus");

  const from = (document.getElementById("fromInput")?.value || "").trim().toLowerCase();
  const to = (document.getElementById("toInput")?.value || "").trim().toLowerCase();

  const results = trains.filter(train => {
    const trainNumber = train.number.toLowerCase();
    const trainName = train.name.toLowerCase();
    const trainFrom = train.from.toLowerCase();
    const trainTo = train.to.toLowerCase();

    if (from && !to) {
      return [trainNumber, trainName, trainFrom, trainTo].some(value => value.includes(from));
    }

    if (!from && to) {
      return [trainNumber, trainName, trainFrom, trainTo].some(value => value.includes(to));
    }

    return (!from || trainFrom.includes(from)) && (!to || trainTo.includes(to));
  });

  if (status) status.textContent = `${results.length} train${results.length === 1 ? "" : "s"} found.`;
  renderTrainResults(results);
}

const searchButton = document.getElementById("searchButton");
if (searchButton) searchButton.addEventListener("click", searchTrain);

const trainResults = document.getElementById("trainResults");
if (trainResults) {
  renderTrainResults(trains);
  trainResults.addEventListener("click", event => {
    const result = event.target.closest("[data-train-number]");
    if (!result) return;

    renderTrainDetails(trains.find(train => train.number === result.dataset.trainNumber));
  });

  trainResults.addEventListener("keydown", event => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    event.target.click();
  });
}


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
  showAppMessage('Thank you! Your feedback has been sent to the Admin team.', text.closest('.feedback-form'), 'success');

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

    const trainNameElement = document.getElementById("dashboardTrainName");
    const trainPath = document.getElementById("dashboardTrainPath")?.textContent.trim() || "Unknown";
    const currentLocation = document.getElementById("dashboardLocation")?.textContent.trim() || "Unknown";
    const scheduledEta = document.getElementById("dashboardScheduledEta")?.textContent.trim() || "Unknown";
    const aiEta = document.getElementById("dashboardAiEta")?.textContent.trim() || "Unknown";
    const trainDetails = trainNameElement?.textContent.trim().split(" – ") || [];
    const trainNumber = trainDetails.shift() || "Unknown";
    const trainName = trainDetails.join(" – ") || "Unknown";
    const arrivalStation = trainPath.split(" → ").pop() || "Unknown";

    const message = [
      "RailWatch AI Live Dashboard",
      `Train: ${trainName}`,
      `Train No: ${trainNumber}`,
      `Path: ${trainPath}`,
      `Current location: ${currentLocation}`,
      `Arrival station: ${arrivalStation}`,
      `Scheduled arrival: ${scheduledEta}`,
      `AI ETA: ${aiEta}`
    ].join("\n");

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


/* =========================
   LANGUAGE
========================= */

const languageStorageKey = "railwatch_language";
const savedLanguage = localStorage.getItem(languageStorageKey);
const languageSelect = document.getElementById("languageSelect");
const languageModal = document.getElementById("languageModal");
const languageModalSelect = document.getElementById("languageModalSelect");
const languageContinue = document.getElementById("languageContinue");
const journeyModal = document.getElementById("journeyModal");
const journeyForm = document.getElementById("journeyForm");
const journeyClose = document.getElementById("journeyClose");
const journeyFrom = document.getElementById("journeyFrom");
const journeyTo = document.getElementById("journeyTo");
const journeyError = document.getElementById("journeyError");
const trainPickerModal = document.getElementById("trainPickerModal");
const trainPickerRoute = document.getElementById("trainPickerRoute");
const trainPickerResults = document.getElementById("trainPickerResults");
const journeyStorageKey = "railwatch_journey";

const translations = {
  hi: {
    "Smarter Journeys": "स्मार्ट यात्राएं",
    "Live Dashboard": "लाइव डैशबोर्ड",
    "Train Search": "ट्रेन खोज",
    "My Trips": "मेरी यात्राएं",
    Alerts: "अलर्ट",
    Feedback: "प्रतिक्रिया",
    Language: "भाषा",
    Settings: "सेटिंग्स",
    "Sign In": "साइन इन",
    "Share Status": "स्थिति साझा करें",
    "Current Location": "वर्तमान स्थान",
    "Platform 2": "प्लेटफॉर्म 2",
    "Current Delay": "वर्तमान देरी",
    "vs Schedule": "समय-सारणी के अनुसार",
    "Journey Progress": "यात्रा प्रगति",
    "Distance to Destination": "गंतव्य तक दूरी",
    "AI Dynamic ETA": "एआई गतिशील अनुमानित समय",
    "Scheduled ETA": "निर्धारित आगमन समय",
    "Current ETA": "वर्तमान अनुमानित समय",
    "AI Predicted ETA": "एआई अनुमानित समय",
    Confidence: "विश्वास स्तर",
    High: "उच्च",
    "AI prediction updates every 5 minutes using real-time data.": "एआई अनुमान वास्तविक समय के डेटा का उपयोग करके हर 5 मिनट में अपडेट होता है।",
    "Factors Affecting ETA": "अनुमानित समय को प्रभावित करने वाले कारक",
    "Heavy Traffic Ahead": "आगे भारी यातायात",
    "High Impact": "उच्च प्रभाव",
    "Signal Issue": "सिग्नल समस्या",
    "Reported near Dharmavaram": "धर्मावरम के पास रिपोर्ट किया गया",
    Medium: "मध्यम",
    "Weather Impact": "मौसम का प्रभाव",
    "Light rain near Kolar": "कोलार के पास हल्की बारिश",
    Low: "कम",
    "ETA Prediction Timeline": "अनुमानित समय की समयरेखा",
    "On Time": "समय पर",
    Delayed: "विलंबित",
    "AI Predicted": "एआई अनुमानित",
    Station: "स्टेशन",
    Scheduled: "निर्धारित",
    Delay: "देरी",
    Status: "स्थिति",
    Departed: "रवाना",
    "Current Stop": "वर्तमान ठहराव",
    "Not Reached": "अभी नहीं पहुंचा",
    "Find Your Train": "अपनी ट्रेन खोजें",
    "Train Number / Name": "ट्रेन नंबर / नाम",
    From: "से",
    To: "तक",
    "Smart Alerts": "स्मार्ट अलर्ट",
    "Train Delay Detected": "ट्रेन में देरी का पता चला",
    "Just now": "अभी",
    "Train 12627 is currently delayed by": "ट्रेन 12627 में वर्तमान में",
    "1 hour 12 minutes": "1 घंटा 12 मिनट",
    "AI ETA Updated": "एआई अनुमानित समय अपडेट हुआ",
    "5 mins ago": "5 मिनट पहले",
    "AI predicted arrival time changed to": "एआई अनुमानित आगमन समय बदलकर",
    "ETA Update": "आगमन समय अपडेट",
    "Next Station Update": "अगले स्टेशन का अपडेट",
    "8 mins ago": "8 मिनट पहले",
    "Train is approaching": "ट्रेन पास आ रही है",
    "Live Update": "लाइव अपडेट",
    "Journey Update": "यात्रा अपडेट",
    "20 mins ago": "20 मिनट पहले",
    "Train has departed from Guntakal Junction.": "ट्रेन गंतकल जंक्शन से रवाना हो गई है।",
    Completed: "पूर्ण",
    "My Trips": "मेरी यात्राएं",
    Live: "लाइव",
    Upcoming: "आगामी",
    "Open Live Dashboard": "लाइव डैशबोर्ड खोलें",
    Departure: "प्रस्थान",
    Tomorrow: "कल",
    "View Trip": "यात्रा देखें",
    "Plan your journey": "अपनी यात्रा की योजना बनाएं",
    "Select your starting point and destination to continue.": "जारी रखने के लिए अपना प्रारंभिक स्थान और गंतव्य चुनें।",
    "Select station": "स्टेशन चुनें",
    Search: "खोजें",
    "From and To cannot be the same station.": "प्रस्थान और गंतव्य स्टेशन एक जैसे नहीं हो सकते।"
  },
  ta: {
    "Smarter Journeys": "புத்திசாலி பயணங்கள்",
    "Live Dashboard": "நேரடி டாஷ்போர்டு",
    "Train Search": "ரயில் தேடல்",
    "My Trips": "எனது பயணங்கள்",
    Alerts: "எச்சரிக்கைகள்",
    Feedback: "கருத்து",
    Language: "மொழி",
    Settings: "அமைப்புகள்",
    "Sign In": "உள்நுழை",
    "Log Out": "வெளியேறு",
    "Share Status": "நிலையைப் பகிரவும்",
    "Current Location": "தற்போதைய இடம்",
    "Platform 2": "பிளாட்ஃபார்ம் 2",
    "Current Delay": "தற்போதைய தாமதம்",
    "vs Schedule": "அட்டவணையுடன் ஒப்பிடுகையில்",
    "Journey Progress": "பயண முன்னேற்றம்",
    "Distance to Destination": "இலக்கிற்கான தூரம்",
    "AI Dynamic ETA": "AI மாறும் வருகை நேரம்",
    "Scheduled ETA": "திட்டமிடப்பட்ட வருகை நேரம்",
    "Current ETA": "தற்போதைய வருகை நேரம்",
    "AI Predicted ETA": "AI கணித்த வருகை நேரம்",
    "AI ETA": "AI வருகை நேரம்",
    Confidence: "நம்பகத்தன்மை",
    High: "அதிகம்",
    Medium: "நடுத்தரம்",
    Low: "குறைவு",
    "Factors Affecting ETA": "வருகை நேரத்தை பாதிக்கும் காரணிகள்",
    "Heavy Traffic Ahead": "முன்னால் அதிக போக்குவரத்து",
    "High Impact": "அதிக தாக்கம்",
    "Signal Issue": "சிக்னல் சிக்கல்",
    "Reported near Dharmavaram": "தர்மாவரம் அருகே தெரிவிக்கப்பட்டது",
    "Weather Impact": "வானிலை தாக்கம்",
    "Light rain near Kolar": "கோலார் அருகே லேசான மழை",
    "ETA Prediction Timeline": "வருகை நேர கணிப்பு காலவரிசை",
    "On Time": "சரியான நேரத்தில்",
    Delayed: "தாமதம்",
    "AI Predicted": "AI கணிப்பு",
    "AI prediction updates every 5 minutes using real-time data.": "AI கணிப்பு நிகழ்நேரத் தரவைப் பயன்படுத்தி ஒவ்வொரு 5 நிமிடங்களுக்கும் புதுப்பிக்கப்படுகிறது.",
    Station: "நிலையம்",
    Scheduled: "திட்டமிடப்பட்டது",
    Delay: "தாமதம்",
    Status: "நிலை",
    Departed: "புறப்பட்டது",
    "Current Stop": "தற்போதைய நிறுத்தம்",
    "Not Reached": "இன்னும் அடையவில்லை",
    "Find Your Train": "உங்கள் ரயிலைத் தேடுங்கள்",
    "Train Number / Name": "ரயில் எண் / பெயர்",
    From: "இருந்து",
    To: "வரை",
    "Smart Alerts": "ஸ்மார்ட் எச்சரிக்கைகள்",
    "Train Delay Detected": "ரயில் தாமதம் கண்டறியப்பட்டது",
    "AI ETA Updated": "AI வருகை நேரம் புதுப்பிக்கப்பட்டது",
    "Next Station Update": "அடுத்த நிலைய புதுப்பிப்பு",
    "Journey Update": "பயண புதுப்பிப்பு",
    Completed: "முடிந்தது",
    Live: "நேரலை",
    Upcoming: "வரவிருக்கும்",
    "Open Live Dashboard": "நேரடி டாஷ்போர்டைத் திறக்கவும்",
    Departure: "புறப்பாடு",
    Tomorrow: "நாளை",
    "View Trip": "பயணத்தைக் காண்க",
    "Plan your journey": "உங்கள் பயணத்தைத் திட்டமிடுங்கள்",
    "Select your starting point and destination to continue.": "தொடர உங்கள் தொடக்க இடத்தையும் இலக்கையும் தேர்ந்தெடுக்கவும்.",
    "Select station": "நிலையத்தைத் தேர்ந்தெடுக்கவும்",
    Search: "தேடுக",
    "From and To cannot be the same station.": "தொடக்கமும் இலக்கும் ஒரே நிலையமாக இருக்கக்கூடாது."
  },
  ml: {
    "Smarter Journeys": "സ്മാർട്ട് യാത്രകൾ",
    "Live Dashboard": "ലൈവ് ഡാഷ്ബോർഡ്",
    "Train Search": "ട്രെയിൻ തിരയൽ",
    "My Trips": "എന്റെ യാത്രകൾ",
    Alerts: "അറിയിപ്പുകൾ",
    Feedback: "അഭിപ്രായം",
    Language: "ഭാഷ",
    Settings: "ക്രമീകരണങ്ങൾ",
    "Sign In": "സൈൻ ഇൻ",
    "Log Out": "പുറത്തുകടക്കുക",
    "Share Status": "നില പങ്കിടുക",
    "Current Location": "നിലവിലെ സ്ഥാനം",
    "Platform 2": "പ്ലാറ്റ്ഫോം 2",
    "Current Delay": "നിലവിലെ വൈകൽ",
    "vs Schedule": "ഷെഡ്യൂളുമായി താരതമ്യം ചെയ്യുമ്പോൾ",
    "Journey Progress": "യാത്ര പുരോഗതി",
    "Distance to Destination": "ലക്ഷ്യസ്ഥാനത്തിലേക്കുള്ള ദൂരം",
    "AI Dynamic ETA": "AI ചലനാത്മക എത്തിച്ചേരൽ സമയം",
    "Scheduled ETA": "ക്രമീകരിച്ച എത്തിച്ചേരൽ സമയം",
    "Current ETA": "നിലവിലെ എത്തിച്ചേരൽ സമയം",
    "AI Predicted ETA": "AI പ്രവചിച്ച എത്തിച്ചേരൽ സമയം",
    "AI ETA": "AI എത്തിച്ചേരൽ സമയം",
    Confidence: "വിശ്വാസ്യത",
    High: "ഉയർന്നത്",
    Medium: "ഇടത്തരം",
    Low: "കുറഞ്ഞത്",
    "Factors Affecting ETA": "എത്തിച്ചേരൽ സമയത്തെ ബാധിക്കുന്ന ഘടകങ്ങൾ",
    "Heavy Traffic Ahead": "മുന്നിൽ കനത്ത ഗതാഗതം",
    "High Impact": "ഉയർന്ന സ്വാധീനം",
    "Signal Issue": "സിഗ്നൽ പ്രശ്നം",
    "Reported near Dharmavaram": "ധർമ്മവരം സമീപം റിപ്പോർട്ട് ചെയ്തു",
    "Weather Impact": "കാലാവസ്ഥാ സ്വാധീനം",
    "Light rain near Kolar": "കോലാറിന് സമീപം നേരിയ മഴ",
    "ETA Prediction Timeline": "എത്തിച്ചേരൽ സമയ പ്രവചന സമയരേഖ",
    "On Time": "സമയത്ത്",
    Delayed: "വൈകി",
    "AI Predicted": "AI പ്രവചനം",
    "AI prediction updates every 5 minutes using real-time data.": "തത്സമയ ഡാറ്റ ഉപയോഗിച്ച് AI പ്രവചനം ഓരോ 5 മിനിറ്റിലും പുതുക്കുന്നു.",
    Station: "സ്റ്റേഷൻ",
    Scheduled: "ക്രമീകരിച്ചത്",
    Delay: "വൈകൽ",
    Status: "നില",
    Departed: "പുറപ്പെട്ടു",
    "Current Stop": "നിലവിലെ സ്റ്റോപ്പ്",
    "Not Reached": "ഇതുവരെ എത്തിയിട്ടില്ല",
    "Find Your Train": "നിങ്ങളുടെ ട്രെയിൻ കണ്ടെത്തുക",
    "Train Number / Name": "ട്രെയിൻ നമ്പർ / പേര്",
    From: "നിന്ന്",
    To: "ലേക്ക്",
    "Smart Alerts": "സ്മാർട്ട് അറിയിപ്പുകൾ",
    "Train Delay Detected": "ട്രെയിൻ വൈകൽ കണ്ടെത്തി",
    "AI ETA Updated": "AI എത്തിച്ചേരൽ സമയം പുതുക്കി",
    "Next Station Update": "അടുത്ത സ്റ്റേഷൻ അപ്ഡേറ്റ്",
    "Journey Update": "യാത്ര അപ്ഡേറ്റ്",
    Completed: "പൂർത്തിയായി",
    Live: "ലൈവ്",
    Upcoming: "വരാനിരിക്കുന്നത്",
    "Open Live Dashboard": "ലൈവ് ഡാഷ്ബോർഡ് തുറക്കുക",
    Departure: "പുറപ്പെടൽ",
    Tomorrow: "നാളെ",
    "View Trip": "യാത്ര കാണുക",
    "Plan your journey": "നിങ്ങളുടെ യാത്ര ആസൂത്രണം ചെയ്യുക",
    "Select your starting point and destination to continue.": "തുടരാൻ ആരംഭ സ്ഥലവും ലക്ഷ്യസ്ഥാനവും തിരഞ്ഞെടുക്കുക.",
    "Select station": "സ്റ്റേഷൻ തിരഞ്ഞെടുക്കുക",
    Search: "തിരയുക",
    "From and To cannot be the same station.": "ആരംഭവും ലക്ഷ്യസ്ഥാനവും ഒരേ സ്റ്റേഷൻ ആയിരിക്കരുത്."
  },
  te: {
    "Smarter Journeys": "స్మార్ట్ ప్రయాణాలు",
    "Live Dashboard": "లైవ్ డాష్‌బోర్డ్",
    "Train Search": "రైలు శోధన",
    "My Trips": "నా ప్రయాణాలు",
    Alerts: "హెచ్చరికలు",
    Feedback: "అభిప్రాయం",
    Language: "భాష",
    Settings: "సెట్టింగ్‌లు",
    "Sign In": "సైన్ ఇన్",
    "Log Out": "లాగ్ అవుట్",
    "Share Status": "స్థితిని పంచుకోండి",
    "Current Location": "ప్రస్తుత స్థానం",
    "Platform 2": "ప్లాట్‌ఫారమ్ 2",
    "Current Delay": "ప్రస్తుత ఆలస్యం",
    "vs Schedule": "షెడ్యూల్‌తో పోలిస్తే",
    "Journey Progress": "ప్రయాణ పురోగతి",
    "Distance to Destination": "గమ్యస్థానానికి దూరం",
    "AI Dynamic ETA": "AI డైనమిక్ చేరుకునే సమయం",
    "Scheduled ETA": "షెడ్యూల్ చేసిన చేరుకునే సమయం",
    "Current ETA": "ప్రస్తుత చేరుకునే సమయం",
    "AI Predicted ETA": "AI అంచనా వేసిన చేరుకునే సమయం",
    "AI ETA": "AI చేరుకునే సమయం",
    Confidence: "నమ్మకం",
    High: "అధికం",
    Medium: "మధ్యస్థం",
    Low: "తక్కువ",
    "Factors Affecting ETA": "చేరుకునే సమయాన్ని ప్రభావితం చేసే అంశాలు",
    "Heavy Traffic Ahead": "ముందు భారీ ట్రాఫిక్",
    "High Impact": "అధిక ప్రభావం",
    "Signal Issue": "సిగ్నల్ సమస్య",
    "Reported near Dharmavaram": "ధర్మవరం సమీపంలో నివేదించబడింది",
    "Weather Impact": "వాతావరణ ప్రభావం",
    "Light rain near Kolar": "కోలార్ సమీపంలో తేలికపాటి వర్షం",
    "ETA Prediction Timeline": "చేరుకునే సమయ అంచనా కాలక్రమం",
    "On Time": "సమయానికి",
    Delayed: "ఆలస్యం",
    "AI Predicted": "AI అంచనా",
    "AI prediction updates every 5 minutes using real-time data.": "నిజ సమయ డేటాను ఉపయోగించి AI అంచనా ప్రతి 5 నిమిషాలకు నవీకరించబడుతుంది.",
    Station: "స్టేషన్",
    Scheduled: "షెడ్యూల్ చేయబడింది",
    Delay: "ఆలస్యం",
    Status: "స్థితి",
    Departed: "బయలుదేరింది",
    "Current Stop": "ప్రస్తుత స్టాప్",
    "Not Reached": "ఇంకా చేరుకోలేదు",
    "Find Your Train": "మీ రైలును కనుగొనండి",
    "Train Number / Name": "రైలు సంఖ్య / పేరు",
    From: "నుండి",
    To: "వరకు",
    "Smart Alerts": "స్మార్ట్ హెచ్చరికలు",
    "Train Delay Detected": "రైలు ఆలస్యం గుర్తించబడింది",
    "AI ETA Updated": "AI చేరుకునే సమయం నవీకరించబడింది",
    "Next Station Update": "తదుపరి స్టేషన్ నవీకరణ",
    "Journey Update": "ప్రయాణ నవీకరణ",
    Completed: "పూర్తయింది",
    Live: "లైవ్",
    Upcoming: "రాబోయేవి",
    "Open Live Dashboard": "లైవ్ డాష్‌బోర్డ్ తెరవండి",
    Departure: "బయలుదేరడం",
    Tomorrow: "రేపు",
    "View Trip": "ప్రయాణాన్ని చూడండి",
    "Plan your journey": "మీ ప్రయాణాన్ని ప్లాన్ చేయండి",
    "Select your starting point and destination to continue.": "కొనసాగడానికి ప్రారంభ స్థానం మరియు గమ్యస్థానాన్ని ఎంచుకోండి.",
    "Select station": "స్టేషన్‌ను ఎంచుకోండి",
    Search: "శోధించండి",
    "From and To cannot be the same station.": "ప్రారంభం మరియు గమ్యస్థానం ఒకే స్టేషన్ కాకూడదు."
  },
  kn: {
    "Smarter Journeys": "ಸ್ಮಾರ್ಟ್ ಪ್ರಯಾಣಗಳು",
    "Live Dashboard": "ಲೈವ್ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್",
    "Train Search": "ರೈಲು ಹುಡುಕಿ",
    "My Trips": "ನನ್ನ ಪ್ರಯಾಣಗಳು",
    Alerts: "ಎಚ್ಚರಿಕೆಗಳು",
    Feedback: "ಪ್ರತಿಕ್ರಿಯೆ",
    Language: "ಭಾಷೆ",
    Settings: "ಸೆಟ್ಟಿಂಗ್‌ಗಳು",
    "Sign In": "ಸೈನ್ ಇನ್",
    "Share Status": "ಸ್ಥಿತಿಯನ್ನು ಹಂಚಿಕೊಳ್ಳಿ",
    "Current Location": "ಪ್ರಸ್ತುತ ಸ್ಥಳ",
    "Platform 2": "ಪ್ಲಾಟ್‌ಫಾರ್ಮ್ 2",
    "Current Delay": "ಪ್ರಸ್ತುತ ವಿಳಂಬ",
    "vs Schedule": "ವೇಳಾಪಟ್ಟಿಗೆ ಹೋಲಿಸಿದರೆ",
    "Journey Progress": "ಪ್ರಯಾಣದ ಪ್ರಗತಿ",
    "Distance to Destination": "ಗಮ್ಯಸ್ಥಾನಕ್ಕೆ ದೂರ",
    "AI Dynamic ETA": "AI ಚಲನಶೀಲ ಆಗಮನ ಅಂದಾಜು",
    "Scheduled ETA": "ನಿಗದಿತ ಆಗಮನ ಸಮಯ",
    "Current ETA": "ಪ್ರಸ್ತುತ ಆಗಮನ ಅಂದಾಜು",
    "AI Predicted ETA": "AI ಅಂದಾಜಿನ ಆಗಮನ ಸಮಯ",
    Confidence: "ವಿಶ್ವಾಸ",
    High: "ಹೆಚ್ಚು",
    "AI prediction updates every 5 minutes using real-time data.": "ನೈಜ ಸಮಯದ ಡೇಟಾವನ್ನು ಬಳಸಿ AI ಅಂದಾಜು ಪ್ರತಿ 5 ನಿಮಿಷಗಳಿಗೊಮ್ಮೆ ನವೀಕರಿಸುತ್ತದೆ.",
    "Factors Affecting ETA": "ಆಗಮನ ಅಂದಾಜಿನ ಮೇಲೆ ಪರಿಣಾಮ ಬೀರುವ ಅಂಶಗಳು",
    "Heavy Traffic Ahead": "ಮುಂದೆ ಭಾರೀ ಸಂಚಾರ",
    "High Impact": "ಹೆಚ್ಚಿನ ಪರಿಣಾಮ",
    "Signal Issue": "ಸಿಗ್ನಲ್ ಸಮಸ್ಯೆ",
    "Reported near Dharmavaram": "ಧರ್ಮಾವರಂ ಬಳಿ ವರದಿಯಾಗಿದೆ",
    Medium: "ಮಧ್ಯಮ",
    "Weather Impact": "ಹವಾಮಾನದ ಪರಿಣಾಮ",
    "Light rain near Kolar": "ಕೋಲಾರ ಬಳಿ ಲಘು ಮಳೆ",
    Low: "ಕಡಿಮೆ",
    "ETA Prediction Timeline": "ಆಗಮನ ಅಂದಾಜಿನ ಸಮಯರೇಖೆ",
    "On Time": "ಸಮಯಕ್ಕೆ",
    Delayed: "ವಿಳಂಬವಾಗಿದೆ",
    "AI Predicted": "AI ಅಂದಾಜು",
    Station: "ನಿಲ್ದಾಣ",
    Scheduled: "ನಿಗದಿತ",
    Delay: "ವಿಳಂಬ",
    Status: "ಸ್ಥಿತಿ",
    Departed: "ನಿರ್ಗಮಿಸಿದೆ",
    "Current Stop": "ಪ್ರಸ್ತುತ ನಿಲ್ದಾಣ",
    "Not Reached": "ಇನ್ನೂ ತಲುಪಿಲ್ಲ",
    "Find Your Train": "ನಿಮ್ಮ ರೈಲನ್ನು ಹುಡುಕಿ",
    "Train Number / Name": "ರೈಲು ಸಂಖ್ಯೆ / ಹೆಸರು",
    From: "ಇಂದ",
    To: "ಗೆ",
    "Smart Alerts": "ಸ್ಮಾರ್ಟ್ ಎಚ್ಚರಿಕೆಗಳು",
    "Train Delay Detected": "ರೈಲು ವಿಳಂಬ ಪತ್ತೆಯಾಗಿದೆ",
    "Just now": "ಈಗಷ್ಟೇ",
    "Train 12627 is currently delayed by": "ರೈಲು 12627 ಪ್ರಸ್ತುತ",
    "1 hour 12 minutes": "1 ಗಂಟೆ 12 ನಿಮಿಷ ವಿಳಂಬವಾಗಿದೆ",
    "AI ETA Updated": "AI ಆಗಮನ ಅಂದಾಜು ನವೀಕರಿಸಲಾಗಿದೆ",
    "5 mins ago": "5 ನಿಮಿಷಗಳ ಹಿಂದೆ",
    "AI predicted arrival time changed to": "AI ಅಂದಾಜಿನ ಆಗಮನ ಸಮಯ ಬದಲಾಗಿದೆ",
    "ETA Update": "ಆಗಮನ ಸಮಯದ ನವೀಕರಣ",
    "Next Station Update": "ಮುಂದಿನ ನಿಲ್ದಾಣದ ನವೀಕರಣ",
    "8 mins ago": "8 ನಿಮಿಷಗಳ ಹಿಂದೆ",
    "Train is approaching": "ರೈಲು ಸಮೀಪಿಸುತ್ತಿದೆ",
    "Live Update": "ಲೈವ್ ನವೀಕರಣ",
    "Journey Update": "ಪ್ರಯಾಣದ ನವೀಕರಣ",
    "20 mins ago": "20 ನಿಮಿಷಗಳ ಹಿಂದೆ",
    "Train has departed from Guntakal Junction.": "ರೈಲು ಗುಂತಕಲ್ ಜಂಕ್ಷನ್‌ನಿಂದ ಹೊರಟಿದೆ.",
    Completed: "ಪೂರ್ಣಗೊಂಡಿದೆ",
    "My Trips": "ನನ್ನ ಪ್ರಯಾಣಗಳು",
    Live: "ಲೈವ್",
    Upcoming: "ಮುಂಬರುವ",
    "Open Live Dashboard": "ಲೈವ್ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್ ತೆರೆಯಿರಿ",
    Departure: "ನಿರ್ಗಮನ",
    Tomorrow: "ನಾಳೆ",
    "View Trip": "ಪ್ರಯಾಣ ವೀಕ್ಷಿಸಿ",
    "Plan your journey": "ನಿಮ್ಮ ಪ್ರಯಾಣವನ್ನು ಯೋಜಿಸಿ",
    "Select your starting point and destination to continue.": "ಮುಂದುವರಿಯಲು ಪ್ರಾರಂಭ ಸ್ಥಳ ಮತ್ತು ಗಮ್ಯಸ್ಥಾನವನ್ನು ಆಯ್ಕೆಮಾಡಿ.",
    "Select station": "ನಿಲ್ದಾಣವನ್ನು ಆಯ್ಕೆಮಾಡಿ",
    Search: "ಹುಡುಕಿ",
    "From and To cannot be the same station.": "ಪ್ರಾರಂಭ ಮತ್ತು ಗಮ್ಯಸ್ಥಾನ ನಿಲ್ದಾಣಗಳು ಒಂದೇ ಆಗಿರಬಾರದು."
  }
};

function translatePage(language) {
  const dictionary = translations[language];
  if (!dictionary) return;

  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const textNodes = [];
  let node;

  while ((node = walker.nextNode())) textNodes.push(node);

  const translationKeys = Object.keys(dictionary).sort((first, second) => second.length - first.length);
  textNodes.forEach(textNode => {
    let translatedText = textNode.nodeValue;

    translationKeys.forEach(key => {
      translatedText = translatedText.split(key).join(dictionary[key]);
    });

    textNode.nodeValue = translatedText;
  });

  document.querySelectorAll("[placeholder]").forEach(element => {
    if (dictionary[element.placeholder]) element.placeholder = dictionary[element.placeholder];
  });
}

function applyLanguage(language) {
  if (!language) return;

  localStorage.setItem(languageStorageKey, language);
  document.documentElement.lang = language;
  translatePage(language);

  if (languageSelect) languageSelect.value = language;
  if (languageModalSelect) languageModalSelect.value = language;
}

function showJourneyForm() {
  if (!journeyModal) return;

  const savedJourney = JSON.parse(localStorage.getItem(journeyStorageKey) || "null");
  if (savedJourney) {
    if (journeyFrom) journeyFrom.value = savedJourney.from || "";
    if (journeyTo) journeyTo.value = savedJourney.to || "";
  }

  trainPickerModal && (trainPickerModal.hidden = true);
  journeyModal.hidden = false;
  journeyFrom?.focus();
}

function showTrainPicker(from, to) {
  const matchingTrains = trains.filter(train => train.from === from && train.to === to);
  if (!trainPickerModal || !trainPickerResults) return matchingTrains;

  journeyModal.hidden = true;
  trainPickerRoute.textContent = `${from} → ${to}`;
  trainPickerResults.innerHTML = matchingTrains.length
    ? matchingTrains.map(train => `
        <button class="train-picker-option" type="button" data-picker-train="${train.number}">
          <strong>${train.number} - ${train.name}</strong>
          <small>${train.from} → ${train.to}</small>
        </button>
      `).join("")
    : `
        <p class="journey-error">No trains are available for this route right now.</p>
        <button class="secondary-btn search-station-button" type="button" id="searchStationButton">Search station</button>
      `;

  trainPickerModal.hidden = false;
  return matchingTrains;
}

function updateDashboardTrain(train) {
  train = getTrainWithAvailability(train);
  const path = `${train.from} → ${train.to}`;
  const availability = document.getElementById("dashboardAvailability");
  document.getElementById("dashboardTrainName").textContent = `${train.number} – ${train.name}`;
  document.getElementById("dashboardTrainPath").textContent = path;
  document.getElementById("dashboardLocation").textContent = train.from;
  document.getElementById("dashboardPlatform").textContent = "Selected route";
  document.getElementById("dashboardDelay").textContent = "On Time";
  document.getElementById("dashboardDestination").textContent = train.to;

  if (availability) {
    availability.innerHTML = train.availability.map((available, index) => {
      const day = ["S", "M", "T", "W", "T", "F", "S"][index];
      const dayName = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][index];
      return `<span class="availability-day ${available ? "available" : "unavailable"}" title="${available ? "Available" : "Not available"} on ${dayName}">${day}</span>`;
    }).join("");
  }
}

function renderLastViewedTrip(train) {
  const card = document.getElementById("lastViewedTrip");
  if (!card || !train) return;

  card.innerHTML = `
    <div class="trip-header">
      <div>
        <span class="status gray">Last Viewed</span>
        <h2>${train.number}</h2>
        <p>${train.name}</p>
      </div>
      <span class="favorite">★</span>
    </div>
    <div class="trip-route">
      <div>
        <strong>From</strong>
        <small>${train.from}</small>
      </div>
      <div class="route-line">━━━━━━━━━</div>
      <div>
        <strong>To</strong>
        <small>${train.to}</small>
      </div>
    </div>
    <div class="trip-status">
      <div>
        <small>Viewed from</small>
        <strong>Train Search</strong>
      </div>
      <div>
        <small>Availability</small>
        <strong class="success">Available</strong>
      </div>
    </div>
    <a class="secondary-btn" href="train.html">View in Train Search</a>
  `;
}

const savedTrain = JSON.parse(localStorage.getItem(selectedTrainStorageKey) || "null");
if (savedTrain && document.getElementById("dashboardTrainName")) updateDashboardTrain(savedTrain);
renderLastViewedTrip(savedTrain);

if (savedLanguage) {
  applyLanguage(savedLanguage);
  showJourneyForm();
} else if (languageModal) {
  languageModal.hidden = false;
  languageModalSelect?.focus();
}

window.addEventListener("pageshow", () => {
  if (savedLanguage && journeyModal) showJourneyForm();
});

journeyClose?.addEventListener("click", () => {
  if (trainPickerModal) trainPickerModal.hidden = true;
  if (journeyModal) journeyModal.hidden = true;
});

languageSelect?.addEventListener("change", event => {
  applyLanguage(event.target.value);
  window.location.reload();
});

languageContinue?.addEventListener("click", () => {
  applyLanguage(languageModalSelect.value);
  window.location.reload();
});

journeyForm?.addEventListener("submit", event => {
  event.preventDefault();
  journeyError.textContent = "";

  if (journeyFrom.value === journeyTo.value) {
    journeyError.textContent = "From and To cannot be the same station.";
    journeyTo.focus();
    return;
  }

  const matchingTrains = showTrainPicker(journeyFrom.value, journeyTo.value);
  localStorage.setItem(journeyStorageKey, JSON.stringify({
    from: journeyFrom.value,
    to: journeyTo.value
  }));
  if (matchingTrains.length) journeyModal.hidden = true;
});

trainPickerResults?.addEventListener("click", event => {
  if (event.target.closest("#searchStationButton")) {
    trainPickerModal.hidden = true;
    journeyModal.hidden = false;
    journeyFrom.focus();
    return;
  }

  const option = event.target.closest("[data-picker-train]");
  if (!option) return;

  const train = trains.find(item => item.number === option.dataset.pickerTrain);
  if (!train) return;

  localStorage.setItem(selectedTrainStorageKey, JSON.stringify(train));
  updateDashboardTrain(train);
  trainPickerModal.hidden = true;
});