'use strict';

const path = require('path');
const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.render('model-grid');
});

module.exports = router;
