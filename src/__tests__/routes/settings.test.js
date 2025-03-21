const { app } = require("../../app");
const request = require('supertest');
const { updateSettings } = require("../../lib/utils");
const { encrypt, decrypt } = require("./utils")


describe('API Test in settings route', () => {
    const block = request(app);

    const token = 'testing';

    test('GET /api/settings', async() => {;

        expect(response.status).toBe(200);

        const body = decrypt(response.body, token);

        expect(body).toHaveProperty('data');
        expect(body).toHaveProperty('message');

        expect(body.data).toHaveProperty('settings');
        expect(body.message).toBe("Settings fetched successfully");

        expect(body.data.settings).toHaveProperty('allowList');
        expect(body.data.settings.allowList).toBeInstanceOf(Array);

        expect(body.data.settings).toHaveProperty('imagePaths');
        expect(body.data.settings.imagePaths).toBeInstanceOf(Array);

        expect(body.data.settings).toHaveProperty('audioPaths');
        expect(body.data.settings.audioPaths).toBeInstanceOf(Array);

        expect(body.data.settings).toHaveProperty('imageExt');

        expect(body.data.settings).toHaveProperty('audioExt');
        expect(body.data.settings.audioExt).toBeInstanceOf(Array);

        expect(body.data.settings).toHaveProperty('server');
        expect(body.data.settings.server).toBeInstanceOf(Object);

        expect(body.data.settings.server).toHaveProperty('host');
        
        expect(body.data.settings.server).toHaveProperty('port');
    });

    it('POST /api/settings - Update all settings', async () => {
        const updatedSettings = {
            settings: {
                allowList: ["video"],
                imagePaths: ["/new/image/path"],
                audioPaths: ["/c/Users/fox5352/Music","/new/audio/path"],
                videoPaths: [],
                imageExt: [
                    "jpeg"
                ],
                audioExt: [
                    "flac"
                ],
                videoExt: [
                    "mkv",
                    "mp4"
                ],
                server: {
                host: "0.0.0.0",
                    port: 8080
                }
            }
        };

        const response = await block
            .post('/api/settings')
            .send(encrypt(updatedSettings, token));

        expect(response.status).toBe(200);

        const body = decrypt(response.body, token);

        expect(body).toHaveProperty('data');
        expect(body).toHaveProperty('message');
        expect(body.message).toBe("Settings updated successfully");

        // Important: Verify the actual database or data store
        const getResponse = await block // Get the settings again
            .get('/api/settings');

            
        const body2 = decrypt(getResponse.body, token);

        expect(getResponse.status).toBe(200);
        expect(body2.data.settings).toEqual(updatedSettings.settings); // Deep comparison

    });

    it('POST /api/settings - Partial update', async () => {
        const partialUpdate = {
            settings: {
                imageExt: ["jpeg", "webp"]
            }
        };

        const response = await block
            .post('/api/settings')
            .send(partialUpdate);

        expect(response.status).toBe(200);

        const body = decrypt(response.body, token);

        expect(body.message).toBe("Settings updated successfully");

        const getResponse = await block
            .get('/api/settings');

        const getbody = decrypt(getResponse.body, token);

        expect(getResponse.status).toBe(200);
        expect(getbody.data.settings.imageExt).toEqual(partialUpdate.settings.imageExt); // Check only the updated part
        // Add more assertions to check that other settings remain unchanged
    });

    it('POST /api/settings - Empty update', async () => {
        const emptyUpdate = {
            settings: {}
        };

        const response = await block
            .post('/api/settings')
            .send(emptyUpdate);

        const body = decrypt(response.body, token);

        expect(response.status).toBe(200);
        expect(body.message).toBe("Settings updated successfully");

        const getResponse = await block
            .get('/api/settings');

        expect(getResponse.status).toBe(200);
        // Add assertions to check that the settings remain unchanged after empty update
    });

    afterAll(() => {
        const ogSettings = {
            allowList: [
                "audio", "image", 'video'
            ],
            imagePaths: [
                "./"
            ],
            audioPaths: [
                "./"
            ],
            videoPaths: [],
            imageExt: [
                "jpg"
            ],
            audioExt: [
                "mp3"
            ],
            videoExt: [
                "mkv",
                "mp4"
            ],
            server: {
                host: "0.0.0.0",
                port: 8080
            }
        };

        updateSettings(ogSettings);
    })
})