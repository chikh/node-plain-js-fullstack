'use strict';

/* eslint no-unused-expressions: 0 */
/* global fixture should*/

describe('Autocomplete component', function() {
  afterEach(function() {
    window.autocomplete.destroy();
  });

  var initializeAutocomplete = function(valuesObject) {
    window.autocomplete.initialize(valuesObject);
  };

  var doubleInitializeAutocomplete = function() {
    initializeAutocomplete({
      size: ['41', '42']
    });
    initializeAutocomplete({
      color: ['red', 'green']
    });
  };

  describe('initialization', function() {
    var initializeAutocompleteWithEmptyValues = function() {
      initializeAutocomplete({});
    };

    it('should add onclick handler to each input with .autocomplete',
      function() {
        fixture.load('inputs.html');
        initializeAutocomplete({
          noMatter: []
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
        doubleInitializeAutocomplete();
        $('#autocomplete-component > .autocomplete-option')
          .should.have.lengthOf(4);
      });

      it('should have all provided values ' +
        'with appropriate "collection-key" attributes',
        function() {
          doubleInitializeAutocomplete();
          $('#autocomplete-component > .autocomplete-option')
            .each(function(i) {
              var elem = $(this);
              if (i < 2) {
                elem.should.have.attr('collection-key', 'size');
              } else {
                elem.should.have.attr('collection-key', 'color');
              }
            });
        });
    });
  });

  describe('input onclick', function() {
    it('should show values for this input\'s collection', function() {
      fixture.load('four-inputs.html');
      doubleInitializeAutocomplete();
      $('input#input-1').click();
      var visibleOptions = $('.autocomplete-option:visible');
      visibleOptions.should.have.lengthOf(2);
      visibleOptions.each(function() {
        $(this).should.have.attr('collection-key', 'size');
      });
    });
  });
});
