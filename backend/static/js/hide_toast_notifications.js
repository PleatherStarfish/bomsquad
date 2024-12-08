setTimeout(function () {
  // Select all elements with the 'toast' class
  document.querySelectorAll(".toast").forEach(function (toast) {
    // Fade out the toast by setting its opacity to 0
    toast.style.opacity = 0;

    // Remove the toast element after the fade-out transition ends
    setTimeout(function () {
      toast.remove();
    }, 300); // Duration matches the fade-out transition
  });
}, 5000);
