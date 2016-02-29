'use strict';

/* global editColumn fixture sinon*/
/* eslint no-unused-expressions: 0 */

before(function() {
  fixture.setBase('test/client/fixtures');
});

afterEach(function() {
  fixture.cleanup();
});

describe('Data controller', function() {
  describe('edit column method', function() {
    beforeEach(function() {
      sinon.spy(window.autocomplete, 'initialize');
    });

    afterEach(function() {
      window.autocomplete.initialize.restore();
    });

    var column = 'sizeColumn';

    it('replace columns data with input controls', function() {
      fixture.load('data-table-one-cell.html');
      editColumn(column);
      $('td.' + column).should.have.descendants('input');
      $('td.' + column + ' > input').should.have.value('42');
    });

    it('should provide uniqe values for autocomplete\'s initialization',
      function() {
        fixture.load('data-table-five-cells.html');
        editColumn(column);
        window.autocomplete.initialize.should.have.been.calledWith({
          sizeColumn: ['42', '41', '']
        });
      });
  });
});
