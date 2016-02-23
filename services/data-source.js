'use strict';

const knex = require('knex')({
  client: 'pg',
  connection: {
    host: '127.0.0.1',
    database: 'eurochem-test'
  }
});

const bookshelf = require('bookshelf')(knex);

module.exports = () => {
  const _ = require('lodash');
  const aguid = require('aguid');

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

  const bookshelfModelFor = modelName => bookshelf.Model.extend({
    tableName: modelName
  });

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
      return bookshelfModelFor(modelName)
        .fetchAll()
        .then(collection => collection.serialize());
    },
    addRow: modelName => {
      return bookshelfModelFor(modelName).forge().save({
        id: aguid()
      });
    }
  };
};
