# API Documentation

## Overview

This API provides endpoints for managing files (audio and images) and system settings. All endpoints return JSON responses.

## Authentication

Some routes require authentication using a Bearer token. Include the token in the Authorization header:

```
Authorization: Bearer <token>
```

## Endpoints

### 1. File Management (`/api/:filetype`)

#### GET `/api/:filetype`

Retrieves files of a specified type from configured paths.

**Parameters:**

- `filetype` (path parameter): Either "audio" or "image"

**Response:**

```json
{
  "data": [
    {
      "key": "folderName",
      "folderName": [
        // Array of file objects
      ]
    }
  ],
  "message": "successfully fetched data from file path"
}
```

**Error Responses:**

- `500`: Internal Server Error

#### POST `/api/:filetype`

Uploads a new file of the specified type.

**Parameters:**

- `filetype` (path parameter): Either "audio" or "image"

**Request Body:**

```json
{
  "data": "file_data",
  "name": "filename",
  "type": "mime/type"
}
```

**Response:**

```json
{
  "message": "file saved successfully"
}
```

**Error Responses:**

- `400`: Invalid request payload
- `500`: Failed to save file

### 2. Settings Management

#### GET `/api/settings`

Retrieves current system settings.

**Authentication Required**: Yes

**Response:**

```json
{
  "data": {
    "settings": {
      // Settings object
    }
  },
  "message": "Settings fetched successfully"
}
```

#### POST `/api/settings`

Updates system settings.

**Authentication Required**: Yes

**Request Body:**

```json
{
  "settings": {
    // Updated settings object
  }
}
```

**Response:**

```json
{
  "data": {
    "settings": {
      // New settings object
    }
  },
  "message": "Settings updated successfully"
}
```

**Error Responses:**

- `403`: Invalid or missing token
- `500`: Failed to update settings

### 3. Folder Information (`/api/folders`)

#### GET `/api/folders`

Returns available folders for each file type.

**Response:**

```json
{
  "data": [
    {
      "type": "filetype",
      "folders": [
        // Array of folder names
      ]
    }
  ],
  "message": "Successfully fetched folders"
}
```

### 4. Route Information (`/api`)

#### GET `/api`

Lists all available API routes.

**Response:**

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

## Settings Format

The system uses a settings file that contains:

- `audioPaths`: Array of paths for audio files
- `imagePaths`: Array of paths for image files
- `audioExt`: Array of allowed audio file extensions
- `imageExt`: Array of allowed image file extensions
- `allowList`: Array of allowed file types
