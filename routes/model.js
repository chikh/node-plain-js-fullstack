'use strict';

/* eslint new-cap: 1*/

module.exports = modelProvider => {
  const _ = require('lodash');
  const express = require('express');
  const router = express.Router();
  const multer = require('multer');
  const storage = multer.memoryStorage();
  const upload = multer({
    storage: storage
  });

  const fieldDescriptionsToFieldLabels = fieldDescriptions =>
    _.values(fieldDescriptions)
    .map(description => description.label)
    .join(', ');

  const modelToGridRow = model => {
    return {
      name: _.capitalize(model.tableName),
      fields: fieldDescriptionsToFieldLabels(model.fields)
    };
  };

  router.get('/', (req, res) => {
    res.render('model-grid', {
      models: modelProvider.allModels().map(modelToGridRow)
    });
  });

  router.post('/', upload.single('modelFile'), (req, res) => {
    const parsedModel = JSON.parse(req.file.buffer.toString());
    if (modelProvider.modelExists(parsedModel)) {
      res.status(409)
        .send(
          `Model "${parsedModel.tableName}" already exists. ` +
          `Pls, try another one.`
        );
    } else {
      modelProvider.addModel(parsedModel);
      res.redirect('/');
    }
  });

  return router;
};
