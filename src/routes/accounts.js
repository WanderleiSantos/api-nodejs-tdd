const express = require('express');
const RecIndevido = require('../errors/RecursoIndevidoError');

module.exports = app => {
  const router = express.Router();

  router.param('id', (req, res, next) => {
    app.services.account
      .find({ id: req.params.id })
      .then(acc => {
        if (acc.user_id !== req.user.id) throw new RecIndevido();
        else next();
      })
      .catch(err => next(err));
  });

  router.get('/', async (req, res) => {
    const accounts = await app.services.account.findAll(req.user.id);
    return res.status(200).json(accounts);
  });

  router.get('/:id', async (req, res) => {
    const account = await app.services.account.find({ id: req.params.id });
    // if (account.user_id !== req.user.id) {
    //   return res.status(403).json({
    //     error: 'Pertence a outro usuário',
    //   });
    // }
    return res.status(200).json(account);
  });

  router.post('/', async (req, res, next) => {
    try {
      const result = await app.services.account.save({
        ...req.body,
        user_id: req.user.id,
      });
      return res.status(201).json(result[0]);
    } catch (err) {
      return next(err);
    }
  });

  router.put('/:id', async (req, res) => {
    const result = await app.services.account.update(req.params.id, req.body);

    return res.status(200).json(result[0]);
  });

  router.delete('/:id', async (req, res) => {
    await app.services.account.remove(req.params.id);
    return res.status(204).send();
  });

  return router;
};
