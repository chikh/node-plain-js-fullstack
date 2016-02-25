'use strict';

/* eslint no-unused-expressions: 1*/

const path = require('path');
const chai = require('chai');
chai.should();
chai.use(require('sinon-chai'));
const supertest = require('supertest');
const serverRunner = require(path.join(__dirname, '..', 'server'));
const guid = require('aguid');

describe('Server', () => {
  let dataSourceStub;
  let modelProviderMock;
  let server;

  beforeEach(done => {
    modelProviderMock =
      require(path.join(__dirname, 'fixtures', 'model-provider-simple-mock'))();
    dataSourceStub =
      require(path.join(__dirname, 'fixtures', 'data-source-stub'))();
    server = serverRunner(done, 3737)(modelProviderMock, dataSourceStub);
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

    const sendModelFile = fileName => {
      return supertest(server)
        .post('/model')
        .attach('modelFile', path.join(__dirname, 'fixtures', fileName));
    };

    it('should try to add a new model description by POST /model', done => {
      sendModelFile('car-model.json')
        .expect(302).end(err => {
          if (err) {
            done(err);
          }
          modelProviderMock.addModel.should.have.been.calledOnce;
          modelProviderMock.addModel.should.have.been
            .calledWith(
              require(path.join(__dirname, 'fixtures', 'car-model.json'))
            );
        });
      done();
    });

    it('should respond with 409 if model already exists', done => {
      sendModelFile('notes-model.txt').expect(409).end(done);
    });
  });

  describe('The data path', () => {
    it('should save grid data', done => {
      const rowId1 = guid();
      const rowId2 = guid();
      const previousData = [{
        columnId: 'size',
        rowId: rowId1,
        value: 42
      }, {
        columnId: 'color',
        rowId: rowId1,
        value: null
      }, {
        columnId: 'color',
        rowId: rowId2,
        value: null
      }, {
        columnId: 'size',
        rowId: rowId2,
        value: null
      }];
      const incomingPayload = [{
        columnId: 'size',
        rowId: rowId1,
        value: 42
      }, {
        columnId: 'color',
        rowId: rowId1,
        value: 'red'
      }, {
        columnId: 'color',
        rowId: rowId2,
        value: 'green'
      }];

      supertest(server)
        .put('/model/apples')
        .set('Content-Type', 'application/json; charset=UTF-8')
        .send({
          nextState: incomingPayload,
          previousState: previousData
        })
        .expect(200).end(err => {
          dataSourceStub.saveData.should.be.calledWith({
            modelName: 'apples',
            nextState: incomingPayload,
            previousState: previousData
          });
          done(err);
        });
    });
  });
});
