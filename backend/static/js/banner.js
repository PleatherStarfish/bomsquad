window.addEventListener("load", function () {
  var bannerModal = cash("#banner-modal");
  var hideButton = cash("#banner-hide-button");
  var hiddenTime = localStorage.getItem("bannerHiddenTime");
  var hideDuration = localStorage.getItem("bannerHideDuration");

  var randomDelay = Math.floor(Math.random() * (60000 - 6000 + 1)) + 6000;

  // Delay the execution of modal logic by 6 seconds
  setTimeout(function () {
    // Check if the modal should be displayed
    if (
      !hiddenTime ||
      !hideDuration ||
      Date.now() - parseInt(hiddenTime) >= parseInt(hideDuration)
    ) {
      // No hidden time or duration set, or the duration has passed; show the modal
      bannerModal.removeClass("hidden");
    }

    // Add a click event listener to the hide button
    hideButton.on("click", function () {
      // Hide the modal
      bannerModal.addClass("hidden");

      // Generate a random number of days between 1 and 3
      var randomDays = Math.floor(Math.random() * 3) + 1;

      // Convert days to milliseconds for the duration
      var randomDuration = randomDays * 24 * 60 * 60 * 1000;

      // Store the current time and random duration in local storage
      localStorage.setItem("bannerHiddenTime", Date.now());
      localStorage.setItem("bannerHideDuration", randomDuration);
    });
  }, randomDelay);
});
