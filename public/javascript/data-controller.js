/* global window $ document*/

(function() {
  'use strict';

  $(function() {
    $('button#save-button').hide();
  });

  window.editColumn = function(columnId) {
    $('td.' + columnId + ' > div').each(function(i, elem) {
      var div = $(elem);
      var input = $('<input type="text"/>').val(div.text());
      div.replaceWith(input);
    });

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
      var rowId = input.parent().closest('tr').attr('id');
      var value = input.val();
      return {
        columnId: columnId,
        rowId: rowId,
        value: value
      };
    }).get();
  };

  window.saveGrid = function(modelName, initialCellsData) {
    $.ajax({
      url: '/model/' + modelName,
      method: 'put',
      contentType: 'application/json; charset=UTF-8',
      dataType: 'json',
      data: JSON.stringify({
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
        });
      }
    });
  };
})();
