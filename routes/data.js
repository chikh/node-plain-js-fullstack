'use strict';

/* eslint new-cap: 1 */

module.exports = (modelProvider, dataSource) => {
  const _ = require('lodash');
  const router = require('express').Router({
    mergeParams: true
  });

  const existingModel = (req, res, next) => {
    const modelName = req.params.modelName;
    if (!modelProvider
      .modelExists({
        tableName: modelName
      })) {
      next('route');
    } else {
      next();
    }
  };

  router.get('/:modelName', existingModel, (req, res) => {
    const modelName = req.params.modelName;
    dataSource.dataForModel(modelName).then(dataRows => {
      res.render('data-grid', {
        modelName: modelName,
        columns: _.map(modelProvider
          .allModels()
          .find(model => model.tableName === modelName)
          .fields, (fieldDescription, fieldName) => {
            return {
              id: fieldName,
              label: fieldDescription.label
            };
          }
        ),
        rows: dataRows
      });
    });
  });

  router.post('/:modelName', (req, res) => {
    const modelName = req.params.modelName;
    dataSource
      .addRow(modelName)
      .then(() => res.sendStatus(200))
      .catch(e => res.status(500).json(e));
  });

  return router;
};
