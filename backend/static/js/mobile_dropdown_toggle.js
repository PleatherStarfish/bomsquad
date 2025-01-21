document.addEventListener("DOMContentLoaded", function () {
  const resourcesButton = document.getElementById("resources-menu-button");
  const resourcesPanel = document.getElementById("resources-menu-panel");

  resourcesButton.addEventListener("click", function () {
    const isOpen = resourcesPanel.classList.contains("hidden");

    if (isOpen) {
      resourcesPanel.classList.remove("hidden");
      resourcesPanel.style.maxHeight = `${resourcesPanel.scrollHeight}px`;
      const svg = resourcesButton.querySelector("svg");
      if (svg) {
        svg.classList.add("rotate-180");
      }
    } else {
      resourcesPanel.style.maxHeight = "0";
      resourcesPanel.addEventListener(
        "transitionend",
        function () {
          resourcesPanel.classList.add("hidden");
        },
        { once: true } // Ensures the event listener is only called once
      );
      const svg = resourcesButton.querySelector("svg");
      if (svg) {
        svg.classList.remove("rotate-180");
      }
    }
  });
});
