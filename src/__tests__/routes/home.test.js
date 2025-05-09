const { app } = require("../../app");
const request = require('supertest');
const { decrypt} = require("./utils");


describe('GET /', () => {
  it('should return a response object with available routes', async () => {
    
    const token = 'testing';

    const response = await request(app).get('/');
    expect(response.statusCode).toBe(200);
    expect(decrypt(response.body, token)).toEqual({
      "message": "success",
      "routes": [
        {
          "path": "/api/folders",
          "desc": "shows list of available folders",
          "methods": ["GET"]
        },
        {
          "path": "/api/:filetype",
          "desc": "shows files of a given type",
          "methods": ["GET", "POST"]
        },
        {
          "desc": "retrieves a specific file",
           "methods": [
             "GET",
             "POST",
           ],
           "path": "/api/:filetype/file",
        },{
          "desc": "updates system settings",
           "methods": [
             "GET",
             "POST",
           ],
           "path": "/api/settings",
        }
      ]
    });
  });
});