const { app } = require("../../app");
const request = require('supertest');
const { decrypt } = require("./utils")


describe('API Test in files route', () => {
    const block = request(app);
    const token = 'testing';

    test('GET /api:audio',async () => { 
        const response = await block.get("/api/audio");

        expect(response.status).toBe(200);

        const body = decrypt(response.body, token);

        expect(body).toHaveProperty('data');
        expect(body).toHaveProperty('message');

        expect(body.data).toBeInstanceOf(Array);
        expect(body.message).toBe("successfully fetched data from file path");
     })

     test('GET /api:image', async () => {
        const response = await block.get("/api/image");

        expect(response.status).toBe(200);

        const body = decrypt(response.body, token);

        expect(body).toHaveProperty('data');
        expect(body).toHaveProperty('message');

        expect(body.data).toBeInstanceOf(Array);
        expect(body.message).toBe("successfully fetched data from file path");
     })
     
     test('POST /api:audio', async () => {
        const body = {data:"0001010101", name:"testing", type:"audio/mp3"};

        const response = await block.post("/api/audio").send(body);
        
        const rBody = decrypt(response.body, token);

        expect(response.status).toBe(200);
        expect(rBody).toHaveProperty('message');
        expect(rBody.message).toBe("file saved successfully");
     });

     test('POST /api:image', async () => {
        const body = {data:"0001010101", name:"testingss", type:"image/jpg"};

        const response = await block.post("/api/image").send(body);

        const rBody = decrypt(response.body, token);

        expect(response.status).toBe(200);
        expect(rBody).toHaveProperty('message');
        expect(rBody.message).toBe("file saved successfully");
     });
});