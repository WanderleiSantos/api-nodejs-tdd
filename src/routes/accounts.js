const express = require('express');

module.exports = app => {
  const router = express.Router();

  router.get('/', async (req, res) => {
    const accounts = await app.services.account.findAll();
    return res.status(200).json(accounts);
  });

  router.get('/:id', async (req, res) => {
    const account = await app.services.account.find({ id: req.params.id });
    return res.status(200).json(account);
  });

  router.post('/', async (req, res, next) => {
    try {
      const result = await app.services.account.save(req.body);
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
