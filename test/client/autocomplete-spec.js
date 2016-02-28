'use strict';

/* eslint no-unused-expressions: 0 */
/* global fixture should*/

describe('Autocomplete component', function() {
  describe('initialization', function() {
    it('should add onclick handler to each input with .autocomplete',
      function() {
        fixture.load('inputs.html');
        window.autocomplete.initialize(function() {
          return [];
        });
        should.exist(
          $._data(document.getElementById('input1'), 'events').click
        );
        should.exist(
          $._data(document.getElementById('input2'), 'events').click
        );
        should.not.exist($._data(document.getElementById('input3'), 'events'));
      }
    );

    it('should create invisible dropdown with values', function() {
      window.autocomplete.initialize(function() {
        return ['value1', 'value2', 'value3'];
      });
      $('#autocomplete-component').should.exist;
      $('#autocomplete-component').should.be.invisible;
    });
  });

  describe.skip('autocomplete input onclick', function() {
  });
});
