const button = document.getElementById("menu-button");
const menu = document.getElementById("dropdown-menu");

console.log(button);
console.log(menu);

button.addEventListener("click", () => {
  menu.classList.toggle("hidden");
  menu.classList.toggle("block");
});
