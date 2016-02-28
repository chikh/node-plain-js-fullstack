(function() {
  'use strict';
  window.autocomplete = window.autocomplete || {};
  var values = [];
  var currentInputId;
  var autocompleteComponent;

  var initializeUI = function() {
    var optionElements = values.map(function(value) {
      return $('<div></div>')
        .text(value)
        .addClass('autocomplete-option')
        .hover(function() {
          $(this).css('background', 'lightgrey');
        }, function() {
          $(this).css('background', '');
        })
        .on('click', function() {
          $('input#' + currentInputId).val($(this).text());
          autocompleteComponent.hide();
        });
    });
    return $('<div></div>')
      .attr('id', 'autocomplete-component')
      .append(optionElements)
      .hide()
      .appendTo('body');
  };

  window.autocomplete.initialize = function(valueSource) {
    values = valueSource();
    autocompleteComponent = initializeUI();
    $('input.autocomplete').on('click', function() {
      currentInputId = this.id;
      var position = $(this).position();
      var top = position.top + 30;
      autocompleteComponent.css('top', top + 'px');
      autocompleteComponent.css('left', position.left);
      autocompleteComponent.show();
    });
  };
})();
