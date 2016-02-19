'use strict';

const isDeveloping = process.env.NODE_ENV !== 'production';
const port = isDeveloping ? 3333 : process.env.PORT;

const path = require('path');
const express = require('express');
const app = express();

const modelRouter = require(path.join(__dirname, 'routes', 'model'));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use('/model', modelRouter);

app.get('/', (req, res) => {
  res.redirect('/model');
});

const run = cb => {
  if (!cb) {
    cb = () => {};
  }

  return app.listen(port, (err) => {
    if (err) {
      console.log(err);
    }

    console.info(`Server listening on http://0.0.0.0:${port}`);
    cb(err);
  });
};

if (require.main === module) {
  run();
}

module.exports = run;
