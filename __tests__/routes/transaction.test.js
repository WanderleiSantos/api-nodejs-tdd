const request = require('supertest');
const jwt = require('jwt-simple');
const app = require('../../src/app');

const MAIN_ROUTE = '/v1/transactions';
let user;
let user2;
let accUser;
let accUser2;

beforeAll(async () => {
  await app.db('transactions').del();
  await app.db('accounts').del();
  await app.db('users').del();

  const users = await app.db('users').insert(
    [
      {
        name: 'User #1',
        mail: 'user1@gmail.com',
        password:
          '$2a$10$VHij24eKRPAweus5K.yrsu80gD3wBn7uY0iD7Cul3cYin5sc3i5tm',
      },
      {
        name: 'User #2',
        mail: 'user2@gmail.com',
        password:
          '$2a$10$VHij24eKRPAweus5K.yrsu80gD3wBn7uY0iD7Cul3cYin5sc3i5tm',
      },
    ],
    '*'
  );

  [user, user2] = users;
  delete user.password;
  user.token = jwt.encode(user, '45dsa546d5as');
  const accs = await app.db('accounts').insert(
    [
      { name: 'Acc #1', user_id: user.id },
      { name: 'Acc #2', user_id: user2.id },
    ],
    '*'
  );
  [accUser, accUser2] = accs;
});

test('Deve retornar apenas as transações do usuário', () => {
  return app
    .db('transactions')
    .insert([
      {
        description: 'T1',
        date: new Date(),
        amount: 100,
        type: 'I',
        acc_id: accUser.id,
      },
      {
        description: 'T2',
        date: new Date(),
        amount: 540,
        type: 'I',
        acc_id: accUser2.id,
      },
    ])
    .then(() =>
      request(app)
        .get(MAIN_ROUTE)
        .set('authorization', `bearer ${user.token}`)
        .then(res => {
          expect(res.status).toBe(200);
          expect(res.body).toHaveLength(1);
          expect(res.body[0].description).toBe('T1');
        })
    );
});
