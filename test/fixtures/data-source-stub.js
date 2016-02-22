'use strict';

const sinon = require('sinon');

const stub = () => {
  let stub = sinon.stub({
    createTable: () => {}
  });

  stub.createTable.returns(new Promise(resolve => resolve()));

  return stub;
}

module.exports = stub;
