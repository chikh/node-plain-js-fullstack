'use strict';

module.exports = dataSource => {
  const models = [];
  return {
    allModels: () => models,
    addModel: model => dataSource.createTable(model).then(models.push(model)),
    modelExists: model =>
      models.find(
        existingModel => existingModel.tableName === model.tableName
      ) !== undefined
  };
};
