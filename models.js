const Sequelize = require('sequelize');
const sequelize = new Sequelize(process.env.DATABASE_URL);
// const sequelize = new Sequelize({
//         "username": "smbjtrlrzpewae",
//         "password": "1e5a83e317065456cb66e3bcbc6fd46c8243f79f7bb09eb990ec844578746734",
//         "database": "d8pdud1dpo72hf",
//         "host": "ec2-23-23-248-162.compute-1.amazonaws.com",
//         "port": "5432",
//         "dialect":"postgres",
//         "ssl": true,
//         "dialectOptions": {
//             "ssl": true
//         }});

const Lunch = sequelize.define('lunch', {
  team: Sequelize.STRING,
  channel: Sequelize.STRING,
  finished: { type: Sequelize.BOOLEAN, defaultValue: false },
  date: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
});

const User = sequelize.define('user', {
  user: Sequelize.STRING,
});

User.belongsTo(Lunch);
Lunch.hasMany(User);

module.exports.lunch = Lunch;
module.exports.user = User;
