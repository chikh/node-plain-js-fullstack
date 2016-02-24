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

  describe('Save data method', () => {
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

    const testOnPrecreatedEmptyRows = (dataToSave, expectedData, done) => {
      knex(modelName)
        .insert(expectedData.map(entity => {
          return {
            id: entity.id
          };
        }))
        .then(() => dataSource.saveData(dataToSave))
        .then(() => knex(modelName).select())
        .then(rows => {
          rows.should.be.deep.equal(expectedData);
          done();
        })
        .catch(e => done(e));
    };

    it('should save data into empty rows', done => {
      const rowId1 = guid();
      const rowId2 = guid();
      const dataToSave = {
        modelName: modelName,
        data: [{
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
        }]
      };
      const expectedData = [{
        id: rowId1,
        color: 'red',
        size: 42
      }, {
        id: rowId2,
        color: 'green',
        size: null
      }];

      testOnPrecreatedEmptyRows(dataToSave, expectedData, done);
    });

    it('should properly handle empty values', done => {
      const rowId2 = guid();
      const dataToSave = {
        modelName: modelName,
        data: [{
          rowId: rowId2,
          value: 'green',
          columnId: 'color'
        }, {
          rowId: rowId2,
          value: '',
          columnId: 'size'
        }]
      };
      const expectedData = [{
        id: rowId2,
        color: 'green',
        size: null
      }];

      testOnPrecreatedEmptyRows(dataToSave, expectedData, done);
    });
  });
});
