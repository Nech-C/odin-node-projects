const path = require('path');
const { describe, expect, test, beforeAll, afterAll, beforeEach, afterEach } = require('@jest/globals');
const { PrismaClient } = require('@prisma/client');
const request = require('supertest');
require('dotenv').config();
const app = require('../../app');

let prisma;
let createdUserIds = [];
let createdFolderIds = [];
let createdFileIds = [];
let authCookie;

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
  createdFileIds = [];
});

afterEach(async () => {
  // Delete specific files
  for (const fileId of createdFileIds) {
    await prisma.file.delete({ where: { id: fileId } }).catch(() => {});
  }

  // Delete specific folders
  for (const folderId of createdFolderIds) {
    await prisma.folder.delete({ where: { id: folderId } }).catch(() => {});
  }

  // Delete specific users
  for (const userId of createdUserIds) {
    await prisma.user.delete({ where: { id: userId } }).catch(() => {});
  }
});

describe('File upload APIs', () => {
  beforeEach(async () => {
    // Create a user using the signup API
    const signResponse = await request(app)
      .post('/user/signup')
      .send({ username: 'Alice241', password: 'alice123451' });

    expect(signResponse.text).toEqual('User create!');

    const createdUser = await prisma.user.findUnique({
      where: { username: 'Alice241' },
    });
    expect(createdUser).not.toBeNull();

    // Track created user
    createdUserIds.push(createdUser.id);

    // Log in and capture session cookie
    const loginResponse = await request(app)
      .post('/login')
      .send({ username: 'Alice241', password: 'alice123451' });

    expect(loginResponse.text).toContain('Found. Redirecting');
    authCookie = loginResponse.headers['set-cookie'];
    expect(authCookie).toBeDefined();
  });

  test('upload a file', async () => {
    const filePath = path.join(__dirname, '../test_files/test_upload.txt');

    const response = await request(app)
      .post('/upload')
      .set('Cookie', authCookie)
      .attach('file', filePath);

    expect(response.status).toBe(201);
    expect(response.body.message).toContain('Files uploaded successfully');

    const uploadedFile = await prisma.file.findFirst({
      where: { name: 'test_upload.txt' },
    });

    expect(uploadedFile).not.toBeNull();
    createdFileIds.push(uploadedFile.id); // Track created file
  });
});
