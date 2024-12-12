cash(document).ready(function () {
  const $resourcesButton = cash("#resources-menu-button");
  const $resourcesPanel = cash("#resources-menu-panel");

  $resourcesButton.on("click", function () {
    const isOpen = $resourcesPanel.hasClass("hidden");

    if (isOpen) {
      $resourcesPanel.removeClass("hidden");
      $resourcesPanel.css("max-height", `${$resourcesPanel[0].scrollHeight}px`);
      $resourcesButton.find("svg").addClass("rotate-180");
    } else {
      $resourcesPanel.css("max-height", "0");
      $resourcesPanel.on("transitionend", function () {
        $resourcesPanel.addClass("hidden");
      }, { once: true });
      $resourcesButton.find("svg").removeClass("rotate-180");
    }
  });
});
      