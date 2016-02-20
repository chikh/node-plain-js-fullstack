'use strict';

module.exports = modelProvider => {
  const path = require('path');
  const express = require('express');
  const router = express.Router();

  router.get('/', (req, res) => {
    res.render('model-grid', {
      models: modelProvider.allModels()
    });
  });
  return router;
};
