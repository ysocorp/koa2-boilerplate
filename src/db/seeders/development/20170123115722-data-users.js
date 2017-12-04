
module.exports = {
  up: async (queryInterface, Sequelize, models) => {
    await models.users.create({
      email: 'admin@ysocorp.com',
      password: 'Admin9!',
      usergroup_id: 1,
    });
    await models.users.create({
      email: 'client@ysocorp.com',
      password: 'Client9!',
      usergroup_id: 2,
      first_name: 'Jean-Claude',
      last_name: 'YALAP',
    });
  },
  down: async (queryInterface, Sequelize, models) => {
    await models.tokens.destroy({
      where: { email: ['admin@ysocorp.com', 'client@ysocorp.com'] },
      force: true,
    });
  },
};
