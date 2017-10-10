'use strict';
module.exports = (sequelize, DataTypes) => {
  var User = sequelize.define('User', {
    user: DataTypes.STRING,
  }, {
    classMethods: {
      associate: function(models) {
        models.User.belongsTo(models.Lunch);
      }
    }
  });
  return User;
};
