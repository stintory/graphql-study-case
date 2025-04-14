import pkg from 'pg';
const { Pool } = pkg;

export const pool = new Pool({
    user:'root',
    host: 'localhost',
    database: 'test_db',
    password: 'password',
    port: 5432,
})

