const db = require("../db/queries")

async function getUsernames(req, res) {
    const usernames = await db.getAllUsernames();
    names = usernames.map(username => username.username);
    console.log("Usernames: ", names);
    res.render("index", {title: "Usernames", usernames: names});
}

async function createUsernameGet(req, res) {
    res.render("new", {title: "New User"});
}

async function createUsernamePost(req, res) {
    const { username } = req.body;
    console.log("Creating new username: ", username);
    await db.insertUsername(username);
    res.redirect("/");
}

module.exports = {
    getUsernames,
    createUsernameGet,
    createUsernamePost,
};