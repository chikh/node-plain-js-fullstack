'use strict';

/* global editColumn */
/* eslint no-unused-expressions: 0 */

describe('Data controller', () => {
  const fixtureDivId = 'data-table-fixture';

  beforeEach(() => {
    const tableBody =
      '<div id="' + fixtureDivId + '">' +
      '<table>' +
      '<thead><tr><th>Size</th></tr></thead>' +
      '<tbody>' +
      '<tr id="rowId1"><td class="sizeColumn"><div>42</div></td></tr>' +
      '</tbody>' +
      '</table>' +
      '</div>';
    document.body.insertAdjacentHTML('afterbegin', tableBody);
  });

  afterEach(() => {
    document.body.removeChild(document.getElementById(fixtureDivId));
  });

  it('replace columns data with input controls', () => {
    const column = 'sizeColumn';
    editColumn(column);
    $('td.' + column).should.have.descendants('input');
    $('td.' + column + ' > input').should.have.value('42');
  });
});
