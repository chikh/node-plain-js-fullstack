(function() {
  'use strict';
  window.autocomplete = window.autocomplete || {};
  var values = [];
  var currentInputId;
  var autocompleteSelection;

  var initializeUI = function() {
    var options = values.map(function(value) {
      return $('<div></div>')
        .text(value)
        .css('width', '80px')
        .css('height', '30px')
        .css('padding', '5px 5px 5px 5px')
        .hover(function() {
          $(this).css('background', 'lightgrey');
        }, function() {
          $(this).css('background', '');
        })
        .on('click', function() {
          $('input#' + currentInputId).val($(this).text());
          autocompleteSelection.hide();
        });
    });
    return $('<div></div>')
      .attr('id', 'autocomplete-selection')
      .css('position', 'absolute')
      .css('z-index', 1000)
      .css('opacity', '1')
      .css('padding', '5px 5px 5px 5px')
      .css('background', 'white')
      .append(options)
      .hide()
      .appendTo('body');
  };

  window.autocomplete.initialize = function(valueSource) {
    values = valueSource();
    autocompleteSelection = initializeUI();
    $('input.autocomplete').on('click', function() {
      currentInputId = this.id;
      var position = $(this).position();
      var top = position.top + 30;
      autocompleteSelection.css('top', top + 'px');
      autocompleteSelection.css('left', position.left);
      autocompleteSelection.show();
    }).blur(function() {
      autocompleteSelection.hide();
    });
  };
})();
