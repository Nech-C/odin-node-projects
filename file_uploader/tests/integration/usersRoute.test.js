require('dotenv').config()
const {describe, expect, test, beforeAll, beforeEach} = require('@jest/globals')
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

beforeEach(async () => {
    for (const relation of RELATIONS) {
        prisma[relation].deleteMany();
    }
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

    test('can insert into user', async () => {
        const user = await prisma.user.create({
            data: {
              username: 'elsa@prisma.io',
              password: 'Elsa Prisma',
            },
        });
        delete user.id;
        expect(user).toEqual({username: 'elsa@prisma.io', password: 'Elsa Prisma'});
        
        
    })

});

describe('Test user apis', () => {
    test('register new user', async () => {
        const response = await request(app)
            .post('/user/new')
            .send({ uname: 'Alice24', pword: 'alice12345' });
        const expected_response = 'User create!'
        expect(response.text).toEqual(expected_response)
    })
});