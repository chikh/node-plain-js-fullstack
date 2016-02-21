'use strict';

module.exports = () => {
  return {
    allModels: () => {
      return [{
        tableName: 'apples',
        fields: {
          size: {
            type: 'integer',
            label: 'Size'
          },
          color: {
            type: 'string',
            label: 'Color name'
          },
          ripeningDate: {
            type: 'date',
            label: 'Date of ripening'
          },
        },
      }, {
        tableName: 'notes',
        fields: {
          text: {
            type: 'string',
            label: 'Text of note'
          },
        }
      }];

    }
  };
};
