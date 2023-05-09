// Toggle generic dropdowns
const $buttons = $(".menu-button");

$buttons.on("click", function(event) {
  event.stopPropagation();
  const $menu = cash(this.nextElementSibling);
  $menu.toggleClass("hidden block");

  // Change aria-expanded attribute of button
  const expanded = $menu.hasClass("block");
  this.setAttribute("aria-expanded", expanded);
});

// Close the menu when clicking outside
$(document).on("click", function() {
  $buttons.each(function(index, button) {
    const $menu = cash(button.nextElementSibling);

    if (!$menu.hasClass("hidden")) {
      $menu.addClass("hidden");
      button.setAttribute("aria-expanded", false);
    }
  });
});



const $dropdownButtons = $('.dropdown-button'); // Select all dropdown buttons
const currentPageUrl = window.location.pathname; // Get the current page URL

$dropdownButtons.each(function (index, button) {
  const $button = $(button);
  const $dropdownList = $button.siblings('.dropdown-list');
  const $defaultOption = $dropdownList.find('.default-option');
  const $dropdownItems = $dropdownList.find('.option-item');
  const $selectedText = $button.find('.selected-text');
  const $selectedValue = $button.siblings('.selected-value');
  const $chevron = $button.find('.chevron');

  // Get the saved value from local storage
  const savedValueKey = `${currentPageUrl}_${$selectedValue.attr('name')}`;
  const savedValue = localStorage.getItem(savedValueKey);
  if (savedValue) {
    const $savedItem = $dropdownItems.filter(`[data-value="${savedValue}"]`);
    $selectedText.text($savedItem.text());
    $selectedValue.val(savedValue);
  }

  $button.on('click', function (event) {
    event.preventDefault();
    $dropdownList.toggle();
    $chevron.toggleClass('chevron-open');
  });

  // Bind a click event to the default option
  $defaultOption.on('click', function () {
    $selectedText.text($defaultOption.text());
    $selectedValue.val($defaultOption.data('value'));
    localStorage.setItem(savedValueKey, $defaultOption.data('value')); // Use savedValueKey here
    $dropdownList.hide();
    $chevron.removeClass('chevron-open');
  });

  $dropdownItems.each(function (index, item) {
    const $item = $(item);
    $item.on('click', function () {
      $selectedText.text($item.text());
      $selectedValue.val($item.data('value'));
      localStorage.setItem(savedValueKey, $item.data('value')); // Use savedValueKey here
      $dropdownList.hide();
      $chevron.removeClass('chevron-open');
    });
  });


  $(document).on('click', function (event) {
    if (!$button.is(event.target) && !$dropdownList.is(event.target) && $dropdownList.has(event.target).length === 0) {
      $dropdownList.hide();
      $chevron.removeClass('chevron-open');
    }
  });
});

