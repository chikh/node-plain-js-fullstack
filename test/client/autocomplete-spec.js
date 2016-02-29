'use strict';

/* eslint no-unused-expressions: 0 */
/* global fixture should*/

describe('Autocomplete component', function() {
  afterEach(function() {
    window.autocomplete.destroy();
  });

  describe('initialization', function() {
    var initializeAutocomplete = function(valuesObject) {
      window.autocomplete.initialize(function() {
        return valuesObject;
      });
    };

    var initializeAutocompleteWithEmptyValues = function() {
      initializeAutocomplete({});
    };

    it('should add onclick handler to each input with .autocomplete',
      function() {
        fixture.load('inputs.html');
        initializeAutocompleteWithEmptyValues();
        should.exist(
          $._data(document.getElementById('input1'), 'events').click
        );
        should.exist(
          $._data(document.getElementById('input2'), 'events').click
        );
        should.not.exist($._data(document.getElementById('input3'), 'events'));
      }
    );

    var autocomplete = function() {
      return $('#autocomplete-component');
    };

    it('should create invisible component', function() {
      initializeAutocompleteWithEmptyValues();
      autocomplete().should.exist;
      autocomplete().should.be.invisible;
    });

    it('should create the only component', function() {
      initializeAutocompleteWithEmptyValues();
      initializeAutocompleteWithEmptyValues();
      $('.autocomplete-component').should.have.lengthOf(1);
    });

    describe('created component', function() {
      it('should have all the values provided', function() {
        initializeAutocomplete({
          size: ['41', '42']
        });
        initializeAutocomplete({
          color: ['red', 'green']
        });

        var options = $('#autocomplete-component > .autocomplete-option');
        options.should.have.lengthOf(4);
      });
    });
  });

  describe.skip('autocomplete input onclick', function() {});
});
