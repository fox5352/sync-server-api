the `/api/settings` route is protected and needs the a token like so `Bearer <TOKEN>`

The `GET` request will return a settings object inside a json response

### response object

```json
{
  "data": {
    "settings": {
      "allowList": ["audio", "image"],
      "imagePaths": ["example/path"],
      "audioPaths": ["example/path"],
      "imageExt": ["jpg", "png"],
      "audioExt": ["mp3"],
      "server": {
        "host": "localhost",
        "port": 9090
      }
    }
  },
  "message": "Settings fetched successfully"
}
```

the `POST request takes in a body that can contain the hole settings object or just part of it

### examples

```json
{
  "settings": {
    "allowList": ["audio", "image"]
  }
}
```

```json
{
  "settings": {
    "allowList": ["audio", "image"],
    "imagePaths": ["example/path"],
    "audioPaths": ["example/path"]
  }
}
```

```json
{
  "settings": {
    "settings": {
      "allowList": ["audio", "image"],
      "imagePaths": ["example/path"],
      "audioPaths": ["example/path"],
      "imageExt": ["jpg", "png"],
      "audioExt": ["mp3"],
      "server": {
        "host": "localhost",
        "port": 9090
      }
    }
  }
}
```

the response object will look like this

### response object

```json
{
  "data": {
    "settings": "updated settings"
  },
  "message": "Settings updated successfully"
}
```
