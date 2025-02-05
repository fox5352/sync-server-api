const { app } = require("../../app");
const request = require('supertest');


describe('API Test in settings route', () => {
    const block = request(app);

    const token = 'Bearer testing';

    test('GET /api/settings', async() => {
        const response = await block.get("/api/settings").set('Authorization', token);

        expect(response.status).toBe(200);

        expect(response.body).toHaveProperty('data');
        expect(response.body).toHaveProperty('message');

        expect(response.body.data).toHaveProperty('settings');
        expect(response.body.message).toBe("Settings fetched successfully");

        expect(response.body.data.settings).toHaveProperty('allowList');
        expect(response.body.data.settings.allowList).toBeInstanceOf(Array);

        expect(response.body.data.settings).toHaveProperty('imagePaths');
        expect(response.body.data.settings.imagePaths).toBeInstanceOf(Array);

        expect(response.body.data.settings).toHaveProperty('audioPaths');
        expect(response.body.data.settings.audioPaths).toBeInstanceOf(Array);

        expect(response.body.data.settings).toHaveProperty('imageExt');
        expect(response.body.data.settings.imageExt).toBeInstanceOf(Array);

        expect(response.body.data.settings).toHaveProperty('audioExt');
        expect(response.body.data.settings.audioExt).toBeInstanceOf(Array);

        expect(response.body.data.settings).toHaveProperty('server');
        expect(response.body.data.settings.server).toBeInstanceOf(Object);

        expect(response.body.data.settings.server).toHaveProperty('host');
        
        expect(response.body.data.settings.server).toHaveProperty('port');
    });

    test('POST /api/settings', async() => {
        const updatedSettings = {
            imageExt: ['.jpg', '.png'],
            audioExt: ['.mp3', '.wav'],
        };

        const ogSettings = await block.get("/api/settings").set('Authorization', token);

        const response = await block.post("/api/settings").send({ settings: updatedSettings }).set('Authorization', token);

        expect(response.status).toBe(200);

        expect(response.body).toHaveProperty('data');
        expect(response.body).toHaveProperty('message');

        expect(response.body.data).toHaveProperty('settings');
        expect(response.body.data.settings).toBeInstanceOf(Object);

        expect(response.body.data.settings).toHaveProperty('imageExt');
        expect(response.body.data.settings.imageExt).toEqual(updatedSettings.imageExt);

        expect(response.body.data.settings).toHaveProperty('audioExt');
        expect(response.body.data.settings.audioExt).toEqual(updatedSettings.audioExt);

        expect(response.body.message).toBe("Settings updated successfully");


        await block.post("/api/settings").send({ settings: ogSettings }).set('Authorization', token);
    })
})