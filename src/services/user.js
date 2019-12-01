module.exports = app => {
  const findAll = () => {
    return app.db('users').select();
  };

  const save = user => {
    if (!user.name) {
      return { error: 'Nome obrigatório' };
    }
    return app.db('users').insert(user, '*');
  };

  return { findAll, save };
};
