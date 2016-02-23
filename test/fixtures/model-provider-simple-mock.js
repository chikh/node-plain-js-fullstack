'use strict';
const stubber = require(require('path').join(__dirname, 'service-stubber'));

module.exports = () => {
  const service = {
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
            type: 'datetime',
            label: 'Date of ripening'
          }
        }
      }, {
        tableName: 'notes',
        fields: {
          text: {
            type: 'string',
            label: 'Text of note'
          }
        }
      }];
    },
    addModel: () => Promise.resolve('model added with some result'),
    modelExists: model => model.tableName === 'notes'
  };
  return stubber(service);
};
