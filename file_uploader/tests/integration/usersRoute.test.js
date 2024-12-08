require('dotenv').config()
const {describe, expect, test, beforeAll} = require('@jest/globals')
const { PrismaClient } = require('@prisma/client')
const request = require('supertest')

const app = require("../../app")

const RELATIONS = ['user', 'Session'] 

beforeAll(async () => {
    prisma = new PrismaClient();
    await prisma.$connect(); // Ensure the Prisma Client connects to the database
});

afterAll(async () => {
    await prisma.$disconnect(); // Disconnect the Prisma Client after tests
});


describe('Check test setup', () => {
    test('using test_database', ()=> {
        expect(process.env.DATABASE_URL).toBe('postgresql://nech:1234567@localhost:6543/test_file_uploader?schema=public');
    });

    test('relations are empty', async () => {
        for (const relation of RELATIONS) {
            const rows = await prisma[relation].findMany();
            expect(rows.length).toBe(0);
        }
    })

});