module.exports = {
  test: {
    client: 'pg',
    version: '9,6',
    connection: {
      host: '127.0.0.1',
      user: 'postgres',
      password: 'z0612c',
      database: 'barriga',
      port: '5432',
    },
    migrations: {
      directory: 'src/migrations',
    },
  },
};
