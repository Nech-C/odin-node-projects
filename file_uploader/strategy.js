const LocalStrategy = require('passport-local');
let { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient()

const localStrategy = new LocalStrategy(async function verify(username, password, cb) {
  try{
    const user = await prisma.user.findUnique({
      where: {
        username: username
      }
    });

    if (!user) {
      return cb(null, false, { message: 'Incorrect username or password' });
    }

    if (user.password === password) {
      return cb(null, user);
    }
  } catch (error) {
    cb(error);
  }
});

module.exports = localStrategy;