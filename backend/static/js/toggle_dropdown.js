// ===============================================
// Dropdown Toggle Functionality
// ===============================================

// Select profile dropdown button
const $profileButton = $(".menu-button-click"); // For click-based dropdowns
const $hoverButton = $(".menu-button-hover"); // For hover-based dropdowns

// Toggle visibility for click-based dropdown menus
$profileButton.on("click", function (event) {
  event.stopPropagation(); // Prevent click event from bubbling up
  const $menu = cash(this.nextElementSibling); // Get the dropdown menu
  const $caret = cash(this).find(".dropdown-caret"); // Find the caret inside the button

  // Toggle the menu visibility
  $menu.toggleClass("hidden block");

  // Rotate the caret based on the menu state
  if ($menu.hasClass("block")) {
    $caret.addClass("rotate-180"); // Rotate down
  } else {
    $caret.removeClass("rotate-180"); // Rotate back
  }

  // Update aria-expanded for accessibility
  const expanded = $menu.hasClass("block");
  this.setAttribute("aria-expanded", expanded);
});

// Keep dropdown open when interacting with it
$(".dropdown-menu").on("click", function (event) {
  event.stopPropagation(); // Prevent click event from bubbling up
});

// Close click-based dropdowns when clicking outside
$(document).on("click", function () {
  $profileButton.each(function (index, button) {
    const $menu = cash(button.nextElementSibling);
    const $caret = cash(button).find(".dropdown-caret");

    // Hide the menu and reset caret rotation
    if ($menu.hasClass("block")) {
      $menu.addClass("hidden").removeClass("block");
      $caret.removeClass("rotate-180");
      button.setAttribute("aria-expanded", false);
    }
  });
});

// Hover functionality for hover-based dropdowns
$hoverButton.on("mouseenter", function () {
  const $menu = cash(this.nextElementSibling); // Get the dropdown menu
  const $caret = cash(this).find(".dropdown-caret"); // Find the caret inside the button
  $menu.removeClass("hidden").addClass("block"); // Show the menu
  $caret.addClass("rotate-180"); // Rotate caret
  this.setAttribute("aria-expanded", true);
});

// Ensure the dropdown stays open when hovering over the menu
$(".hover-dropdown-menu").on("mouseenter", function () {
  const $button = cash(this.previousElementSibling); // Get the hover button
  const $caret = $button.find(".dropdown-caret"); // Find the caret inside the button
  $button.attr("aria-expanded", true);
  $(this).removeClass("hidden").addClass("block"); // Keep it visible
  $caret.addClass("rotate-180"); // Rotate caret
});

// Close hover-based dropdown only when leaving both button and menu
$hoverButton.add(".hover-dropdown-menu").on("mouseleave", function () {
  const $menu = cash(this.nextElementSibling || this); // Get the dropdown menu
  const $button = cash($menu.prev() || this); // Get the button
  const $caret = $button.find(".dropdown-caret"); // Get caret

  // Use a timeout to prevent immediate closing when moving between button and menu
  setTimeout(() => {
    if (!$menu.is(":hover") && !$button.is(":hover")) {
      $menu.addClass("hidden").removeClass("block"); // Hide the menu
      $caret.removeClass("rotate-180"); // Reset caret rotation
      $button.attr("aria-expanded", false);
    }
  }, 100); // Small delay to handle mouse movement between button and menu
});
