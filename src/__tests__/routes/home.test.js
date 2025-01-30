const { app } = require("../../app");
const request = require('supertest');

describe('API Test home route', () => {
    const block =  request(app);

    it('GET /', async () => { 
        const response = await block.get("/");

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('message');
        expect(response.body.message).toBe("success");

        expect(response.body).toHaveProperty('routes');
        expect(response.body.routes).toBeInstanceOf(Array);
    })
})