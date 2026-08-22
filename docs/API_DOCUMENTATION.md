# Chat Application API Specification

**API Version**: 1.0.0  
**Base REST URL**: `https://frontend-task-chatapp.onrender.com/api`  
**WebSocket (Socket.io) Root**: `https://frontend-task-chatapp.onrender.com`  
**Authentication**: Bearer Token (JWT) in HTTP header (`Authorization: Bearer <token>`) & Socket.io handshake (`auth: { token }`)

---

## 1. Overview & Authentication Model

This API provides a hybrid REST and WebSocket architecture for real-time one-to-one and multi-participant group messaging.

### Authentication Flow
1. **Single-Step Login / Auto-Registration**:
   - `POST /api/auth/login` accepts a phone number (`phone`) and display name (`name`).
   - If the phone number is unrecognized, the server automatically creates a new user account.
   - If the phone number exists, the server updates/retrieves the account and returns a valid JWT.
2. **Authenticated Requests**:
   - Include the JWT in the `Authorization` header: `Bearer <jwt_token>` for all protected endpoints.
3. **Session Restoration**:
   - `GET /api/auth/me` validates the token and returns the current user profile.
4. **WebSocket Handshake**:
   - Socket.io connects to the root origin `https://frontend-task-chatapp.onrender.com` (path: `/socket.io/`).
   - The JWT token must be passed in the handshake options: `{ auth: { token: "<jwt_token>" } }`.

---

## 2. REST Endpoints

### 2.1 System & Health

#### `GET /health`
> **Note**: The health check is hosted at `/health` (root origin) rather than `/api/health`.

- **Security**: Public
- **Response (200 OK)**:
```json
{
  "status": "ok",
  "timestamp": "2026-08-21T13:30:00.000Z",
  "version": "1.0.0"
}
```

---

### 2.2 Authentication & User Profile

#### `POST /api/auth/login`
Logs in an existing user or automatically registers a new user.

- **Security**: Public
- **Request Body**:
```json
{
  "phone": "+12345678901",
  "name": "Alex Johnson"
}
```
- **Validation**:
  - `phone` (string, required): Phone number string (e.g. E.164 standard or international format).
  - `name` (string, required): Display name (min length 1, trimmed).
- **Response (200 OK)**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "6a8826abe5d6aac97521e28f",
    "name": "Alex Johnson",
    "phone": "+12345678901",
    "createdAt": "2026-08-21T10:21:31.538Z"
  }
}
```
- **Error Responses**:
  - `400 Bad Request`: `{ "error": { "message": "Phone number and name are required", "code": "VALIDATION_ERROR" } }`

---

#### `GET /api/auth/me`
Retrieves the profile of the authenticated user.

- **Security**: `Bearer <token>`
- **Response (200 OK)**:
```json
{
  "_id": "6a8826abe5d6aac97521e28f",
  "name": "Alex Johnson",
  "phone": "+12345678901",
  "createdAt": "2026-08-21T10:21:31.538Z"
}
```
- **Error Responses**:
  - `401 Unauthorized`: `{ "error": { "message": "Invalid or expired token", "code": "UNAUTHORIZED" } }`

---

### 2.3 User Directory & Search

#### `GET /api/users/search?q={query}`
Searches users by name or phone number.

- **Security**: `Bearer <token>`
- **Query Parameters**:
  - `q` (string, required): Search query string (name substring or phone digits).
- **Response (200 OK)**:
```json
[
  {
    "_id": "6a8826bde5d6aac97521e2a0",
    "name": "Sarah Connor",
    "phone": "+12345678902"
  },
  {
    "_id": "6a88239de5d6aac97521e231",
    "name": "Alex Smith",
    "phone": "+12345678999"
  }
]
```

---

### 2.4 Conversations Management

#### `GET /api/conversations`
Lists all conversations (both 1-to-1 direct and groups) that the authenticated user participates in.

- **Security**: `Bearer <token>`
- **Response (200 OK)**:
```json
{
  "data": [
    {
      "_id": "6a8826bee5d6aac97521e2a5",
      "type": "direct",
      "lastMessage": {
        "text": "Hey, are you free for a sync?",
        "sender": "6a8826abe5d6aac97521e28f",
        "createdAt": "2026-08-21T13:30:10.358Z"
      },
      "updatedAt": "2026-08-21T13:30:10.593Z",
      "participant": {
        "_id": "6a8826bde5d6aac97521e2a0",
        "name": "Sarah Connor",
        "phone": "+12345678902"
      }
    },
    {
      "_id": "6a8826dfe5d6aac97521e2c6",
      "type": "group",
      "name": "Engineering Core Team",
      "createdBy": "6a8826abe5d6aac97521e28f",
      "admins": [
        "6a8826abe5d6aac97521e28f",
        "6a8826bde5d6aac97521e2a0"
      ],
      "participants": [
        {
          "_id": "6a8826abe5d6aac97521e28f",
          "name": "Alex Johnson",
          "phone": "+12345678901"
        },
        {
          "_id": "6a8826bde5d6aac97521e2a0",
          "name": "Sarah Connor",
          "phone": "+12345678902"
        },
        {
          "_id": "6a88239de5d6aac97521e231",
          "name": "Elena Rostova",
          "phone": "+8801700000001"
        }
      ],
      "lastMessage": {
        "text": "Sprint review starts in 10 mins",
        "sender": "6a88239de5d6aac97521e231",
        "createdAt": "2026-08-21T12:00:00.000Z"
      },
      "updatedAt": "2026-08-21T12:00:00.000Z"
    }
  ]
}
```

---

#### `POST /api/conversations`
Creates or retrieves an existing 1-to-1 direct conversation with a target user.

- **Security**: `Bearer <token>`
- **Request Body**:
```json
{
  "userId": "6a8826bde5d6aac97521e2a0"
}
```
- **Response (200 OK / 201 Created)**:
```json
{
  "_id": "6a8826bee5d6aac97521e2a5",
  "participants": [
    "6a8826abe5d6aac97521e28f",
    "6a8826bde5d6aac97521e2a0"
  ],
  "createdAt": "2026-08-21T10:21:50.985Z"
}
```

---

### 2.5 Group Management

#### `POST /api/conversations/group`
Creates a new group conversation. The creator automatically becomes an admin.
> **Note**: A group requires at least 3 total members (the creator + at least 2 distinct participant IDs in `participantIds`).

- **Security**: `Bearer <token>`
- **Request Body**:
```json
{
  "name": "Product Design Circle",
  "participantIds": [
    "6a8826bde5d6aac97521e2a0",
    "6a88239de5d6aac97521e231"
  ]
}
```
- **Response (201 Created)**:
```json
{
  "_id": "6a8826dfe5d6aac97521e2c6",
  "type": "group",
  "name": "Product Design Circle",
  "createdBy": "6a8826abe5d6aac97521e28f",
  "admins": [
    "6a8826abe5d6aac97521e28f"
  ],
  "participants": [
    "6a8826abe5d6aac97521e28f",
    "6a8826bde5d6aac97521e2a0",
    "6a88239de5d6aac97521e231"
  ],
  "createdAt": "2026-08-21T14:10:00.000Z"
}
```

---

#### `PATCH /api/conversations/{id}`
Renames an existing group conversation. **(Admins Only)**

- **Security**: `Bearer <token>`
- **Path Parameter**: `id` — Group Conversation ID
- **Request Body**:
```json
{
  "name": "Design & Engineering Guild"
}
```
- **Response (200 OK)**:
```json
{
  "_id": "6a8826dfe5d6aac97521e2c6",
  "name": "Design & Engineering Guild",
  "updatedAt": "2026-08-21T14:20:00.000Z"
}
```

---

#### `POST /api/conversations/{id}/participants`
Adds one or more members to a group conversation. **(Admins Only)**

- **Security**: `Bearer <token>`
- **Path Parameter**: `id` — Group Conversation ID
- **Request Body**:
```json
{
  "userIds": [
    "6a883000e5d6aac97521e999"
  ]
}
```
- **Response (200 OK)**:
```json
{
  "_id": "6a8826dfe5d6aac97521e2c6",
  "message": "Participants added successfully"
}
```

---

#### `DELETE /api/conversations/{id}/participants/{userId}`
Removes a member from a group (Admins only) or leaves a group (when `userId` matches the current user's ID).

- **Security**: `Bearer <token>`
- **Path Parameters**:
  - `id`: Group Conversation ID
  - `userId`: Target User ID (or self ID to leave)
- **Response (200 OK)**:
```json
{
  "message": "Participant removed successfully"
}
```

---

#### `POST /api/conversations/{id}/admins`
Promotes an existing group member to admin status. **(Admins Only)**

- **Security**: `Bearer <token>`
- **Path Parameter**: `id` — Group Conversation ID
- **Request Body**:
```json
{
  "userId": "6a8826bde5d6aac97521e2a0"
}
```
- **Response (200 OK)**:
```json
{
  "_id": "6a8826dfe5d6aac97521e2c6",
  "message": "Member promoted to admin"
}
```

---

### 2.6 Message History & Dispatch

#### `GET /api/conversations/{id}/messages`
Retrieves paginated message history for a conversation.

- **Security**: `Bearer <token>`
- **Path Parameter**: `id` — Conversation ID
- **Query Parameters**:
  - `limit` (integer, optional, default: 20): Number of messages to retrieve per page.
  - `before` (string, optional): Message ID cursor to retrieve older messages preceding it.
- **Response (200 OK)**:
```json
{
  "messages": [
    {
      "_id": "6a8852e2e5d6aac975224553",
      "conversation": "6a8826bee5d6aac97521e2a5",
      "sender": "6a8826abe5d6aac97521e28f",
      "text": "Can you check the latest pull request?",
      "createdAt": "2026-08-21T13:30:10.358Z"
    },
    {
      "_id": "6a8826bfe5d6aac97521e2a9",
      "conversation": "6a8826bee5d6aac97521e2a5",
      "sender": "6a8826bde5d6aac97521e2a0",
      "text": "Reviewing it right now!",
      "createdAt": "2026-08-21T13:28:00.000Z"
    }
  ],
  "hasMore": false
}
```

---

#### `POST /api/messages`
Sends a message to a direct or group conversation via REST.
> **Note**: Messages can also be sent via WebSocket using the `message:send` event.

- **Security**: `Bearer <token>`
- **Request Body**:
```json
{
  "conversationId": "6a8826bee5d6aac97521e2a5",
  "text": "Looking forward to our discussion."
}
```
- **Validation**:
  - `conversationId` (string, required)
  - `text` (string, required): Cannot be empty or purely whitespace.
- **Response (201 Created)**:
```json
{
  "_id": "6a8852e2e5d6aac975224553",
  "conversation": "6a8826bee5d6aac97521e2a5",
  "sender": "6a8826abe5d6aac97521e28f",
  "text": "Looking forward to our discussion.",
  "createdAt": "2026-08-21T13:30:10.358Z"
}
```

---

## 3. WebSocket (Socket.io) Specification

**Connection Host**: `https://frontend-task-chatapp.onrender.com`  
**Transport**: WebSocket (with HTTP long-polling fallback)

```javascript
import { io } from 'socket.io-client';

const socket = io('https://frontend-task-chatapp.onrender.com', {
  auth: {
    token: userJwtToken
  },
  transports: ['websocket', 'polling'],
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 1000
});
```

### 3.1 Client to Server Events

#### `message:send`
Sends a message in real time to an active conversation.
- **Payload**:
```json
{
  "conversationId": "6a8826bee5d6aac97521e2a5",
  "text": "Real-time message payload"
}
```
- **Callback / Ack (optional)**:
```javascript
socket.emit('message:send', { conversationId, text }, (response) => {
  if (response.error) {
    console.error('Send error:', response.error);
  } else {
    console.log('Message delivered:', response);
  }
});
```

---

### 3.2 Server to Client Events

#### `message:new`
Broadcast when a new message is received in any conversation the user is a member of.
- **Payload**:
```json
{
  "_id": "6a8852e2e5d6aac975224553",
  "conversation": "6a8826bee5d6aac97521e2a5",
  "sender": {
    "_id": "6a8826bde5d6aac97521e2a0",
    "name": "Sarah Connor",
    "phone": "+12345678902"
  },
  "text": "Hello everyone!",
  "createdAt": "2026-08-21T13:30:10.358Z"
}
```

---

#### `conversation:updated`
Broadcast when a conversation's metadata or membership changes (renamed group, new members added, member removed, or admin promoted).
- **Payload**:
```json
{
  "_id": "6a8826dfe5d6aac97521e2c6",
  "type": "group",
  "name": "Design & Engineering Guild",
  "admins": ["6a8826abe5d6aac97521e28f", "6a8826bde5d6aac97521e2a0"],
  "participants": [ ... ],
  "updatedAt": "2026-08-21T14:20:00.000Z"
}
```

---

## 4. Standard Error Envelope

All API errors return a consistent JSON schema:

```json
{
  "error": {
    "message": "Human-readable error description",
    "code": "ERROR_CODE_ENUM",
    "details": []
  }
}
```

| HTTP Status | Error Code | Example Cause |
| :--- | :--- | :--- |
| `400 Bad Request` | `VALIDATION_ERROR` | Empty message, missing required fields, group with < 2 participants |
| `401 Unauthorized` | `UNAUTHORIZED` | Missing or invalid Bearer token |
| `403 Forbidden` | `FORBIDDEN` | Non-admin attempting to rename group or add/remove members |
| `404 Not Found` | `NOT_FOUND` | Conversation or user not found |
| `500 Server Error` | `INTERNAL_SERVER_ERROR` | Database or unhandled runtime failure |
