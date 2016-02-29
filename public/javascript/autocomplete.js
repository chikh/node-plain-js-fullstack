/* global _ */

(function() {
  'use strict';
  window.autocomplete = window.autocomplete || {};
  var currentInputId;
  var autocompleteComponent;

  var initializeMainComponent = function() {
    return $('<div></div>')
      .attr('id', 'autocomplete-component')
      .addClass('autocomplete-component')
      .hide()
      .appendTo('body');
  };

  var initializeOptions = function(values) {
    return _.flatMap(values, function(valuesInCollection, collectionKey) {
      return valuesInCollection.map(function(value) {
        return $('<div></div>')
          .text(value)
          .addClass('autocomplete-option')
          .attr('collection-key', collectionKey)
          .hide()
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
    });
  };

  window.autocomplete.initialize = function(valueSource) {
    if (autocompleteComponent) {
      autocompleteComponent.append(initializeOptions(valueSource()));
    } else {
      autocompleteComponent = initializeMainComponent();
      autocompleteComponent.append(initializeOptions(valueSource()));
      $('input.autocomplete').on('click', function() {
        currentInputId = this.id;
        var position = $(this).position();
        var top = position.top + 30;
        autocompleteComponent.css('top', top + 'px');
        autocompleteComponent.css('left', position.left);
        autocompleteComponent.show();
      });
    }
  };

  window.autocomplete.destroy = function() {
    autocompleteComponent.remove();
    autocompleteComponent = undefined;
    currentInputId = undefined;
  };
})();
