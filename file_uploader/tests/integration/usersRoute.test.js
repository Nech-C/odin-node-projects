require('dotenv').config()
const {describe, expect, test, beforeAll, beforeEach} = require('@jest/globals')
const { PrismaClient } = require('@prisma/client')
const request = require('supertest')

const app = require("../../app")

const RELATIONS = ['user', 'Session'] 

let prisma;
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
        expect(process?.env?.DATABASE_URL === null).toBe(false);
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
              rootFolderId: null,
            },
        });
        delete user.id;
        expect(user).toEqual({username: 'elsa@prisma.io', password: 'Elsa Prisma', rootFolderId: null});
        
        
    })

});

describe('Test user apis', () => {
    test('register new user', async () => {
        const response = await request(app)
            .post('/user/signup')
            .send({ username: 'Alice24', password: 'alice12345' });
        const expected_response = 'User create!';
        expect(response.text).toEqual(expected_response);

        const createdUser = prisma.user.findUnique({
            where: {
                username: 'Alice24'
            }
        });
        expect(createdUser).not.toBeNull();

        const rootFolder = prisma.folder.findUnique({
            where: {
                userId: createdUser.id
            }
        });
        expect(rootFolder).not.toBeNull();
    })

    test('log in with valid credentials', async ()=> {
        const response = await request(app)
            .post('/login')
            .send({ username: 'Alice24', password: 'alice12345' });
        
        const expected_response = 'Found. Redirecting'
        // console.log(response)
        expect(response.text).toContain(expected_response)
    })

    test('log in with invalid credentials', async () => {
        const response = await request(app)
            .post('/login')
            .send({ username: 'Alice24', password: 'alice1234' });
        
        const expected_response = 'Redirecting to /login'
        // console.log(response)
        expect(response.text).toContain(expected_response)
    })
});