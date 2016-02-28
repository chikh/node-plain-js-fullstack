'use strict';

/* global editColumn fixture*/
/* eslint no-unused-expressions: 0 */

before(function() {
  fixture.setBase('test/client/fixtures');
});

afterEach(function() {
  fixture.cleanup();
});

describe('Data controller', function() {
  beforeEach(function() {
    fixture.load('data-table-one-cell.html');
  });

  it('replace columns data with input controls', function() {
    var column = 'sizeColumn';
    editColumn(column);
    $('td.' + column).should.have.descendants('input');
    $('td.' + column + ' > input').should.have.value('42');
  });
});
