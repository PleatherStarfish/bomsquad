document.getElementById("full-screen-menu-button").addEventListener("click", function () {
  const fullScreenMenu = document.getElementById("full-screen-menu");
  fullScreenMenu.classList.remove("hidden", "-translate-y-full");
  fullScreenMenu.classList.add("translate-y-0");
});

document.getElementById("close-full-screen-menu").addEventListener("click", function () {
  const fullScreenMenu = document.getElementById("full-screen-menu");
  fullScreenMenu.classList.remove("translate-y-0");
  fullScreenMenu.classList.add("-translate-y-full");
});

// Add event listener for the transitionend event
document.getElementById("full-screen-menu").addEventListener("transitionend", function (e) {
  // Check if the transition is for the 'transform' property
  if (e.propertyName === "transform") {
    const fullScreenMenu = document.getElementById("full-screen-menu");
    // Check if the element has the '-translate-y-full' class
    if (fullScreenMenu.classList.contains("-translate-y-full")) {
      fullScreenMenu.classList.add("hidden");
    }
  }
});
