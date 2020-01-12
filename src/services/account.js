const ValidationError = require('../errors/ValidationError');

module.exports = app => {
  const findAll = user_id => {
    return app
      .db('accounts')
      .select()
      .where({ user_id });
  };

  const find = (filter = {}) => {
    return app
      .db('accounts')
      .where(filter)
      .first();
  };

  const save = async account => {
    if (!account.name) throw new ValidationError('Nome obrigatório');

    const accDb = await find({ name: account.name, user_id: account.user_id });
    if (accDb) throw new ValidationError('Já existe');

    return app.db('accounts').insert(account, '*');
  };

  const update = async (id, account) => {
    return app
      .db('accounts')
      .where({ id })
      .update(account, '*');
  };

  const remove = async id => {
    const transaction = await app.services.transactions.findOne({ acc_id: id });

    if (transaction) throw new ValidationError('Possui transações');
    return app
      .db('accounts')
      .where({ id })
      .del();
  };

  return { findAll, find, save, update, remove };
};
