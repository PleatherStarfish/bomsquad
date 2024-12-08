$(function () {
  const logo = $("#the_logo"); // Select the logo element
  const initialScale = 1; // Original size of the logo (100%)
  const shrinkScale = 0.7; // Shrink to 70% of the original size
  const maxScroll = 50; // The scroll amount to reach full shrink

  // Set the transform origin to the top
  logo.css("transform-origin", "top");

  // Adjust the logo size dynamically based on the scroll position
  $(window).on("scroll", () => {
    const scrollY = window.scrollY; // Get the current vertical scroll position
    const scale = Math.max(
      shrinkScale,
      initialScale - (scrollY / maxScroll) * (initialScale - shrinkScale)
    ); // Calculate the new scale, ensuring it doesn't go below shrinkScale
    logo.css({
      transform: `scale(${scale})`, // Apply the new scale
      transition: "transform 0.2s ease-out", // Smooth transition effect
    });
  });
});
