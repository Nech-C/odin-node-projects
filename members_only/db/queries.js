const pool = require("./pool");

async function getUser(first_name, last_name) {
    const { rows } = await pool.query("SELECT * FROM users WHERE first_name = $1 AND last_name = $2", [first_name, last_name]);
    return rows[0];
}

async function insertUser(first_name, last_name, email, password_hash, membership_status = false, is_admin = false) {
    try {
        const { rows } = await pool.query(
            "INSERT INTO users (first_name, last_name, email, password_hash, membership_status, is_admin) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
            [first_name, last_name, email, password_hash, membership_status, is_admin]
        );
        return rows[0];
    } catch (error) {
        console.error("Error inserting user:", error);
        throw error;
    }
}

module.exports = {
    getUser,
    insertUser
};