const { Pool } = require('pg');

module.exports = new Pool({
    host: 'localhost',
    user: 'nech',
    database: 'membersonly',
    password: '1234567',
    port: 5432
});