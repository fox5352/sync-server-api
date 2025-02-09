const { app } = require("../../app");
const request = require('supertest');
const { updateSettings } = require("../../lib/utils");


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

        expect(response.body.data.settings).toHaveProperty('audioExt');
        expect(response.body.data.settings.audioExt).toBeInstanceOf(Array);

        expect(response.body.data.settings).toHaveProperty('server');
        expect(response.body.data.settings.server).toBeInstanceOf(Object);

        expect(response.body.data.settings.server).toHaveProperty('host');
        
        expect(response.body.data.settings.server).toHaveProperty('port');
    });

    it('POST /api/settings - Update all settings', async () => {
        const updatedSettings = {
            settings: {
                allowList: ["video"],
                imagePaths: ["/new/image/path"],
                audioPaths: ["/c/Users/fox5352/Music","/new/audio/path"],
                imageExt: ["gif"],
                audioExt: ["flac"],
                server: {
                    host: "192.168.1.100",
                    port: 8080
                }
            }
        };

        const response = await block
            .post('/api/settings')
            .set('Authorization', token)
            .send(updatedSettings);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('data');
        expect(response.body).toHaveProperty('message');
        expect(response.body.message).toBe("Settings updated successfully");

        // Important: Verify the actual database or data store
        const getResponse = await block // Get the settings again
            .get('/api/settings')
            .set('Authorization', token);

        expect(getResponse.status).toBe(200);
        expect(getResponse.body.data.settings).toEqual(updatedSettings.settings); // Deep comparison

    });

    it('POST /api/settings - Partial update', async () => {
        const partialUpdate = {
            settings: {
                imageExt: ["jpeg", "webp"]
            }
        };

        const response = await block
            .post('/api/settings')
            .set('Authorization', token)
            .send(partialUpdate);

        expect(response.status).toBe(200);
        expect(response.body.message).toBe("Settings updated successfully");

        const getResponse = await block
            .get('/api/settings')
            .set('Authorization', token);

        expect(getResponse.status).toBe(200);
        expect(getResponse.body.data.settings.imageExt).toEqual(partialUpdate.settings.imageExt); // Check only the updated part
        // Add more assertions to check that other settings remain unchanged
    });

    it('POST /api/settings - Empty update', async () => {
        const emptyUpdate = {
            settings: {}
        };

        const response = await block
            .post('/api/settings')
            .set('Authorization', token)
            .send(emptyUpdate);

        expect(response.status).toBe(200);
        expect(response.body.message).toBe("Settings updated successfully");

        const getResponse = await block
            .get('/api/settings')
            .set('Authorization', token);

        expect(getResponse.status).toBe(200);
        // Add assertions to check that the settings remain unchanged after empty update
    });

    afterAll(() => {
        const ogSettings = {
            allowList: [
                "video"
            ],
            imagePaths: [
                "/new/image/path"
            ],
            audioPaths: [
                "/c/Users/fox5352/Music"
            ],
            imageExt: [
                "jpeg"
            ],
            audioExt: [
                "flac"
            ],
            server: {
                "host": "192.168.1.100",
                "port": 8080
            }
        };

        updateSettings(ogSettings);
    })
})