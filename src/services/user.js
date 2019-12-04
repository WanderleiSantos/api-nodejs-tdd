module.exports = app => {
  const findAll = (filter = {}) => {
    return app
      .db('users')
      .where(filter)
      .select();
  };

  const save = async user => {
    if (!user.name) {
      return { error: 'Nome obrigatório' };
    }

    if (!user.mail) {
      return { error: 'Email obrigatorio' };
    }

    if (!user.password) {
      return { error: 'Senha obrigatorio' };
    }

    const userDb = await findAll({ mail: user.mail });
    if (userDb && userDb.length > 0) {
      return { error: 'Email já cadastrado' };
    }

    return app.db('users').insert(user, '*');
  };

  return { findAll, save };
};
