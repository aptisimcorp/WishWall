import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { Pen, Square, Circle, Type, StickyNote, Image as ImageIcon, Smile, Undo, Redo, Download, Share2, Users, Palette, Trash2, ZoomIn, ZoomOut, Move, ArrowLeft, Save } from 'lucide-react';
import io from 'socket.io-client';

interface WhiteboardElement {
  id: string;
  type: 'sticky_note' | 'text' | 'shape' | 'drawing' | 'image';
  x: number;
  y: number;
  width?: number;
  height?: number;
  content?: string;
  color?: string;
  author: {
    name: string;
    profilePhoto?: string;
  };
  timestamp: string;
}

interface ActiveUser {
  id: string;
  name: string;
  profilePhoto?: string;
  color: string;
  cursor: { x: number; y: number };
}

export function Whiteboard() {
  const { eventId } = useParams();
  const { user } = useAuth();
  const { showSuccess, showInfo } = useNotification();
  
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [selectedTool, setSelectedTool] = useState<string>('move');
  const [selectedColor, setSelectedColor] = useState<string>('#8B5CF6');
  const [elements, setElements] = useState<WhiteboardElement[]>([]);
  const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([]);
  const socketRef = useRef<any>(null);
  const [zoom, setZoom] = useState<number>(1);
  const [showStickyNoteDialog, setShowStickyNoteDialog] = useState<boolean>(false);
  const [newStickyNote, setNewStickyNote] = useState<string>('');
  const [stickyNotePosition, setStickyNotePosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const tools = [
    { id: 'move', icon: Move, label: 'Move' },
    { id: 'pen', icon: Pen, label: 'Pen' },
    { id: 'text', icon: Type, label: 'Text' },
    { id: 'sticky', icon: StickyNote, label: 'Sticky Note' },
    { id: 'rectangle', icon: Square, label: 'Rectangle' },
    { id: 'circle', icon: Circle, label: 'Circle' },
    { id: 'image', icon: ImageIcon, label: 'Image' },
  ];

  const colors = [
    '#8B5CF6', // Purple
    '#EC4899', // Pink
    '#F59E0B', // Yellow
    '#10B981', // Green
    '#3B82F6', // Blue
    '#EF4444', // Red
    '#6B7280', // Gray
    '#000000', // Black
  ];

  useEffect(() => {
    // Connect to socket.io backend
    socketRef.current = io('http://localhost:5000');
    if (eventId) {
        if (socketRef.current) {
          socketRef.current.emit('joinBoard', eventId);
        }
    }

    // Fetch initial board data
    fetch(`/api/whiteboard/${eventId}`)
      .then(res => res.json())
      .then(data => {
        setElements(data.elements || []);
        setActiveUsers(data.users || []);
      });

    // Listen for real-time updates
      if (socketRef.current) {
        socketRef.current.on('elementUpdate', ({ elements, users }) => {
          setElements(elements);
          setActiveUsers(users);
        });
      }

    return () => {
        if (socketRef.current) {
          socketRef.current.disconnect();
        }
    };
  }, [eventId]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (selectedTool === 'sticky') {
      const rect = canvasRef.current ? canvasRef.current.getBoundingClientRect() : null;
      if (rect) {
        const x = (e.clientX - rect.left) / zoom;
        const y = (e.clientY - rect.top) / zoom;
        setStickyNotePosition({ x, y });
        setShowStickyNoteDialog(true);
      }
    }
  };

  const handleAddStickyNote = async () => {
    if (!newStickyNote.trim()) return;

    const element: WhiteboardElement = {
      id: Date.now().toString(),
      type: 'sticky_note',
      x: stickyNotePosition.x,
      y: stickyNotePosition.y,
      width: 200,
      height: 150,
      content: newStickyNote,
      color: selectedColor === '#8B5CF6' ? '#F3E8FF' : '#FEF08A',
      author: {
        name: `${user?.firstName} ${user?.lastName}` || 'Anonymous',
        profilePhoto: user?.profilePhoto
      },
      timestamp: new Date().toISOString()
    };

    const updatedElements = [...elements, element];
    setElements(updatedElements);
    setNewStickyNote('');
    setShowStickyNoteDialog(false);
    showSuccess('Sticky note added! 📝');

    // Emit update to backend
      if (socketRef.current) {
        socketRef.current.emit('elementUpdate', {
          eventId,
          elements: updatedElements,
          users: activeUsers
        });
      }

    // Persist to backend
    await fetch(`/api/whiteboard/${eventId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ elements: updatedElements, users: activeUsers })
    });
  };

  const handleDeleteElement = async (elementId: string) => {
    const updatedElements = elements.filter(el => el.id !== elementId);
    setElements(updatedElements);
    showInfo('Element removed');

      if (socketRef.current) {
        socketRef.current.emit('elementUpdate', {
          eventId,
          elements: updatedElements,
          users: activeUsers
        });
      }
    await fetch(`/api/whiteboard/${eventId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ elements: updatedElements, users: activeUsers })
    });
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.1, 2));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.1, 0.5));
  };

  const handleSave = async () => {
    await fetch(`/api/whiteboard/${eventId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ elements, users: activeUsers })
    });
    showSuccess('Whiteboard saved! 💾');
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    showSuccess('Whiteboard link copied to clipboard! 🔗');
  };

  const handleExport = () => {
    // Mock export functionality
    showSuccess('Whiteboard exported successfully! 📎');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link to="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-xl">Sarah's Birthday Celebration</h1>
              <p className="text-sm text-gray-500">Team celebration whiteboard</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Active Users */}
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4 text-gray-500" />
              <div className="flex -space-x-2">
                {activeUsers.map((activeUser) => (
                  <Avatar key={activeUser.id} className="h-8 w-8 border-2 border-white">
                    <AvatarImage src={activeUser.profilePhoto} />
                    <AvatarFallback className="text-xs">
                      {activeUser.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                ))}
                <Avatar className="h-8 w-8 border-2 border-white">
                  <AvatarImage src={user?.profilePhoto} />
                  <AvatarFallback className="bg-purple-500 text-white text-xs">
                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
              </div>
              <span className="text-sm text-gray-500">{activeUsers.length + 1} online</span>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={handleSave}>
                <Save className="w-4 h-4 mr-2" />
                Save
              </Button>
              <Button variant="outline" size="sm" onClick={handleShare}>
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
              <Button variant="outline" size="sm" onClick={handleExport}>
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Toolbar */}
        <div className="bg-white border-r border-gray-200 p-4 w-16 flex flex-col items-center space-y-4">
          {/* Tools */}
          <div className="space-y-2">
            {tools.map((tool) => {
              const Icon = tool.icon;
              return (
                <Button
                  key={tool.id}
                  variant={selectedTool === tool.id ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setSelectedTool(tool.id)}
                  className={`w-10 h-10 p-0 ${
                    selectedTool === tool.id 
                      ? 'bg-purple-500 hover:bg-purple-600' 
                      : 'hover:bg-gray-100'
                  }`}
                  title={tool.label}
                >
                  <Icon className="w-4 h-4" />
                </Button>
              );
            })}
          </div>

          <div className="w-full h-px bg-gray-200" />

          {/* Colors */}
          <div className="space-y-1">
            {colors.map((color) => (
              <button
                key={color}
                onClick={() => setSelectedColor(color)}
                className={`w-8 h-8 rounded-md border-2 ${
                  selectedColor === color ? 'border-gray-400' : 'border-gray-200'
                }`}
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>

          <div className="w-full h-px bg-gray-200" />

          {/* Zoom Controls */}
          <div className="space-y-2">
            <Button variant="ghost" size="sm" onClick={handleZoomIn} className="w-10 h-10 p-0">
              <ZoomIn className="w-4 h-4" />
            </Button>
            <div className="text-xs text-center text-gray-500">
              {Math.round(zoom * 100)}%
            </div>
            <Button variant="ghost" size="sm" onClick={handleZoomOut} className="w-10 h-10 p-0">
              <ZoomOut className="w-4 h-4" />
            </Button>
          </div>

          <div className="w-full h-px bg-gray-200" />

          {/* Actions */}
          <div className="space-y-2">
            <Button variant="ghost" size="sm" className="w-10 h-10 p-0">
              <Undo className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" className="w-10 h-10 p-0">
              <Redo className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Canvas Area */}
        <div className="flex-1 relative overflow-hidden">
          <canvas
            ref={canvasRef}
            width={1200}
            height={800}
            onClick={handleCanvasClick}
            className="absolute inset-0 cursor-crosshair"
            style={{ 
              transform: `scale(${zoom})`,
              transformOrigin: 'top left',
              background: 'white'
            }}
          />

          {/* Rendered Elements */}
          <div 
            className="absolute inset-0"
            style={{ 
              transform: `scale(${zoom})`,
              transformOrigin: 'top left'
            }}
          >
            {elements.map((element) => (
              <motion.div
                key={element.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute group"
                style={{
                  left: element.x,
                  top: element.y,
                  width: element.width,
                  height: element.height,
                }}
              >
                {element.type === 'sticky_note' && (
                  <Card 
                    className="h-full shadow-lg border-0 cursor-move"
                    style={{ backgroundColor: element.color }}
                  >
                    <CardContent className="p-3 h-full flex flex-col">
                      <div className="flex-1">
                        <p className="text-sm text-gray-800 whitespace-pre-wrap">
                          {element.content}
                        </p>
                      </div>
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-300">
                        <div className="flex items-center space-x-2">
                          <Avatar className="h-4 w-4">
                            <AvatarImage src={element.author.profilePhoto} />
                            <AvatarFallback className="text-xs">
                              {element.author.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-xs text-gray-600">{element.author.name}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteElement(element.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </motion.div>
            ))}

            {/* Active User Cursors */}
            {activeUsers.map((activeUser) => (
              <motion.div
                key={activeUser.id}
                className="absolute pointer-events-none flex items-center space-x-2"
                style={{
                  left: activeUser.cursor.x,
                  top: activeUser.cursor.y,
                }}
                animate={{
                  x: [0, 5, 0],
                  y: [0, -2, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                }}
              >
                <div 
                  className="w-3 h-3 rounded-full border border-white"
                  style={{ backgroundColor: activeUser.color }}
                />
                <Badge className="text-xs" style={{ backgroundColor: activeUser.color }}>
                  {activeUser.name}
                </Badge>
              </motion.div>
            ))}
          </div>

          {/* Sticky Note Dialog */}
          {showStickyNoteDialog && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-lg p-6 w-96"
              >
                <h3 className="text-lg mb-4">Add Sticky Note</h3>
                <Textarea
                  placeholder="Write your message..."
                  value={newStickyNote}
                  onChange={(e) => setNewStickyNote(e.target.value)}
                  className="mb-4"
                  rows={4}
                />
                <div className="flex items-center justify-end space-x-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowStickyNoteDialog(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleAddStickyNote}>
                    Add Note
                  </Button>
                </div>
              </motion.div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}