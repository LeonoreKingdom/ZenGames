const exploreButton = document.querySelector("#explore-button");
const appStatus = document.querySelector("#app-status");
const currentYear = document.querySelector("#current-year");

function updateCurrentYear() {
  currentYear.textContent = new Date().getFullYear();
}

function handleExploreButtonClick() {
  appStatus.textContent = "JavaScript is connected successfully.";

  document.querySelector("#games").scrollIntoView({
    behavior: "smooth",
  });
}

function initializeApp() {
  updateCurrentYear();

  exploreButton.addEventListener("click", handleExploreButtonClick);

  console.log("ZenGames frontend initialized.");
}

initializeApp();