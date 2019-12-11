module.exports = app => {
  const findAll = async (req, res) => {
    const accounts = await app.services.account.findAll();
    return res.status(200).json(accounts);
  };

  const get = async (req, res) => {
    const account = await app.services.account.find({ id: req.params.id });
    return res.status(200).json(account);
  };

  const create = async (req, res) => {
    try {
      const result = await app.services.account.save(req.body);
      return res.status(201).json(result[0]);
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  };

  const update = async (req, res) => {
    const result = await app.services.account.update(req.params.id, req.body);

    return res.status(200).json(result[0]);
  };

  const remove = async (req, res) => {
    await app.services.account.remove(req.params.id);
    return res.status(204).send();
  };

  return { findAll, get, create, update, remove };
};
