document.addEventListener("DOMContentLoaded", function () {
  const logo = document.getElementById("the_logo"); // Select the logo element
  const initialScale = 1; // Original size of the logo (100%)
  const shrinkScale = 0.7; // Shrink to 70% of the original size
  const maxScroll = 50; // The scroll amount to reach full shrink

  // Set the transform origin to the top
  logo.style.transformOrigin = "top";

  // Adjust the logo size dynamically based on the scroll position
  window.addEventListener("scroll", function () {
    const scrollY = window.scrollY; // Get the current vertical scroll position
    const scale = Math.max(
      shrinkScale,
      initialScale - (scrollY / maxScroll) * (initialScale - shrinkScale)
    ); // Calculate the new scale, ensuring it doesn't go below shrinkScale
    logo.style.transform = `scale(${scale})`; // Apply the new scale
    logo.style.transition = "transform 0.2s ease-out"; // Smooth transition effect
  });
});
