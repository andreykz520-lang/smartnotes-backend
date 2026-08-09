# OBD2 Pro Activation Backend

This project serves as the backend for managing Pro activations of your Android OBD2 application. 

It handles the generation of activation codes upon mock purchase and provides REST APIs for the Android app to activate and verify these codes.

## Endpoints

### 1. `POST /api/activate`
The Android app should call this endpoint when the user enters an activation code.

**Request Body:**
```json
{
  "code": "XXXX-XXXX-XXXX-XXXX",
  "deviceId": "unique_android_device_id"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Successfully activated"
}
```

**Error Responses:**
- `404 Not Found`: Invalid code.
- `403 Forbidden`: Code is already used on another device.

### 2. `POST /api/verify`
The Android app can call this on startup to verify if the device still has an active Pro license.

**Request Body:**
```json
{
  "deviceId": "unique_android_device_id"
}
```

**Response:**
```json
{
  "active": true,
  "activatedAt": "2023-10-27T10:00:00.000Z"
}
```
*(If inactive, returns `{"active": false}`)*

## Getting Started
1. Click the "Buy Pro" link to simulate buying a code.
2. Go to the "Admin" link to see all generated codes and their usage status.
3. Integrate the API endpoints in your Android app using `OkHttp` or `Retrofit`.
