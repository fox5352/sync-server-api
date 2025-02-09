the `GET /` route returns a response object that has all available routes

### response object

```json
{
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
}
```
