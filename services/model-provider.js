'use strict';

module.exports = () => {
  const models = [];
  return {
    allModels: () => models,
    addModel: model => models.push(model)
  };
};
