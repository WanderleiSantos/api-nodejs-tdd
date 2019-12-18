const request = require('supertest');
const jwt = require('jwt-simple');
const app = require('../../src/app');

const MAIN_ROUTE = '/accounts';
const secret = '45dsa546d5as';
let user;

beforeAll(async () => {
  const res = await app.services.user.save({
    name: 'wanderlei',
    mail: `${Date.now()}@gmail.com`,
    password: '123456',
  });

  user = { ...res[0] };
  user.token = jwt.encode(user, secret);
});

test('Deve inserir uma conta com sucesso', () => {
  return request(app)
    .post(MAIN_ROUTE)
    .send({ name: 'Acc #1', user_id: user.id })
    .set('authorization', `bearer ${user.token}`)
    .then(result => {
      expect(result.status).toBe(201);
      expect(result.body.name).toBe('Acc #1');
    });
});

test('Não Deve inserir uma conta sem Nome', () => {
  return request(app)
    .post(MAIN_ROUTE)
    .set('authorization', `bearer ${user.token}`)
    .send({ user_id: user.id })
    .then(result => {
      expect(result.status).toBe(400);
      expect(result.body.error).toBe('Nome obrigatório');
    });
});

test('Deve listar todas as contas', () => {
  return app
    .db('accounts')
    .insert({ name: 'Acc List', user_id: user.id })
    .then(() =>
      request(app)
        .get(MAIN_ROUTE)
        .set('authorization', `bearer ${user.token}`)
    )
    .then(res => {
      expect(res.status).toBe(200);
      expect(res.body.length).toBeGreaterThan(0);
    });
});

test('Deve retornar uma conta por ID', () => {
  return app
    .db('accounts')
    .insert({ name: 'Acc by id', user_id: user.id }, ['id'])
    .then(acc =>
      request(app)
        .get(`${MAIN_ROUTE}/${acc[0].id}`)
        .set('authorization', `bearer ${user.token}`)
    )
    .then(res => {
      expect(res.status).toBe(200);
      expect(res.body.name).toBe('Acc by id');
      expect(res.body.user_id).toBe(user.id);
    });
});

test('Deve alterar uma conta', () => {
  return app
    .db('accounts')
    .insert({ name: 'Acc to update', user_id: user.id }, ['id'])
    .then(acc =>
      request(app)
        .put(`${MAIN_ROUTE}/${acc[0].id}`)
        .set('authorization', `bearer ${user.token}`)
        .send({ name: 'Acc updated' })
    )
    .then(res => {
      expect(res.status).toBe(200);
      expect(res.body.name).toBe('Acc updated');
    });
});

test('Deve remover uma conta', () => {
  return app
    .db('accounts')
    .insert({ name: 'Acc delete', user_id: user.id }, ['id'])
    .then(acc =>
      request(app)
        .delete(`${MAIN_ROUTE}/${acc[0].id}`)
        .set('authorization', `bearer ${user.token}`)
    )
    .then(res => {
      expect(res.status).toBe(204);
    });
});
