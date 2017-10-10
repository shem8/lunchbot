'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Lunches', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      team: {
        type: Sequelize.STRING
      },
      channel: {
        type: Sequelize.STRING
      },
      finished: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      date: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      keys: {
        type: Sequelize.ARRAY(Sequelize.STRING),
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Lunches');
  }
};
