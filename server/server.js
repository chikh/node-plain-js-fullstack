'use strict';

const isDeveloping = process.env.NODE_ENV !== 'production';
const port = isDeveloping ? 3333 : process.env.PORT;

const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.sendStatus(200);
});

app.listen(port, (err) => {
  if (err) {
    console.log(err);
  }
  console.info(`Server listening on http://0.0.0.0:${port}`);
});
