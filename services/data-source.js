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
  const fp = require('lodash/fp');
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

  const stateToEntities = state => {
    const groupByRowId = fp.groupBy(cell => cell.rowId);

    const flatMapValues = fp.mapValues(
      values => {
        const value = values[0].value;
        if (value !== '') {
          return value;
        }
      }
    );

    const groupByColumnId = fp.groupBy(
      fv => fv.columnId
    );

    const mergeAttributesInto = entityId => fp.merge({
      id: entityId
    });

    const mapRows = fp.map(
      fieldValues =>
      mergeAttributesInto(
        fieldValues[0].rowId
      )(
        flatMapValues(groupByColumnId(fieldValues))
      )
    );

    return mapRows(groupByRowId(state));
  };

  const entitiesToModelsCollection = (modelName, entities) => {
    const EntityModel = bookshelf.Collection.extend({
      model: bookshelfModelFor(modelName)
    });
    return new EntityModel().add(entities);
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
      return bookshelfModelFor(modelName)
        .fetchAll()
        .then(collection => collection.serialize());
    },

    addRow: modelName => {
      return bookshelfModelFor(modelName).forge().save({
        id: aguid()
      });
    },

    saveData: modelNameAndData => {
      const modelName = modelNameAndData.modelName;
      const nextState = modelNameAndData.nextState;
      const nextStateEntities = stateToEntities(nextState);
      const previousStateEntities =
        stateToEntities(modelNameAndData.previousState);

      const nextStateModels =
        entitiesToModelsCollection(modelName, nextStateEntities);

      return bookshelfModelFor(modelName).fetchAll()
        .then(currentState => {
          const currentStateEntities = currentState.serialize();
          return _.isEmpty(
            _.differenceWith(
              currentStateEntities, previousStateEntities, _.isEqual
            )
          );
        })
        .then(isEligible => {
          if (isEligible) {
            return nextStateModels.invokeThen('save');
          } else {
            return Promise.resolve('TODO: cant save');
          }
        });
    }
  };
};
