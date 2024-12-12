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
  $menu.toggleClass("hidden block"); // Toggle visibility classes

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

    // Hide the menu and reset aria-expanded if visible
    if (!$menu.hasClass("hidden")) {
      $menu.addClass("hidden").removeClass("block");
      button.setAttribute("aria-expanded", false);
    }
  });
});

// Hover functionality for hover-based dropdowns
$hoverButton.on("mouseenter", function () {
  const $menu = cash(this.nextElementSibling); // Get the dropdown menu
  $menu.removeClass("hidden").addClass("block"); // Show the menu
  this.setAttribute("aria-expanded", true);
});

// Keep hover-based dropdown open when mouse enters the menu
$(".hover-dropdown-menu").on("mouseenter", function () {
  const $button = cash(this.previousElementSibling); // Get the hover button
  $button.attr("aria-expanded", true);
  $(this).removeClass("hidden").addClass("block"); // Keep it visible
});

// Close hover-based dropdown when the mouse leaves both the button and menu
$hoverButton.add(".hover-dropdown-menu").on("mouseleave", function () {
  const $menu = cash(this.nextElementSibling || this); // Get the dropdown menu
  $menu.addClass("hidden").removeClass("block"); // Hide the menu
  const $button = cash($menu.prev()); // Update aria-expanded on the button
  $button.attr("aria-expanded", false);
});
