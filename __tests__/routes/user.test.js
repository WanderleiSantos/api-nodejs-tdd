const request = require('supertest');
const jwt = require('jwt-simple');
const app = require('../../src/app');

const mail = `${Date.now()}@gmail.com`;
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

test('Deve listar todos os usuários', () => {
  return request(app)
    .get('/v1/users')
    .set('authorization', `bearer ${user.token}`)
    .then(res => {
      expect(res.status).toBe(200);
    });
});

test('Deve inserir um usuário', () => {
  return request(app)
    .post('/v1/users')
    .set('authorization', `bearer ${user.token}`)
    .send({
      name: 'Wanderlei',
      mail,
      password: '123456',
    })
    .then(res => {
      expect(res.status).toBe(201);
      expect(res.body.name).toBe('Wanderlei');
      expect(res.body).not.toHaveProperty('password');
    });
});

test('Deve armazenar a senha criptografada', async () => {
  const res = await request(app)
    .post('/v1/users')
    .set('authorization', `bearer ${user.token}`)
    .send({
      name: 'Teste',
      mail: `${Date.now()}@gmail.com`,
      password: '123456',
    });
  expect(res.status).toBe(201);

  const { id } = res.body;
  const userDB = await app.services.user.findOne({ id });
  expect(userDB.password).not.toBeUndefined();
  expect(userDB.password).not.toBe('123456');
});

test('Não deve inserir usuário sem Nome', () => {
  return request(app)
    .post('/v1/users')
    .set('authorization', `bearer ${user.token}`)
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
    .post('/v1/users')
    .set('authorization', `bearer ${user.token}`)
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
    .post('/v1/users')
    .set('authorization', `bearer ${user.token}`)
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
