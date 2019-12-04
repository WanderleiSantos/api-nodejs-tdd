const request = require('supertest');

const app = require('../../src/app');

const mail = `${Date.now()}@gmail.com`;

test('Deve listar todos os usuários', () => {
  return request(app)
    .get('/users')
    .then(res => {
      expect(res.status).toBe(200);
    });
});

test('Deve inserir um usuário', () => {
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

test('Não deve inserir usuário sem email', async () => {
  const result = await request(app)
    .post('/users')
    .send({ name: 'Wanderlei', password: '123456' });

  expect(result.status).toBe(400);
  expect(result.body.error).toBe('Email obrigatorio');
});

// test('Não deve inserir usuário sem senha', () => {
//   request(app)
//     .post('/users')
//     .send({ name: 'Wanderlei', mail: 'w@w.com' })
//     .then(res => {
//       expect(res.status).toBe(400);
//       expect(res.body.error).toBe('Senha obrigatorio');
//       done();
//     });
// });

test('Não deve inserir usuário com email cadastrado', () => {
  return request(app)
    .post('/users')
    .send({
      name: 'Wanderlei',
      mail,
      password: '123456',
    })
    .then(res => {
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Email já cadastrado');
    });
});
