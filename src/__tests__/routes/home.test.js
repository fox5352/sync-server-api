const { app } = require("../../app");
const request = require('supertest');


describe('GET /', () => {
  it('should return a response object with available routes', async () => {
    const response = await request(app).get('/');
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({
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
          "methods": ["GET"]
        }
      ]
    });
  });
});