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
  await app.db('transfers').del();
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
        ammount: 100,
        type: 'I',
        acc_id: accUser.id,
      },
      {
        description: 'T2',
        date: new Date(),
        ammount: 540,
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

test('Deve inserir uma transação com sucesso', () => {
  return request(app)
    .post(MAIN_ROUTE)
    .set('authorization', `bearer ${user.token}`)
    .send({
      description: 'T1 1233',
      date: new Date(),
      ammount: 100,
      type: 'I',
      acc_id: accUser.id,
    })
    .then(res => {
      expect(res.status).toBe(201);
      expect(res.body.acc_id).toBe(accUser.id);
    });
});

test('Transações de entrada devem ser positivas', () => {
  return request(app)
    .post(MAIN_ROUTE)
    .set('authorization', `bearer ${user.token}`)
    .send({
      description: 'New T',
      date: new Date(),
      ammount: -100,
      type: 'I',
      acc_id: accUser.id,
    })
    .then(res => {
      expect(res.status).toBe(201);
      expect(res.body.acc_id).toBe(accUser.id);
      expect(res.body.ammount).toBe('100.00');
    });
});

test('Transações de saida devem ser negativas', () => {
  return request(app)
    .post(MAIN_ROUTE)
    .set('authorization', `bearer ${user.token}`)
    .send({
      description: 'New T',
      date: new Date(),
      ammount: 100,
      type: 'O',
      acc_id: accUser.id,
    })
    .then(res => {
      expect(res.status).toBe(201);
      expect(res.body.acc_id).toBe(accUser.id);
      expect(res.body.ammount).toBe('-100.00');
    });
});

describe('Ao tentar inserir uma transação inválida', () => {
  // Forma 01
  /* let validTransaction;
  beforeAll(() => {
    validTransaction = {
      description: 'New T',
      date: new Date(),
      ammount: 100,
      type: 'I',
      acc_id: accUser.id,
    };
  });
  const testTemplate = (newData, errorMessage) => {
    return request(app)
      .post(MAIN_ROUTE)
      .set('authorization', `bearer ${user.token}`)
      .send({
        ...validTransaction,
        ...newData,
      })
      .then(res => {
        expect(res.status).toBe(400);
        expect(res.body.error).toBe(errorMessage);
      });
  };
  */

  const testTemplate = (newData, errorMessage) => {
    return request(app)
      .post(MAIN_ROUTE)
      .set('authorization', `bearer ${user.token}`)
      .send({
        description: 'New T',
        date: new Date(),
        ammount: 100,
        type: 'I',
        acc_id: accUser.id,
        ...newData,
      })
      .then(res => {
        expect(res.status).toBe(400);
        expect(res.body.error).toBe(errorMessage);
      });
  };

  test('Não deve inserir sem descrição', () =>
    testTemplate({ description: null }, 'Descrição é um atributo obrigatório'));
  test('Não deve inserir sem valor', () =>
    testTemplate({ ammount: null }, 'Valor é um atributo obrigatório'));
  test('Não deve inserir uma transação sem data', () =>
    testTemplate({ date: null }, 'Data é um atributo obrigatório'));
  test('Não deve inserir uma transação sem conta', () =>
    testTemplate({ acc_id: null }, 'Conta é um atributo obrigatório'));
  test('Não deve inserir uma transação sem tipo', () =>
    testTemplate({ type: null }, 'Tipo é um atributo obrigatório'));
  test('Não deve inserir uma transação com tipo inválido', () =>
    testTemplate({ type: 'A' }, 'Tipo inválido'));
});

test('Deve retornar uma transação por ID', () => {
  return app
    .db('transactions')
    .insert(
      {
        description: 'T1 456',
        date: new Date(),
        ammount: 100,
        type: 'I',
        acc_id: accUser.id,
      },
      ['id']
    )
    .then(res =>
      request(app)
        .get(`${MAIN_ROUTE}/${res[0].id}`)
        .set('authorization', `bearer ${user.token}`)
        .then(result => {
          expect(result.status).toBe(200);
          expect(result.body.id).toBe(res[0].id);
          expect(result.body.description).toBe('T1 456');
        })
    );
});

test('Deve alterar uma transação', () => {
  return app
    .db('transactions')
    .insert(
      {
        description: 'T UPD',
        date: new Date(),
        ammount: 100,
        type: 'I',
        acc_id: accUser.id,
      },
      ['id']
    )
    .then(res =>
      request(app)
        .put(`${MAIN_ROUTE}/${res[0].id}`)
        .send({ description: 'UPD' })
        .set('authorization', `bearer ${user.token}`)
        .then(result => {
          expect(result.status).toBe(200);
          expect(result.body.description).toBe('UPD');
        })
    );
});

test('Deve remover uma transação', () => {
  return app
    .db('transactions')
    .insert(
      {
        description: 'T RMV',
        date: new Date(),
        ammount: 100,
        type: 'I',
        acc_id: accUser.id,
      },
      ['id']
    )
    .then(res =>
      request(app)
        .delete(`${MAIN_ROUTE}/${res[0].id}`)
        .set('authorization', `bearer ${user.token}`)
        .then(result => {
          expect(result.status).toBe(204);
        })
    );
});

test('Não Deve remover uma transação de outro usuário', () => {
  return app
    .db('transactions')
    .insert(
      {
        description: 'T RMV O',
        date: new Date(),
        ammount: 100,
        type: 'I',
        acc_id: accUser2.id,
      },
      ['id']
    )
    .then(res =>
      request(app)
        .delete(`${MAIN_ROUTE}/${res[0].id}`)
        .set('authorization', `bearer ${user.token}`)
        .then(result => {
          expect(result.status).toBe(403);
          expect(result.body.error).toBe('Pertence a outro usuário');
        })
    );
});

test('Não Deve remover uma conta com transação', () => {
  return app
    .db('transactions')
    .insert(
      {
        description: 'T RMV6',
        date: new Date(),
        ammount: 100,
        type: 'I',
        acc_id: accUser.id,
      },
      ['id']
    )
    .then(() =>
      request(app)
        .delete(`/v1/accounts/${accUser.id}`)
        .set('authorization', `bearer ${user.token}`)
        .then(result => {
          expect(result.status).toBe(400);
          expect(result.body.error).toBe('Possui transações');
        })
    );
});
