'use strict';
const _ = require('lodash');

module.exports = modelProvider => {
  const path = require('path');
  const express = require('express');
  const router = express.Router();

  const modelToGridRow = (model) => {
    return {
      name: _.capitalize(model.tableName),
      fields: fieldDescriptionsToFieldLabels(model.fields)
    };
  };

  const fieldDescriptionsToFieldLabels = (fieldDescriptions) =>
    _.values(fieldDescriptions).
  map(description => description.label).
  join(', ');

  router.get('/', (req, res) => {
    res.render('model-grid', {
      models: modelProvider.allModels().map(modelToGridRow)
    });
  });

  return router;
};
