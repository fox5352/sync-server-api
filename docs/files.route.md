# File Management API Documentation

The `/api/:filetype` endpoint handles file operations for both audio and image files.

## GET Request

The `GET` request returns a list of files from configured paths based on the filetype parameter.

### Response Object

```json
{
  "data": [
    {
      "key": "folder1",
      "folder1": [
        {
          "name": "example.mp3",
          "extension": ".mp3",
          "path": "/path/to/folder1/example.mp3"
        }
      ]
    },
    {
      "key": "folder2",
      "folder2": [
        {
          "name": "sample.mp3",
          "extension": ".mp3",
          "path": "/path/to/folder2/sample.mp3"
        }
      ]
    }
  ],
  "message": "successfully fetched data from file path"
}
```

### Error Response

```json
{
  "message": "Internal Server Error on attempt audio fetch"
}
```

## POST Request

The `POST` request saves a new file to the configured path for the specified filetype.

### Request Body

```json
{
  "data": "base64_encoded_file_data",
  "name": "filename",
  "type": "mime/extension"
}
```

### Success Response

```json
{
  "message": "file saved successfully"
}
```

### Error Responses

Invalid request payload:

```json
{
  "message": "Invalid request payload"
}
```

File save failure:

```json
{
  "message": "failed to save file"
}
```

## Notes

- For audio files, only extensions specified in `settings.audioExt` are allowed
- For image files, only extensions specified in `settings.imageExt` are allowed
- Files are currently saved to the first path in the corresponding settings array (`audioPaths[0]` or `imagePaths[0]`)
- Future updates will include path selection via query parameters
