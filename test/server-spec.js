'use strict';

/* eslint no-unused-expressions: 1*/

const path = require('path');
const chai = require('chai');
chai.should();
chai.use(require('sinon-chai'));
const supertest = require('supertest');
const serverRunner = require(path.join(__dirname, '..', 'server'));
let modelProviderMock;

describe('Server', () => {
  let server;

  beforeEach(done => {
    modelProviderMock =
      require(path.join(__dirname, 'fixtures', 'model-provider-simple-mock'))();
    server = serverRunner(done, 3737)(modelProviderMock);
  });

  afterEach(done => {
    server.close(done);
  });

  describe('General behavior', () => {
    it('should redirect to /model if GET /', done => {
      supertest(server).get('/').expect(302).end(done);
    });

    it('should respond with 404 if path doesn\'t exist', done => {
      supertest(server).get('/path/doesnt/exist').expect(404).end(done);
    });
  });

  describe('The model path', () => {
    it('should return models grid view by GET /model', done => {
      supertest(server).get('/model')
        .expect('Content-type', 'text/html; charset=utf-8')
        .expect(200)
        .end(done);
    });

    it('should try to add a new model description by POST /model', done => {
      supertest(server)
        .post('/model')
        .attach('modelFile', path.join(__dirname, 'fixtures', 'car-model.txt'))
        .expect(302).end(err => {
          if (err) {
            done(err);
          }
          modelProviderMock.addModel.should.have.been.calledOnce;
          modelProviderMock.addModel.should.have.been.calledWith({
            tableName: 'cars',
            fields: {
              model: {
                type: 'string',
                label: 'Model name'
              },
              yearOfProduction: {
                type: 'integer',
                label: 'Year of production'
              },
              buyDay: {
                type: 'date',
                label: 'Date of buy'
              }
            }
          });
        });
      done();
    });

    it.skip('should respond with 409 if model already exists');
  });
});
