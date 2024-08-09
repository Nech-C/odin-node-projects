const { Pool } = require("pg");

module.exports = new Pool({
    host: "localhost",
    user: "nech",
    database: "top_users",
    password: "1234567",
    port: 5432
});