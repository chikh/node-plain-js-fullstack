'use strict';

const path = require('path');
const isNotModule = require.main === module;

const run = (callback, port) => (modelProvider, dataSource) => {
  if (!callback) {
    callback = () => {};
  }

  if (!port) {
    port = 3333;
  }

  if (!modelProvider) {
    throw new Error('modelProvider is required');
  }

  const isDeveloping = process.env.NODE_ENV !== 'production';
  port = isDeveloping ? port : process.env.PORT;

  const express = require('express');
  const app = express();
  const bodyParser = require('body-parser');

  app.use(bodyParser.json());
  app.use(express.static(path.join(__dirname, 'public')));
  app.use(
    express.static(path.join(__dirname, 'node_modules', 'lodash'))
  );

  const modelRouter = require(path.join(__dirname, 'routes', 'model'));
  const dataRouter = require(path.join(__dirname, 'routes', 'data'));

  app.set('views', path.join(__dirname, 'views'));
  app.set('view engine', 'jade');

  app.use('/model', modelRouter(modelProvider));
  app.use('/model', dataRouter(modelProvider, dataSource));

  app.get('/', (req, res) => {
    res.redirect('/model');
  });

  return app.listen(port, err => {
    if (err) {
      console.log(err);
    }

    if (isNotModule) {
      console.info(`Server listening on http://0.0.0.0:${port}`);
    }

    callback(err);
  });
};

if (isNotModule) {
  const modelProvider =
    require(path.join(__dirname, 'services', 'model-provider'));
  const dataSource =
    require(path.join(__dirname, 'services', 'data-source'))();
  run()(modelProvider(dataSource), dataSource);
}

module.exports = run;
