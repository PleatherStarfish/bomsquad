const button = document.getElementById("menu-button");
const menu = document.getElementById("dropdown-menu");

button.addEventListener("click", () => {
  menu.classList.toggle("hidden");
  menu.classList.toggle("block");
});
