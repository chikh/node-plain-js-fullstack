'use strict';

/* eslint new-cap: 1 */

module.exports = (modelProvider, dataSource) => {
  const _ = require('lodash');
  const router = require('express').Router({
    mergeParams: true
  });

  const existingModel = (req, res, next) => {
    const modelName = req.params.modelName;
    if (
      modelProvider.modelExists({
        tableName: modelName
      })
    ) {
      next();
    } else {
      next('route');
    }
  };

  const fieldDescriptionToColumn = (fieldDescription, fieldName) => {
    return {
      id: fieldName,
      label: fieldDescription.label
    };
  };

  router.get('/:modelName', existingModel, (req, res) => {
    const modelName = req.params.modelName;
    dataSource.dataForModel(modelName).then(dataRows => {
      res.render('data-grid', {
        modelName: modelName,
        columns: _.map(modelProvider
          .allModels()
          .find(model => model.tableName === modelName)
          .fields, fieldDescriptionToColumn),
        rows: dataRows
      });
    });
  });

  router.post('/:modelName', (req, res) => {
    const modelName = req.params.modelName;
    dataSource
      .addRow(modelName)
      .then(() => res.sendStatus(200))
      .catch(err => res.status(500).json(err));
  });

  router.put('/:modelName', (req, res) => {
    dataSource.saveData(_.assign({
      modelName: req.params.modelName
    }, req.body))
      .then(result => res.status(200).json(result))
      .catch(err => {
        console.error(err);
        res.status(500).json(err);
      });
  });

  return router;
};
