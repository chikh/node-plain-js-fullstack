'use strict';

const stubber = require(require('path').join(__dirname, 'service-stubber'));

module.exports = () => {
  return stubber({
    createTable: () => Promise.resolve('some table creation result')
  });
};
