'use strict';

module.exports = {
  allModels: () => {
    return [{
      tableName: 'apples',
      fields: {
        size: 'integer',
        color: 'string',
        ripeningDate: 'date',
      },
    }, {
      tableName: 'notes',
      fields: {
        text: 'string',
      }
    }];
  },
};
