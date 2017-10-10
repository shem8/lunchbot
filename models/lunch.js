'use strict';
module.exports = (sequelize, DataTypes) => {
  var Lunch = sequelize.define('Lunch', {
    finished: { type: DataTypes.BOOLEAN, defaultValue: false },
  }, {
    classMethods: {
      associate: function(models) {
      }
    }
  });
  return Lunch;
};
