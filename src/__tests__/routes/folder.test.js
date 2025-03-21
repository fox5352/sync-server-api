const { app } = require("../../app");
const request = require('supertest');
const { decrypt } = require("./utils")

describe('API Test in folders route', () => { 
    const block =  request(app);
    const token = 'testing';

    test('GET /api/folders', async () => { 
        const response = await block.get("/api/folders");

        expect(response.status).toBe(200);

        const body = decrypt(response.body, token);

        expect(body).toHaveProperty('data');
        expect(body).toHaveProperty('message');

        expect(body.data).toBeInstanceOf(Array);
        expect(body.message).toBe("Successfully fetched folders");
    })

    test('POST /api/folders',async () => {
        const response = await block.post("/api/folders");

        expect(response.status).toBe(403);
    });
 })