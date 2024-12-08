window.addEventListener("load", function () {
  var banner = cash("#banner");
  var hideButton = cash("#banner-hide-button");
  var hiddenTime = localStorage.getItem("bannerHiddenTime");
  var hideDuration = localStorage.getItem("bannerHideDuration");

  // Check if banner should be displayed immediately
  if (
    !hiddenTime ||
    !hideDuration ||
    Date.now() - parseInt(hiddenTime) >= parseInt(hideDuration)
  ) {
    // No hidden time or duration set, or the duration has passed; show the banner
    banner.removeClass("hidden");
  }

  // Add a click event listener to the hide button
  hideButton.on("click", function () {
    // Hide the banner
    banner.addClass("hidden");

    // Generate a random number of days between 1 and 7
    var randomDays = Math.floor(Math.random() * 4) + 1;

    // Convert days to milliseconds for the duration
    var randomDuration = randomDays * 24 * 60 * 60 * 1000;

    // Store the current time and random duration in local storage
    localStorage.setItem("bannerHiddenTime", Date.now());
    localStorage.setItem("bannerHideDuration", randomDuration);
  });
});
