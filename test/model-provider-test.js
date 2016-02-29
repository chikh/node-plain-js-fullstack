'use strict';

/* eslint no-unused-expressions: 0 */

const path = require('path');
const chai = require('chai');
chai.should();
let modelProvider;
let dataSource;

describe('Model provider', () => {
  beforeEach(() => {
    dataSource =
      require(path.join(__dirname, 'fixtures', 'data-source-stub'))();

    modelProvider =
      require(
        path.join(__dirname, '..', 'services', 'model-provider')
      )(dataSource);
  });

  describe('modelExists method', () => {
    it('should return false if model is absent', () => {
      modelProvider
        .modelExists({
          tableName: 'doesntExist',
          fields: {}
        })
        .should.be.false;
    });

    it('should return true if model is present', () => {
      const constructModel = () => {
        return {
          tableName: 'exists',
          fields: {
            fooField: {
              type: 'string',
              label: 'foo'
            }
          }
        };
      };
      modelProvider.addModel(constructModel()).then(() =>
        modelProvider.modelExists(constructModel()).should.be.true
      );
    });
  });

  describe('addModel method', () => {
    it('should create a new table in the DB', () => {
      modelProvider
        .addModel(require(path.join(__dirname, 'fixtures', 'car-model.json')));
      dataSource.createTable.should.have.been.calledOnce;
    });
  });
});
