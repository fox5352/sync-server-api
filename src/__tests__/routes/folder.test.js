const { app } = require("../../app");
const request = require('supertest');

describe('API Test in folders route', () => { 
    const block =  request(app);

    test('GET /api/folders', async () => { 
        const response = await block.get("/api/folders");

        expect(response.status).toBe(200);

        expect(response.body).toHaveProperty('data');
        expect(response.body).toHaveProperty('message');

        expect(response.body.data).toBeInstanceOf(Array);
        expect(response.body.message).toBe("Successfully fetched folders");
    })

    test('POST /api/folders',async () => {
        const response = await block.post("/api/folders");

        expect(response.status).toBe(403);
    });
 })