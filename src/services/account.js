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
    return app.db('accounts').insert(account, '*');
  };

  return { findAll, find, save };
};
