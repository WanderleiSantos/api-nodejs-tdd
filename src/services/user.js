const ValidationError = require('../errors/ValidationError');

module.exports = app => {
  const findAll = (filter = {}) => {
    return app
      .db('users')
      .where(filter)
      .select();
  };

  const save = async user => {
    if (!user.name) throw new ValidationError('Nome obrigatório');

    if (!user.mail) throw new ValidationError('Email obrigatorio');

    if (!user.password) throw new ValidationError('Senha obrigatorio');

    const userDb = await findAll({ mail: user.mail });
    if (userDb && userDb.length > 0)
      throw new ValidationError('Email já cadastrado');

    return app.db('users').insert(user, '*');
  };

  return { findAll, save };
};
