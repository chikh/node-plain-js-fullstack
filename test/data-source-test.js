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

const testTableName = 'tableFromTest';

describe('Datasource', () => {
  let dataSource;

  beforeEach(() => {
    dataSource =
      require(path.join(__dirname, '..', 'services', 'data-source'))();
  });

  afterEach(done => {
    knex.schema
      .dropTableIfExists(testTableName).then(() => done()).catch(e => done(e));
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
    createTestTable().then(() => {
      knex.schema.hasTable(testTableName).then(exists => {
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
    }).catch(e => done(e));
  });

  it('should fetch data from table', done => {
    createTestTable().then(() => {
      return knex(testTableName).insert({
        id: require('aguid')(),
        testField: 'testValue'
      }).then(() => {
        return dataSource.dataForModel(testTableName).then(data => {
          data.length.should.be.equal(1);
          data[0].testField.should.be.equal('testValue');
          done();
        });
      });
    }).catch(e => done(e));
  });

  it('should create an empty row', done => {
    createTestTable().then(() => {
      return dataSource.addRow(testTableName).then(() => {
        return knex.select().table(testTableName).then(rows => {
          rows.length.should.be.equal(1);
          done();
        });
      }).catch(e => done(e));
    });
  });
});
