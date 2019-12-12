const bcrypt = require('bcrypt-nodejs');
const ValidationError = require('../errors/ValidationError');

module.exports = app => {
  const findAll = () => {
    return app.db('users').select(['id', 'name', 'mail']);
  };

  const findOne = (filter = {}) => {
    return app
      .db('users')
      .where(filter)
      .first();
  };

  const getPassHash = password => {
    const salt = bcrypt.genSaltSync(10);
    return bcrypt.hashSync(password, salt);
  };

  const save = async user => {
    if (!user.name) throw new ValidationError('Nome obrigatório');

    if (!user.mail) throw new ValidationError('Email obrigatorio');

    if (!user.password) throw new ValidationError('Senha obrigatorio');

    const userDb = await findOne({ mail: user.mail });
    if (userDb) throw new ValidationError('Email já cadastrado');

    const newUser = { ...user };
    newUser.password = getPassHash(user.password);
    return app.db('users').insert(newUser, ['id', 'name', 'mail']);
  };

  return { findAll, save, findOne };
};
