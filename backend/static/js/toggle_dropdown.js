// ===============================================
// Generic Dropdown Toggle Functionality
// ===============================================

// Select all menu buttons
const $buttons = $(".menu-button");

// Toggle the visibility of dropdown menus when a button is clicked
$buttons.on("click", function(event) {
  event.stopPropagation(); // Prevent click event from bubbling up
  const $menu = cash(this.nextElementSibling); // Get the menu element next to the button
  $menu.toggleClass("hidden block"); // Toggle visibility classes

  // Update the aria-expanded attribute for accessibility
  const expanded = $menu.hasClass("block");
  this.setAttribute("aria-expanded", expanded);
});

// Close dropdown menus when clicking outside of them
$(document).on("click", function() {
  $buttons.each(function(index, button) {
    const $menu = cash(button.nextElementSibling);

    // Hide the menu and reset aria-expanded if it's visible
    if (!$menu.hasClass("hidden")) {
      $menu.addClass("hidden");
      button.setAttribute("aria-expanded", false);
    }
  });
});