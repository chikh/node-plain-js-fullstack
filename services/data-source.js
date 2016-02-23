'use strict';

const knex = require('knex')({
  client: 'pg',
  connection: {
    host: '127.0.0.1',
    database: 'eurochem-test'
  }
});

module.exports = () => {
  const _ = require('lodash');

  const buildColumnByFieldDescription =
    table => (fieldDescription, fieldName) => {
      switch (fieldDescription.type) {
        case 'string':
          table.string(fieldName);
          break;
        case 'datetime':
          table.dateTime(fieldName);
          break;
        case 'integer':
          table.integer(fieldName);
          break;
        default:
          table.string(fieldName);
          break;
      }
    };

  return {
    createTable: model => {
      return knex.schema.hasTable(model.tableName).then(exists => {
        if (!exists) {
          return knex.schema
            .createTable(model.tableName, function(table) {
              table.uuid('id').primary();
              _.forEach(model.fields, buildColumnByFieldDescription(table));
            });
        }
      });
    },
    dataForModel: modelName => {
      return Promise.resolve([{
        id: '1',
        model: 'tesla',
        buyDay: new Date(),
        yearOfProduction: 2016
      }, {
        id: '2',
        model: 'volvo',
        buyDay: new Date(),
        yearOfProduction: 2015
      }]);
    },
    addRow: modelName => {
      return Promise.resolve(modelName);
    }
  };
};
