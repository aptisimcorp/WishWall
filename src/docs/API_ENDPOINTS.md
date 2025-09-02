# WishBoard API Endpoints

## Base URL
- Development: `http://localhost:3001/api`
- Production: `https://api.wishboard.app/api`

## Authentication
All authenticated endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

## Response Format
All API responses follow this structure:
```json
{
  "success": boolean,
  "data": any,
  "message": string,
  "error": string,
  "timestamp": string
}
```

---

## Authentication Endpoints

### POST `/auth/signup`
Create a new user account
```json
// Request
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@company.com",
  "password": "SecurePass123!",
  "birthday": "1990-05-15",
  "personalAnniversary": "2020-06-01",
  "workAnniversary": "2022-03-10",
  "department": "Engineering",
  "team": "Frontend"
}

// Response (201)
{
  "success": true,
  "data": {
    "user": { /* user object */ },
    "token": "jwt_token_here"
  },
  "message": "Account created successfully"
}
```

### POST `/auth/login`
Authenticate user
```json
// Request
{
  "email": "john.doe@company.com",
  "password": "SecurePass123!"
}

// Response (200)
{
  "success": true,
  "data": {
    "user": { /* user object */ },
    "token": "jwt_token_here"
  },
  "message": "Login successful"
}
```

### POST `/auth/logout`
Logout user (invalidate token)
```json
// Response (200)
{
  "success": true,
  "message": "Logout successful"
}
```

### POST `/auth/refresh`
Refresh JWT token
```json
// Response (200)
{
  "success": true,
  "data": {
    "token": "new_jwt_token_here"
  }
}
```

### POST `/auth/forgot-password`
Request password reset
```json
// Request
{
  "email": "john.doe@company.com"
}

// Response (200)
{
  "success": true,
  "message": "Password reset email sent"
}
```

### POST `/auth/reset-password`
Reset password with token
```json
// Request
{
  "token": "reset_token_here",
  "newPassword": "NewSecurePass123!"
}

// Response (200)
{
  "success": true,
  "message": "Password reset successful"
}
```

---

## User Endpoints

### GET `/users/profile`
Get current user profile
```json
// Response (200)
{
  "success": true,
  "data": {
    "id": "uuid",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@company.com",
    "birthday": "1990-05-15",
    "workAnniversary": "2022-03-10",
    "profilePhoto": "https://...",
    "department": "Engineering",
    "team": "Frontend",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### PUT `/users/profile`
Update user profile
```json
// Request
{
  "firstName": "Jane",
  "department": "Design",
  "profilePhoto": "base64_image_data"
}

// Response (200)
{
  "success": true,
  "data": { /* updated user object */ },
  "message": "Profile updated successfully"
}
```

### GET `/users/search`
Search users
```
Query Parameters:
- q: search query
- department: filter by department
- team: filter by team
- limit: results limit (default 20)
- offset: pagination offset
```

### GET `/users/:userId/upcoming-events`
Get upcoming events for a user
```json
// Response (200)
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "type": "birthday",
      "date": "2024-01-15",
      "daysUntil": 3
    }
  ]
}
```

---

## Events Endpoints

### GET `/events`
Get events with filters
```
Query Parameters:
- type: birthday, work_anniversary, personal_anniversary, custom
- startDate: filter events from date
- endDate: filter events to date
- teamId: filter by team
- userId: filter by user
- limit: results limit (default 50)
- offset: pagination offset
```

### POST `/events`
Create new event
```json
// Request
{
  "type": "custom",
  "title": "Team Outing",
  "description": "Annual team building event",
  "eventDate": "2024-02-15",
  "teamId": "team_uuid",
  "isPublic": true
}

// Response (201)
{
  "success": true,
  "data": { /* event object */ },
  "message": "Event created successfully"
}
```

### GET `/events/:eventId`
Get specific event details
```json
// Response (200)
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "Sarah's Birthday",
    "type": "birthday",
    "date": "2024-01-15",
    "user": { /* user object */ },
    "boards": [ /* associated boards */ ]
  }
}
```

### PUT `/events/:eventId`
Update event (only creator or admin)
```json
// Request
{
  "title": "Updated Event Title",
  "description": "Updated description"
}
```

### DELETE `/events/:eventId`
Delete event (only creator or admin)
```json
// Response (200)
{
  "success": true,
  "message": "Event deleted successfully"
}
```

---

## Board Endpoints

### GET `/boards`
Get boards with filters
```
Query Parameters:
- eventId: filter by event
- userId: filter by user (created or collaborated)
- isPublic: filter public/private boards
- limit: results limit (default 20)
- offset: pagination offset
```

### POST `/boards`
Create new board
```json
// Request
{
  "eventId": "event_uuid",
  "title": "Birthday Celebration Board",
  "description": "Let's celebrate Sarah!",
  "isPublic": true,
  "backgroundColor": "#F3E8FF"
}

// Response (201)
{
  "success": true,
  "data": { /* board object */ },
  "message": "Board created successfully"
}
```

### GET `/boards/:boardId`
Get board details and elements
```json
// Response (200)
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "Birthday Board",
    "elements": [ /* board elements */ ],
    "collaborators": [ /* user objects */ ],
    "permissions": {
      "canEdit": true,
      "canDelete": false,
      "canInvite": true
    }
  }
}
```

### PUT `/boards/:boardId`
Update board metadata
```json
// Request
{
  "title": "Updated Board Title",
  "backgroundColor": "#FFE4E1"
}
```

### DELETE `/boards/:boardId`
Delete board (only creator or admin)

### POST `/boards/:boardId/collaborators`
Add board collaborator
```json
// Request
{
  "userId": "user_uuid",
  "permissionLevel": "edit" // view, edit, admin
}
```

### DELETE `/boards/:boardId/collaborators/:userId`
Remove board collaborator

---

## Board Elements Endpoints

### POST `/boards/:boardId/elements`
Add element to board
```json
// Request
{
  "type": "sticky_note",
  "x": 100,
  "y": 150,
  "width": 200,
  "height": 150,
  "content": "Happy Birthday! 🎉",
  "color": "#FEF08A"
}

// Response (201)
{
  "success": true,
  "data": { /* element object */ },
  "message": "Element added successfully"
}
```

### PUT `/boards/:boardId/elements/:elementId`
Update board element
```json
// Request
{
  "x": 150,
  "y": 200,
  "content": "Updated content"
}
```

### DELETE `/boards/:boardId/elements/:elementId`
Delete board element

### POST `/boards/:boardId/elements/batch`
Batch operations on elements
```json
// Request
{
  "operations": [
    {
      "type": "create",
      "element": { /* element data */ }
    },
    {
      "type": "update",
      "elementId": "uuid",
      "updates": { /* updates */ }
    },
    {
      "type": "delete",
      "elementId": "uuid"
    }
  ]
}
```

---

## Messages Endpoints

### GET `/boards/:boardId/messages`
Get board messages
```
Query Parameters:
- limit: results limit (default 50)
- offset: pagination offset
- parentId: get replies to specific message
```

### POST `/boards/:boardId/messages`
Post message to board
```json
// Request
{
  "content": "Great celebration board!",
  "parentId": "parent_message_uuid" // optional for replies
}
```

### PUT `/messages/:messageId`
Update message (only author)
```json
// Request
{
  "content": "Updated message content"
}
```

### DELETE `/messages/:messageId`
Delete message (only author or admin)

---

## Reactions Endpoints

### POST `/messages/:messageId/reactions`
Add reaction to message
```json
// Request
{
  "type": "love",
  "emoji": "❤️"
}
```

### DELETE `/messages/:messageId/reactions`
Remove user's reaction from message

### POST `/events/:eventId/reactions`
React to event
```json
// Request
{
  "type": "celebrate",
  "emoji": "🎉"
}
```

### POST `/boards/:boardId/elements/:elementId/reactions`
React to board element
```json
// Request
{
  "type": "like",
  "emoji": "👍"
}
```

---

## Notifications Endpoints

### GET `/notifications`
Get user notifications
```
Query Parameters:
- isRead: filter read/unread
- type: filter by notification type
- limit: results limit (default 20)
- offset: pagination offset
```

### PUT `/notifications/:notificationId/read`
Mark notification as read

### PUT `/notifications/read-all`
Mark all notifications as read

### DELETE `/notifications/:notificationId`
Delete notification

---

## File Upload Endpoints

### POST `/upload/profile-photo`
Upload profile photo
```
Content-Type: multipart/form-data
Body: photo file

// Response (200)
{
  "success": true,
  "data": {
    "url": "https://storage.example.com/photos/uuid.jpg"
  }
}
```

### POST `/upload/board-asset`
Upload asset for board (image, GIF)
```
Content-Type: multipart/form-data
Body: asset file
Header: X-Board-Id: board_uuid
```

---

## External API Integration Endpoints

### GET `/external/giphy/search`
Search GIFs via Giphy API
```
Query Parameters:
- q: search query
- limit: results limit (default 25)
```

### GET `/external/unsplash/search`
Search images via Unsplash API
```
Query Parameters:
- q: search query
- limit: results limit (default 20)
```

---

## WebSocket Events

### Connection
```javascript
// Connect to WebSocket
const socket = io('wss://api.wishboard.app', {
  auth: {
    token: 'jwt_token_here'
  }
});

// Join board room
socket.emit('join_board', { boardId: 'board_uuid' });
```

### Real-time Events
```javascript
// User joined board
socket.on('user_joined', (data) => {
  // data: { userId, userName, profilePhoto, timestamp }
});

// User left board
socket.on('user_left', (data) => {
  // data: { userId, timestamp }
});

// Element added to board
socket.on('element_added', (data) => {
  // data: { element, authorId, timestamp }
});

// Element updated
socket.on('element_updated', (data) => {
  // data: { elementId, updates, authorId, timestamp }
});

// Element deleted
socket.on('element_deleted', (data) => {
  // data: { elementId, authorId, timestamp }
});

// User cursor movement
socket.on('cursor_moved', (data) => {
  // data: { userId, x, y, timestamp }
});

// New message
socket.on('message_added', (data) => {
  // data: { message, timestamp }
});
```

### Emit Events
```javascript
// Update cursor position
socket.emit('cursor_move', { x: 100, y: 200 });

// Add element
socket.emit('element_add', { element: elementData });

// Update element
socket.emit('element_update', { elementId: 'uuid', updates: {} });

// Delete element
socket.emit('element_delete', { elementId: 'uuid' });
```

---

## Error Codes

- `400` - Bad Request (validation errors)
- `401` - Unauthorized (invalid or missing token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (duplicate email, etc.)
- `422` - Unprocessable Entity (business logic errors)
- `429` - Too Many Requests (rate limiting)
- `500` - Internal Server Error

## Rate Limiting

- Authentication endpoints: 5 requests per minute
- File upload endpoints: 10 requests per minute
- Other endpoints: 100 requests per minute
- WebSocket connections: 1 connection per user per board

## API Versioning

All endpoints include version in URL: `/api/v1/...`
Current version: `v1`