const request = require('supertest');
const jwt = require('jwt-simple');
const app = require('../../src/app');

const MAIN_ROUTE = '/v1/accounts';
const secret = '45dsa546d5as';
let user;
let user2;

beforeEach(async () => {
  const res = await app.services.user.save({
    name: 'wanderlei',
    mail: `${Date.now()}@gmail.com`,
    password: '123456',
  });

  user = { ...res[0] };
  user.token = jwt.encode(user, secret);

  const res2 = await app.services.user.save({
    name: 'wanderlei 2',
    mail: `${Date.now()}@gmail.com`,
    password: '123456',
  });

  user2 = { ...res2[0] };
});

test('Deve inserir uma conta com sucesso', () => {
  return request(app)
    .post(MAIN_ROUTE)
    .send({ name: 'Acc #1' })
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
    .send({})
    .then(result => {
      expect(result.status).toBe(400);
      expect(result.body.error).toBe('Nome obrigatório');
    });
});

// test('Deve listar todas as contas', () => {
//   return app
//     .db('accounts')
//     .insert({ name: 'Acc List', user_id: user.id })
//     .then(() =>
//       request(app)
//         .get(MAIN_ROUTE)
//         .set('authorization', `bearer ${user.token}`)
//     )
//     .then(res => {
//       expect(res.status).toBe(200);
//       expect(res.body.length).toBeGreaterThan(0);
//     });
// });

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

test('Deve listar apenas as contas do usuário', async () => {
  await app.db('transactions').del();
  await app.db('transfers').del();
  await app.db('accounts').del();
  // await app.db('users').del();
  return app
    .db('accounts')
    .insert([
      { name: 'Acc User #1', user_id: user.id },
      { name: 'Acc User #2', user_id: user2.id },
    ])
    .then(() =>
      request(app)
        .get(MAIN_ROUTE)
        .set('authorization', `bearer ${user.token}`)
        .then(res => {
          expect(res.status).toBe(200);
          expect(res.body.length).toBe(1);
          expect(res.body[0].name).toBe('Acc User #1');
        })
    );
});

test('Não deve inserir uma conta de nome duplicado para o mesmo usuário', () => {
  return app
    .db('accounts')
    .insert({ name: 'acc duplicada 1', user_id: user.id })
    .then(() =>
      request(app)
        .post(MAIN_ROUTE)
        .set('authorization', `bearer ${user.token}`)
        .send({ name: 'acc duplicada 1' })
    )
    .then(res => {
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Já existe');
    });
});

test('Não deve retornar uma conta de outro usuário', () => {
  return app
    .db('accounts')
    .insert({ name: 'acc user #2', user_id: user2.id }, ['id'])
    .then(acc =>
      request(app)
        .get(`${MAIN_ROUTE}/${acc[0].id}`)
        .set('authorization', `bearer ${user.token}`)
    )
    .then(res => {
      expect(res.status).toBe(403);
      expect(res.body.error).toBe('Pertence a outro usuário');
    });
});

test('Não deve alterar uma conta de outro usuário', () => {
  return app
    .db('accounts')
    .insert({ name: 'acc user #2 alt', user_id: user2.id }, ['id'])
    .then(acc =>
      request(app)
        .put(`${MAIN_ROUTE}/${acc[0].id}`)
        .send({ name: 'acc duplicada 1' })
        .set('authorization', `bearer ${user.token}`)
    )
    .then(res => {
      expect(res.status).toBe(403);
      expect(res.body.error).toBe('Pertence a outro usuário');
    });
});

test('Não deve remover uma conta de outro usuário', () => {
  return app
    .db('accounts')
    .insert({ name: 'acc user #2 alt', user_id: user2.id }, ['id'])
    .then(acc =>
      request(app)
        .delete(`${MAIN_ROUTE}/${acc[0].id}`)
        .set('authorization', `bearer ${user.token}`)
    )
    .then(res => {
      expect(res.status).toBe(403);
      expect(res.body.error).toBe('Pertence a outro usuário');
    });
});
