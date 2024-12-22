const LocalStrategy = require('passport-local');
const bcrypt = require('bcrypt')
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

    const isMatch = await bcrypt.compare(password, user.password);

    if (isMatch) {
      return cb(null, user);
    }

    cb(null, false, { message: 'Incorrect username or password' });
  } catch (error) {
    cb(error);
  }
});

module.exports = localStrategy;