# WishBoard Database Schema

## Database: PostgreSQL (Recommended) or MongoDB

### Users Table/Collection

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  birthday DATE NOT NULL,
  personal_anniversary DATE,
  work_anniversary DATE NOT NULL,
  profile_photo TEXT,
  department VARCHAR(100),
  team VARCHAR(100),
  is_active BOOLEAN DEFAULT true,
  email_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_department ON users(department);
CREATE INDEX idx_users_team ON users(team);
CREATE INDEX idx_users_birthday ON users(birthday);
CREATE INDEX idx_users_work_anniversary ON users(work_anniversary);
```

### Teams Table/Collection

```sql
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  description TEXT,
  department VARCHAR(100),
  team_lead_id UUID REFERENCES users(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Junction table for team members
CREATE TABLE team_members (
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (team_id, user_id)
);
```

### Events Table/Collection

```sql
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type VARCHAR(50) NOT NULL CHECK (type IN ('birthday', 'work_anniversary', 'personal_anniversary', 'custom')),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  event_date DATE NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  team_id UUID REFERENCES teams(id),
  is_public BOOLEAN DEFAULT true,
  is_recurring BOOLEAN DEFAULT false,
  recurrence_pattern VARCHAR(50), -- 'yearly', 'monthly', etc.
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_events_date ON events(event_date);
CREATE INDEX idx_events_user ON events(user_id);
CREATE INDEX idx_events_team ON events(team_id);
CREATE INDEX idx_events_type ON events(type);
```

### Boards Table/Collection

```sql
CREATE TABLE boards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  background_color VARCHAR(7) DEFAULT '#FFFFFF',
  background_image TEXT,
  is_public BOOLEAN DEFAULT true,
  is_locked BOOLEAN DEFAULT false,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Junction table for board collaborators
CREATE TABLE board_collaborators (
  board_id UUID REFERENCES boards(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  permission_level VARCHAR(20) DEFAULT 'edit' CHECK (permission_level IN ('view', 'edit', 'admin')),
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (board_id, user_id)
);
```

### Board Elements Table/Collection

```sql
CREATE TABLE board_elements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  board_id UUID REFERENCES boards(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL CHECK (type IN ('sticky_note', 'text', 'shape', 'drawing', 'image', 'gif')),
  x FLOAT NOT NULL,
  y FLOAT NOT NULL,
  width FLOAT,
  height FLOAT,
  content TEXT,
  color VARCHAR(7),
  font_size INTEGER,
  font_family VARCHAR(100),
  stroke_color VARCHAR(7),
  fill_color VARCHAR(7),
  stroke_width FLOAT,
  image_url TEXT,
  gif_url TEXT,
  z_index INTEGER DEFAULT 0,
  is_locked BOOLEAN DEFAULT false,
  author_id UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_board_elements_board ON board_elements(board_id);
CREATE INDEX idx_board_elements_author ON board_elements(author_id);
CREATE INDEX idx_board_elements_type ON board_elements(type);
```

### Messages Table/Collection

```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  board_id UUID REFERENCES boards(id) ON DELETE CASCADE,
  event_id UUID REFERENCES events(id),
  author_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  type VARCHAR(50) DEFAULT 'comment' CHECK (type IN ('comment', 'reaction', 'mention', 'system')),
  parent_id UUID REFERENCES messages(id), -- For threaded comments
  is_edited BOOLEAN DEFAULT false,
  is_deleted BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_messages_board ON messages(board_id);
CREATE INDEX idx_messages_event ON messages(event_id);
CREATE INDEX idx_messages_author ON messages(author_id);
CREATE INDEX idx_messages_parent ON messages(parent_id);
```

### Reactions Table/Collection

```sql
CREATE TABLE reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
  board_element_id UUID REFERENCES board_elements(id) ON DELETE CASCADE,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL CHECK (type IN ('like', 'love', 'laugh', 'celebrate', 'support', 'custom')),
  emoji VARCHAR(10),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Ensure user can only react once per item
  UNIQUE(user_id, message_id),
  UNIQUE(user_id, board_element_id),
  UNIQUE(user_id, event_id)
);
```

### Notifications Table/Collection

```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL CHECK (type IN ('birthday', 'anniversary', 'event_reminder', 'board_mention', 'celebration', 'system')),
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  action_url TEXT,
  is_read BOOLEAN DEFAULT false,
  is_sent BOOLEAN DEFAULT false,
  scheduled_for TIMESTAMP,
  metadata JSONB, -- For additional notification data
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_scheduled ON notifications(scheduled_for);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = false;
```

### File Uploads Table/Collection

```sql
CREATE TABLE file_uploads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  filename VARCHAR(255) NOT NULL,
  original_filename VARCHAR(255) NOT NULL,
  file_type VARCHAR(100) NOT NULL,
  file_size INTEGER NOT NULL,
  file_url TEXT NOT NULL,
  uploaded_by UUID REFERENCES users(id),
  board_id UUID REFERENCES boards(id),
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_file_uploads_board ON file_uploads(board_id);
CREATE INDEX idx_file_uploads_user ON file_uploads(uploaded_by);
```

### Activity Log Table/Collection

```sql
CREATE TABLE activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(50) NOT NULL, -- 'board', 'event', 'message', etc.
  resource_id UUID NOT NULL,
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_activity_log_user ON activity_log(user_id);
CREATE INDEX idx_activity_log_resource ON activity_log(resource_type, resource_id);
CREATE INDEX idx_activity_log_created ON activity_log(created_at);
```

## MongoDB Schema (Alternative)

If using MongoDB, the schema would be structured as follows:

```javascript
// Users Collection
{
  _id: ObjectId,
  firstName: String,
  lastName: String,
  email: String, // unique index
  passwordHash: String,
  birthday: Date,
  personalAnniversary: Date,
  workAnniversary: Date,
  profilePhoto: String,
  department: String,
  team: String,
  isActive: Boolean,
  emailVerified: Boolean,
  createdAt: Date,
  updatedAt: Date
}

// Events Collection
{
  _id: ObjectId,
  type: String, // enum
  title: String,
  description: String,
  eventDate: Date,
  userId: ObjectId, // ref to users
  teamId: ObjectId, // ref to teams
  isPublic: Boolean,
  isRecurring: Boolean,
  recurrencePattern: String,
  createdBy: ObjectId,
  createdAt: Date,
  updatedAt: Date
}

// Boards Collection
{
  _id: ObjectId,
  eventId: ObjectId,
  title: String,
  description: String,
  backgroundColor: String,
  backgroundImage: String,
  isPublic: Boolean,
  isLocked: Boolean,
  collaborators: [{
    userId: ObjectId,
    permissionLevel: String,
    joinedAt: Date
  }],
  elements: [{
    id: String,
    type: String,
    x: Number,
    y: Number,
    width: Number,
    height: Number,
    content: String,
    color: String,
    fontSize: Number,
    fontFamily: String,
    strokeColor: String,
    fillColor: String,
    strokeWidth: Number,
    imageUrl: String,
    gifUrl: String,
    zIndex: Number,
    isLocked: Boolean,
    authorId: ObjectId,
    createdAt: Date,
    updatedAt: Date
  }],
  createdBy: ObjectId,
  createdAt: Date,
  updatedAt: Date
}
```

## Database Indexes and Performance

### Key Indexes for Performance

1. **User lookups**: email, department, team
2. **Event queries**: event_date, user_id, type
3. **Board operations**: board_id for elements and collaborators
4. **Real-time features**: board_id for active sessions
5. **Notifications**: user_id + is_read for unread counts

### Recommended Database Configuration

```sql
-- Performance settings for PostgreSQL
ALTER DATABASE wishboard SET shared_preload_libraries = 'pg_stat_statements';
ALTER DATABASE wishboard SET track_activity_query_size = 2048;
ALTER DATABASE wishboard SET log_min_duration_statement = 1000;

-- For production, consider partitioning large tables
CREATE TABLE activity_log_y2024 PARTITION OF activity_log
FOR VALUES FROM ('2024-01-01') TO ('2025-01-01');
```

This schema supports all the core features of WishBoard including user management, event tracking, collaborative whiteboards, real-time messaging, notifications, and comprehensive activity logging.