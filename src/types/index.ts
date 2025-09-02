// Database Schema Types

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  passwordHash?: string;
  birthday: string;
  personalAnniversary?: string;
  workAnniversary: string;
  profilePhoto?: string;
  department?: string;
  team?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Team {
  id: string;
  name: string;
  description?: string;
  members: string[]; // User IDs
  createdAt: string;
  updatedAt?: string;
}

export interface Event {
  id: string;
  type: 'birthday' | 'work_anniversary' | 'personal_anniversary' | 'custom';
  title: string;
  description?: string;
  date: string;
  userId: string;
  teamId?: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface Board {
  id: string;
  eventId: string;
  title: string;
  description?: string;
  elements: BoardElement[];
  collaborators: string[]; // User IDs
  isPublic: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt?: string;
}

export interface BoardElement {
  id: string;
  type: 'sticky_note' | 'text' | 'shape' | 'drawing' | 'image' | 'gif';
  x: number;
  y: number;
  width?: number;
  height?: number;
  content?: string;
  color?: string;
  fontSize?: number;
  fontFamily?: string;
  strokeColor?: string;
  fillColor?: string;
  strokeWidth?: number;
  imageUrl?: string;
  authorId: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Message {
  id: string;
  boardId?: string;
  eventId?: string;
  authorId: string;
  content: string;
  type: 'comment' | 'reaction' | 'mention';
  parentId?: string; // For threaded comments
  reactions: Reaction[];
  createdAt: string;
  updatedAt?: string;
}

export interface Reaction {
  id: string;
  messageId?: string;
  boardElementId?: string;
  userId: string;
  type: 'like' | 'love' | 'laugh' | 'celebrate' | 'support' | 'custom';
  emoji?: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'birthday' | 'anniversary' | 'event_reminder' | 'board_mention' | 'celebration';
  title: string;
  message: string;
  isRead: boolean;
  actionUrl?: string;
  scheduledFor?: string;
  createdAt: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// Frontend State Types
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error?: string;
}

export interface BoardState {
  currentBoard: Board | null;
  elements: BoardElement[];
  activeUsers: ActiveUser[];
  selectedTool: string;
  selectedColor: string;
  zoom: number;
  loading: boolean;
  error?: string;
}

export interface ActiveUser {
  id: string;
  name: string;
  profilePhoto?: string;
  color: string;
  cursor: { x: number; y: number };
  lastActive: string;
}

// WebSocket Event Types
export interface WebSocketEvent {
  type: 'user_joined' | 'user_left' | 'element_added' | 'element_updated' | 'element_removed' | 'cursor_moved';
  boardId: string;
  userId: string;
  data: any;
  timestamp: string;
}

// API Endpoint Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  birthday: string;
  personalAnniversary?: string;
  workAnniversary: string;
  department?: string;
  team?: string;
}

export interface CreateEventRequest {
  type: Event['type'];
  title: string;
  description?: string;
  date: string;
  teamId?: string;
  isPublic: boolean;
}

export interface CreateBoardRequest {
  eventId: string;
  title: string;
  description?: string;
  isPublic: boolean;
}

export interface UpdateBoardElementRequest {
  elementId: string;
  updates: Partial<BoardElement>;
}

// External API Types (Giphy, etc.)
export interface GiphySearchResult {
  id: string;
  url: string;
  title: string;
  images: {
    fixed_height: {
      url: string;
      width: string;
      height: string;
    };
    original: {
      url: string;
      width: string;
      height: string;
    };
  };
}

export interface UnsplashImage {
  id: string;
  urls: {
    regular: string;
    small: string;
    thumb: string;
  };
  alt_description: string;
  user: {
    name: string;
  };
}