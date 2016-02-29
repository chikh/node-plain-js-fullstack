/* global _ */

(function() {
  'use strict';

  $(function() {
    $('button#save-button').hide();
  });

  var rowIdFor = function(cellElem) {
    return cellElem.parent().closest('tr').attr('id');
  };

  window.editColumn = function(columnId) {
    var values = [];
    $('td.' + columnId + ' > div').each(function(i, elem) {
      var div = $(elem);
      var rowId = rowIdFor(div);
      var divValue = div.text();
      values.push(divValue);
      var input =
        $('<input type="text"/>')
        .addClass('autocomplete')
        .val(divValue)
        .attr('id', 'input-' + rowId + '-' + columnId)
        .attr('class', 'autocomplete')
        .attr('autocomplete-collection', columnId);
      div.replaceWith(input);
    });

    if (window.autocomplete) {
      var columnValues = {};
      columnValues[columnId] = _.uniq(values);
      window.autocomplete.initialize(columnValues);
    }

    $('button#save-button').show();
  };

  window.addRow = function(modelName) {
    $.ajax({
      url: '/model/' + modelName,
      method: 'post'
    }).done(function() {
      document.location.reload();
    });
  };

  var dataFromInputs = function() {
    return $('input').map(function(i, elem) {
      var input = $(elem);
      var columnId = input.parent().closest('td').attr('class');
      var rowId = rowIdFor(input);
      var value = input.val();
      return {
        columnId: columnId,
        rowId: rowId,
        value: value
      };
    }).get();
  };

  window.saveGrid = function(modelName, initialCellsData, override) {
    $.ajax({
      url: '/model/' + modelName,
      method: 'put',
      contentType: 'application/json; charset=UTF-8',
      dataType: 'json',
      data: JSON.stringify({
        override: override,
        previousState: initialCellsData,
        nextState: dataFromInputs()
      })
    }).done(function(response) {
      if (response.success) {
        document.location.reload();
      } else if (response.failure) {
        response.failure.forEach(function(rowAndColumn) {
          $('tr#' + rowAndColumn.rowId + ' > td.' + rowAndColumn.columnId)
            .css('border-style', 'solid')
            .css('border-width', '5px')
            .css('border-color', 'red');
          $('#override-modal').modal('show');
        });
      }
    });
  };

  window.onCancel = function() {
    document.location.reload();
  };
})();
