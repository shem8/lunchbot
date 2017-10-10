'use strict';
module.exports = (sequelize, DataTypes) => {
  var Lunch = sequelize.define('Lunch', {
    team: DataTypes.STRING,
    channel: DataTypes.STRING,
    finished: { type: DataTypes.BOOLEAN, defaultValue: false },
    date: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    keys: DataTypes.ARRAY(DataTypes.STRING),
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });
  return Lunch;
};
