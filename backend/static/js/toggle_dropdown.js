// ===============================================
// Dropdown Toggle Functionality
// ===============================================

// Select profile dropdown buttons
const profileButtons = document.querySelectorAll(".menu-button-click"); // For click-based dropdowns
const hoverButtons = document.querySelectorAll(".menu-button-hover"); // For hover-based dropdowns

// Toggle visibility for click-based dropdown menus
profileButtons.forEach((button) => {
  button.addEventListener("click", function (event) {
    event.stopPropagation(); // Prevent click event from bubbling up
    const menu = this.nextElementSibling; // Get the dropdown menu
    const caret = this.querySelector(".dropdown-caret"); // Find the caret inside the button

    // Toggle the menu visibility
    menu.classList.toggle("hidden");
    menu.classList.toggle("block");

    // Rotate the caret based on the menu state
    if (menu.classList.contains("block")) {
      caret.classList.add("rotate-180");
    } else {
      caret.classList.remove("rotate-180");
    }

    // Update aria-expanded for accessibility
    const expanded = menu.classList.contains("block");
    this.setAttribute("aria-expanded", expanded);
  });
});

// Keep dropdown open when interacting with it
const dropdownMenus = document.querySelectorAll(".dropdown-menu");
dropdownMenus.forEach((menu) => {
  menu.addEventListener("click", function (event) {
    event.stopPropagation(); // Prevent click event from bubbling up
  });
});

// Close click-based dropdowns when clicking outside
document.addEventListener("click", function () {
  profileButtons.forEach((button) => {
    const menu = button.nextElementSibling;
    const caret = button.querySelector(".dropdown-caret");

    // Hide the menu and reset caret rotation
    if (menu.classList.contains("block")) {
      menu.classList.add("hidden");
      menu.classList.remove("block");
      caret.classList.remove("rotate-180");
      button.setAttribute("aria-expanded", false);
    }
  });
});

// Hover functionality for hover-based dropdowns
hoverButtons.forEach((button) => {
  button.addEventListener("mouseenter", function () {
    const menu = this.nextElementSibling; // Get the dropdown menu
    const caret = this.querySelector(".dropdown-caret"); // Find the caret inside the button
    menu.classList.remove("hidden");
    menu.classList.add("block"); // Show the menu
    caret.classList.add("rotate-180"); // Rotate caret
    this.setAttribute("aria-expanded", true);
  });
});

// Ensure the dropdown stays open when hovering over the menu
const hoverDropdownMenus = document.querySelectorAll(".hover-dropdown-menu");
hoverDropdownMenus.forEach((menu) => {
  menu.addEventListener("mouseenter", function () {
    const button = this.previousElementSibling; // Get the hover button
    const caret = button.querySelector(".dropdown-caret"); // Find the caret inside the button
    button.setAttribute("aria-expanded", true);
    this.classList.remove("hidden");
    this.classList.add("block"); // Keep it visible
    caret.classList.add("rotate-180"); // Rotate caret
  });
});

// Close hover-based dropdown only when leaving both button and menu
hoverButtons.forEach((button) => {
  button.addEventListener("mouseleave", function () {
    const menu = this.nextElementSibling; // Get the dropdown menu

    setTimeout(() => {
      if (!menu.matches(":hover") && !this.matches(":hover")) {
        menu.classList.add("hidden");
        menu.classList.remove("block");
        const caret = this.querySelector(".dropdown-caret");
        caret.classList.remove("rotate-180"); // Reset caret rotation
        this.setAttribute("aria-expanded", false);
      }
    }, 300); // Small delay to handle mouse movement between button and menu
  });
});

hoverDropdownMenus.forEach((menu) => {
  menu.addEventListener("mouseleave", function () {
    const button = this.previousElementSibling; // Get the hover button

    setTimeout(() => {
      if (!menu.matches(":hover") && !button.matches(":hover")) {
        menu.classList.add("hidden");
        menu.classList.remove("block");
        const caret = button.querySelector(".dropdown-caret");
        caret.classList.remove("rotate-180"); // Reset caret rotation
        button.setAttribute("aria-expanded", false);
      }
    }, 300); // Small delay to handle mouse movement between button and menu
  });
});
