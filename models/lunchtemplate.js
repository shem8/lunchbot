'use strict';
module.exports = (sequelize, DataTypes) => {
  var LunchTemplate = sequelize.define('LunchTemplate', {
    team: DataTypes.STRING,
    channel: DataTypes.STRING,
    keys: DataTypes.ARRAY(DataTypes.STRING),
    args: DataTypes.STRING,
    canceled: { type: DataTypes.BOOLEAN, defaultValue: false },
  }, {
    classMethods: {
      associate: function(models) {
        models.LunchTemplate.hasMany(models.Lunch);
      }
    }
  });
  return LunchTemplate;
};
