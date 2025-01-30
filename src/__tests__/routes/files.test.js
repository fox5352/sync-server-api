const { app } = require("../../app");
const request = require('supertest');


describe('API Test in files route', () => {
    const block = request(app);

    test('GET /api:audio',async () => { 
        const response = await block.get("/api/audio");

        expect(response.status).toBe(200);

        expect(response.body).toHaveProperty('data');
        expect(response.body).toHaveProperty('message');

        expect(response.body.data).toBeInstanceOf(Array);
        expect(response.body.message).toBe("successfully fetched data from file path");
     })

     test('GET /api:image', async () => {
        const response = await block.get("/api/image");

        expect(response.status).toBe(200);

        expect(response.body).toHaveProperty('data');
        expect(response.body).toHaveProperty('message');

        expect(response.body.data).toBeInstanceOf(Array);
        expect(response.body.message).toBe("successfully fetched data from file path");
     })
     
     test('POST /api:audio', async () => {
        const body = {data:"0001010101", name:"testing", type:"audio/mp3"};

        const response = await block.post("/api/audio").send(body);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('message');
        expect(response.body.message).toBe("file saved successfully");
     });

     test('POST /api:image', async () => {
        const body = {data:"0001010101", name:"testingss", type:"image/jpg"};

        const response = await block.post("/api/image").send(body);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('message');
        expect(response.body.message).toBe("file saved successfully");
     });
});