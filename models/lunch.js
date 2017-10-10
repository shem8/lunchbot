'use strict';
module.exports = (sequelize, DataTypes) => {
  var Lunch = sequelize.define('Lunch', {
    finished: { type: DataTypes.BOOLEAN, defaultValue: false },
  }, {
    classMethods: {
      associate: function(models) {
        models.Lunch.belongsTo(models.LunchTemplate);
        models.Lunch.hasMany(models.User);
      }
    }
  });
  return Lunch;
};
