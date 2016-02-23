'use strict';

const sinon = require('sinon');
const _ = require('lodash');

module.exports = service => _.mapValues(service,
    (fun, methodName) => sinon.stub(service, methodName, fun)
  );
