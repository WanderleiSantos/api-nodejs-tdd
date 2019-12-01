const request = require('supertest');

const app = require('../../src/app');

test('Deve listar todos os usuários', () => {
  return request(app)
    .get('/users')
    .then(res => {
      expect(res.status).toBe(200);
    });
});

test('Deve inserir um usuário', () => {
  const mail = `${Date.now()}@gmail.com`;
  return request(app)
    .post('/users')
    .send({
      name: 'Wanderlei',
      mail,
      password: '123456',
    })
    .then(res => {
      expect(res.status).toBe(201);
      expect(res.body.name).toBe('Wanderlei');
    });
});

test('Não deve inserir usuário sem Nome', () => {
  const mail = `${Date.now()}@gmail.com`;
  return request(app)
    .post('/users')
    .send({
      mail,
      password: '123456',
    })
    .then(res => {
      expect(res.status).toBe(400);
    });
});
