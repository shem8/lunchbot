module.exports = (models) => {
  models.Lunch.belongsTo(models.LunchTemplate);
  models.Lunch.hasMany(models.User);
  models.LunchTemplate.hasMany(models.Lunch);
  models.User.belongsTo(models.Lunch);
};
