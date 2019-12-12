const request = require('supertest');
const app = require('../../src/app');

test('Deve receber token ao logar', () => {
  const mail = `${Date.now()}@gmail.com`;
  return app.services.user
    .save({ name: 'Wanderlei', mail, password: '123456' })
    .then(() =>
      request(app)
        .post('/auth/signin')
        .send({ mail, password: '123456' })
    )
    .then(res => {
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('token');
    });
});

test('Não deve autenticar usuário com senha errada', () => {
  const mail = `${Date.now()}@gmail.com`;
  return app.services.user
    .save({ name: 'Wanderlei', mail, password: '123456' })
    .then(() =>
      request(app)
        .post('/auth/signin')
        .send({ mail, password: '1234567' })
    )
    .then(res => {
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Usuário ou senha errados');
    });
});

test('Não deve autenticar usuário não cadastrado', () => {
  return request(app)
    .post('/auth/signin')
    .send({ mail: 'dsadas@dsadas.com', password: '1234567' })
    .then(res => {
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Usuário ou senha errados');
    });
});
