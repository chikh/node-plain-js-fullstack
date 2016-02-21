'use strict';

module.exports = modelProvider => {
  const _ = require('lodash');
  const path = require('path');
  const express = require('express');
  const router = express.Router();
  const multer = require('multer');
  const storage = multer.memoryStorage();
  const upload = multer({
    storage: storage
  });

  const modelToGridRow = (model) => {
    return {
      name: _.capitalize(model.tableName),
      fields: fieldDescriptionsToFieldLabels(model.fields)
    };
  };

  const fieldDescriptionsToFieldLabels = (fieldDescriptions) =>
    _.values(fieldDescriptions)
    .map(description => description.label)
    .join(', ');

  router.get('/', (req, res) => {
    res.render('model-grid', {
      models: modelProvider.allModels().map(modelToGridRow)
    });
  });

  router.post('/', upload.single('modelFile'), (req, res) => {
    modelProvider.addModel(JSON.parse(req.file.buffer.toString()));
    res.redirect('/');
  });

  return router;
};
