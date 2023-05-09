$('#full-screen-menu-button').on('click', function() {
  $('#full-screen-menu').removeClass('hidden').removeClass('-translate-y-full').addClass('translate-y-0');
});

$('#close-full-screen-menu').on('click', function() {
  $('#full-screen-menu').removeClass('translate-y-0').addClass('-translate-y-full');
});

// Add event listener for transitionend event
$('#full-screen-menu').on('transitionend', function(e) {
  // Check if the transition is for the 'transform' property
  if (e.originalEvent.propertyName === 'transform') {
    // Check if the element has the '-translate-y-full' class
    if ($('#full-screen-menu').hasClass('-translate-y-full')) {
      $('#full-screen-menu').addClass('hidden');
    }
  }
});