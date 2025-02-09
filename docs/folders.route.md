depending on the the /api/:filetype

```json
{
    "data": [
        {
            "type": "audio" | "image",
            "folders": [
                "folder1",
                "folder2"
            ]
        },
    ],
    "message": "Successfully fetched folders"
  }
```

will return a json object that that contains the file `type` `image | audio`
and a array of all folders that are flagged to return for that type on the `/api/settings` route
