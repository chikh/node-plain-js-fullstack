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

  const entitiesToState =
    entities => _.flatMap(entities, entity =>
      _.map(_.omit(entity, 'id'), (value, columnOrId) => {
        return {
          rowId: entity.id,
          columnId: columnOrId,
          value: value
        };
      })
    );

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
      const previousStateEntities = modelNameAndData.previousState;

      return bookshelfModelFor(modelName).fetchAll()
        .then(currentStateModels => {
          const currentState = entitiesToState(currentStateModels.serialize());
          return _.differenceWith(
            currentState, entitiesToState(previousStateEntities), _.isEqual
          );
        })
        .then(difference => (_.isEmpty(difference)) ?
          entitiesToModelsCollection(
            modelName, stateToEntities(modelNameAndData.nextState)
          ).invokeThen('save') :
          difference.map(cell => _.omit(cell, 'value'))
        );
    }
  };
};
