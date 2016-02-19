'use strict';

const path = require('path');
const chai = require('chai');
chai.should();
const supertest = require('supertest');
const serverRunner = require(path.join(__dirname, '..', 'server'));

describe('Server', () => {
  let server;

  beforeEach((done) => {
    server = serverRunner(done);
  });

  afterEach((done) => {
    server.close(done);
  });

  it('should redirect to /model if GET /', (done) => {
    supertest(server).get('/').expect(302).end(done);
  });

  it('should respond with 404 if path doesn\'t exist', (done) => {
    supertest(server).get('/path/doesnt/exist').expect(404).end(done);
  });
});
