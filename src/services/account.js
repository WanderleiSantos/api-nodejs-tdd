const ValidationError = require('../errors/ValidationError');

module.exports = app => {
  const findAll = () => {
    return app.db('accounts').select();
  };

  const find = (filter = {}) => {
    return app
      .db('accounts')
      .where(filter)
      .first();
  };

  const save = async account => {
    if (!account.name) throw new ValidationError('Nome obrigatório');

    return app.db('accounts').insert(account, '*');
  };

  const update = async (id, account) => {
    return app
      .db('accounts')
      .where({ id })
      .update(account, '*');
  };

  const remove = id => {
    return app
      .db('accounts')
      .where({ id })
      .del();
  };

  return { findAll, find, save, update, remove };
};
