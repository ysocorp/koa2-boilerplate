module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('usergroups', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW'),
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW'),
      },
      deleted_at: {
        type: Sequelize.DATE,
      },
    });
    return queryInterface.bulkInsert('usergroups', [
      { id: 1, name: 'Admin' },
      { id: 2, name: 'Client' },
    ], {});
  },
  down: (queryInterface, Sequelize) => { // eslint-disable-line no-unused-vars
    return queryInterface.dropTable('usergroups');
  },
};
