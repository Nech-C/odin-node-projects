require('dotenv').config();
const { describe, expect, test, beforeAll, afterAll, beforeEach, afterEach } = require('@jest/globals');
const { PrismaClient } = require('@prisma/client');
const request = require('supertest');
const app = require('../../app');

let prisma;
let createdUserIds = [];
let createdFolderIds = [];

beforeAll(async () => {
  prisma = new PrismaClient();
  await prisma.$connect();
});

afterAll(async () => {
  await prisma.$disconnect();
});

beforeEach(() => {
  createdUserIds = [];
  createdFolderIds = [];
});

afterEach(async () => {
  // Delete specific folders
  for (const folderId of createdFolderIds) {
    await prisma.folder.delete({ where: { id: folderId } }).catch(() => {});
  }

  // Delete specific users
  for (const userId of createdUserIds) {
    await prisma.user.delete({ where: { id: userId } }).catch(() => {});
  }
});

describe('Test user APIs', () => {
  test('register new user', async () => {
    const response = await request(app)
      .post('/user/signup')
      .send({ username: 'Alice24', password: 'alice12345' });

    expect(response.text).toEqual('User create!');

    const createdUser = await prisma.user.findUnique({
      where: { username: 'Alice24' },
    });
    expect(createdUser).not.toBeNull();

    // Track created user
    createdUserIds.push(createdUser.id);

    const rootFolder = await prisma.folder.findUnique({
      where: { id: createdUser.rootFolderId },
    });
    expect(rootFolder).not.toBeNull();

    // Track created folder
    createdFolderIds.push(rootFolder.id);
  });

  test('log in with valid credentials', async () => {
    const user = await prisma.user.create({
      data: { username: 'Alice24', password: 'alice12345', rootFolderId: null },
    });

    // Track created user
    createdUserIds.push(user.id);

    const response = await request(app)
      .post('/login')
      .send({ username: 'Alice24', password: 'alice12345' });

    expect(response.text).toContain('Found. Redirecting');
  });

  test('log in with invalid credentials', async () => {
    const user = await prisma.user.create({
      data: { username: 'Alice24', password: 'alice12345', rootFolderId: null },
    });

    // Track created user
    createdUserIds.push(user.id);

    const response = await request(app)
      .post('/login')
      .send({ username: 'Alice24', password: 'wrongpassword' });

    expect(response.text).toContain('Redirecting to /login');
  });
});
