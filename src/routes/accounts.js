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
    const result = await app.services.account.save(req.body);
    if (result.error) {
      return res.status(400).json(result);
    }
    return res.status(201).json(result[0]);
  };

  return { findAll, get, create };
};
