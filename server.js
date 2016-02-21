'use strict';
const path = require('path');

const run = (callback, port) => modelProvider => {
  if (!callback) {
    callback = () => {};
  }

  if (!port) {
    port = 3333;
  }

  if (!modelProvider) {
    throw 'modelProvider is required';
  }

  const isDeveloping = process.env.NODE_ENV !== 'production';
  port = isDeveloping ? port : process.env.PORT;

  const express = require('express');
  const app = express();

  const modelRouter = require(path.join(__dirname, 'routes', 'model'));

  app.set('views', path.join(__dirname, 'views'));
  app.set('view engine', 'jade');

  app.use('/model', modelRouter(modelProvider));

  app.get('/', (req, res) => {
    res.redirect('/model');
  });

  return app.listen(port, (err) => {
    if (err) {
      console.log(err);
    }

    console.info(`Server listening on http://0.0.0.0:${port}`);
    callback(err);
  });
};

if (require.main === module) {
  const modelProvider =
    require(path.join(__dirname, 'test', 'fixtures', 'model-provider-simple-mock'));
    // require(path.join(__dirname, 'services', 'model-provider')); TODO
  run()(modelProvider());
}

module.exports = run;
