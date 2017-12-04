
module.exports = {
  up: async (queryInterface, Sequelize, models) => {
    await models.users.create({
      email: 'admin@ysocorp.com',
      password: 'toto',
      usergroup_id: 1,
    });
    await models.users.create({
      email: 'client@ysocorp.com',
      password: 'toto',
      usergroup_id: 2,
      first_name: 'Client FN',
      last_name: 'Client LN',
    });
  },
  down: async (queryInterface, Sequelize, models) => {
    await models.tokens.destroy({
      where: { email: ['admin@ysocorp.com', 'client@ysocorp.com'] },
      force: true,
    });
  },
};
