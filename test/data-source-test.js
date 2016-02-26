'use strict';

/* eslint no-unused-expressions: 1 */

const chai = require('chai');
chai.should();
const path = require('path');
const knex = require('knex')({
  client: 'pg',
  connection: {
    host: '127.0.0.1',
    database: 'eurochem-test'
  }
});
const guid = require('aguid');
const _ = require('lodash');

const testTableName = 'tableFromTest';

describe('Datasource', () => {
  let dataSource;

  beforeEach(() => {
    dataSource =
      require(path.join(__dirname, '..', 'services', 'data-source'))();
  });

  afterEach(done => {
    knex.schema
      .dropTableIfExists(testTableName)
      .then(() => done())
      .catch(e => done(e));
  });

  const createTestTable = () => {
    return dataSource.createTable({
      tableName: testTableName,
      fields: {
        testField: {
          type: 'string',
          label: 'No matter'
        }
      }
    });
  };

  it('table creation should be successful', done => {
    createTestTable().then(() => done()).catch(err => done(err));
  });

  it('should create table with appropriate fields', done => {
    createTestTable().then(() => knex.schema
        .hasTable(testTableName))
      .then(exists => {
        if (exists) {
          knex.schema.hasColumn(testTableName, 'testField')
            .then(columnExists => {
              if (columnExists) {
                done();
              } else {
                done(new Error('Column doesn\'t exist'));
              }
            }).catch(e => done(e));
        } else {
          done(new Error('Table doesn\'t exist'));
        }
      }).catch(e => done(e));
  });

  it('should fetch data from table', done => {
    createTestTable()
      .then(() => knex(testTableName)
        .insert({
          id: guid(),
          testField: 'testValue'
        })
      )
      .then(() => dataSource.dataForModel(testTableName))
      .then(data => {
        data.length.should.be.equal(1);
        data[0].testField.should.be.equal('testValue');
        done();
      }).catch(e => done(e));
  });

  it('should create an empty row', done => {
    createTestTable()
      .then(() => dataSource.addRow(testTableName))
      .then(() => knex.select().table(testTableName))
      .then(rows => {
        rows.length.should.be.equal(1);
        done();
      })
      .catch(e => done(e));
  });

  describe('save data method', () => {
    const modelName = 'apples';

    beforeEach(done => {
      knex.schema
        .createTable(modelName, table => {
          table.uuid('id').primary();
          table.string('color');
          table.integer('size');
        })
        .then(() => done())
        .catch(e => done(e));
    });

    afterEach(done => {
      knex.schema.dropTableIfExists('apples')
        .then(() => done())
        .catch(e => done(e));
    });

    const emptyEntitesBy = entities => entities.map(entity => {
      return _.mapValues(entity, (v, k) => (k === 'id') ? v : null);
    });

    const testOnPrecreatedEmptyRows =
      (dataToSave, expectedData, done, additionalAsserts) => {
        if (!additionalAsserts) {
          additionalAsserts = () => {};
        }
        knex(modelName)
          .insert(emptyEntitesBy(expectedData))
          .then(() => dataSource.saveData(dataToSave))
          .then(saveDataResult => knex(modelName).select()
            .then(rows => {
              additionalAsserts(saveDataResult, rows);
              rows.should.be.deep.equal(expectedData);
              done();
            }))
          .catch(e => done(e));
      };

    const dataToSave = (modelName, previousState, nextState) => {
      return {
        modelName: modelName,
        previousState: previousState,
        nextState: nextState
      };
    };

    it('should save data into empty rows', done => {
      const rowId1 = guid();
      const rowId2 = guid();
      const nextState = [{
        rowId: rowId1,
        columnId: 'color',
        value: 'red'
      }, {
        rowId: rowId1,
        columnId: 'size',
        value: 42
      }, {
        rowId: rowId2,
        value: 'green',
        columnId: 'color'
      }, {
        rowId: rowId2,
        columnId: 'size'
      }];
      const expectedData = [{
        id: rowId1,
        color: 'red',
        size: 42
      }, {
        id: rowId2,
        color: 'green',
        size: null
      }];
      const data = dataToSave(
        modelName, emptyEntitesBy(expectedData), nextState
      );

      testOnPrecreatedEmptyRows(data, expectedData, done);
    });

    it('should properly handle empty values', done => {
      const rowId2 = guid();
      const nextState = [{
        rowId: rowId2,
        value: 'green',
        columnId: 'color'
      }, {
        rowId: rowId2,
        value: '',
        columnId: 'size'
      }];
      const expectedData = [{
        id: rowId2,
        color: 'green',
        size: null
      }];
      const data = dataToSave(
        modelName, emptyEntitesBy(expectedData), nextState
      );

      testOnPrecreatedEmptyRows(data, expectedData, done);
    });

    const illegalStateTest = (assertFun, done) => {
      const rowId = guid();
      const nextState = [{
        rowId: rowId,
        columnId: 'color',
        value: 'red'
      }];
      const previousState = [{
        id: rowId,
        color: 'green',
        size: null
      }];
      const expectedData = [{
        id: rowId,
        color: null,
        size: null
      }];
      const data = dataToSave(modelName, previousState, nextState);

      assertFun(data, expectedData, done);
    };

    it('shouldn\'t save data if previous state ' +
      'isn\'t equal to the current state of DB',
      done => illegalStateTest(testOnPrecreatedEmptyRows, done)
    );

    it('should return rowId and colId of illegal state value', done =>
      illegalStateTest((data, expectedData, done) =>
        testOnPrecreatedEmptyRows(data, expectedData, done, (result, rows) => {
          result.should.be.deep.equal([{
            rowId: rows[0].id,
            columnId: 'color'
          }]);
        }), done)
    );
  });
});
