import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import { Card, CardContent, CardHeader } from '../ui/card';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Image as ImageIcon, 
  Smile, 
  Gift,
  Cake,
  Star,
  Send,
  MoreHorizontal
} from 'lucide-react';
import { ImageWithFallback } from '../figma/ImageWithFallback';

interface Post {
  id: string;
  author: {
    id: string;
    name: string;
    profilePhoto?: string;
    department?: string;
  };
  content: string;
  type: 'celebration' | 'announcement' | 'kudos' | 'general';
  timestamp: string;
  likes: number;
  comments: number;
  isLiked: boolean;
  images?: string[];
  celebrationType?: 'birthday' | 'work_anniversary' | 'personal_anniversary';
}

interface Comment {
  id: string;
  author: {
    name: string;
    profilePhoto?: string;
  };
  content: string;
  timestamp: string;
}

export function SocialFeed() {
  const { user } = useAuth();
  const { showSuccess } = useNotification();
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPost, setNewPost] = useState('');
  const [selectedPostComments, setSelectedPostComments] = useState<string | null>(null);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    // Mock posts data
    const mockPosts: Post[] = [
      {
        id: '1',
        author: {
          id: '2',
          name: 'Sarah Johnson',
          profilePhoto: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
          department: 'Design'
        },
        content: '🎉 Had an amazing birthday celebration with the team today! Thank you everyone for the surprise party and the beautiful whiteboard messages. You all made my day so special! 💖',
        type: 'celebration',
        celebrationType: 'birthday',
        timestamp: '2 hours ago',
        likes: 24,
        comments: 8,
        isLiked: true,
        images: [
          'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=400&h=300&fit=crop',
          'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=400&h=300&fit=crop'
        ]
      },
      {
        id: '2',
        author: {
          id: '3',
          name: 'Mike Chen',
          profilePhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
          department: 'Engineering'
        },
        content: '🏆 Huge kudos to the Frontend team for shipping the new user dashboard ahead of schedule! The collaboration and dedication you all showed was incredible. Special shoutout to @Alex and @Emma for the late nights! 👏',
        type: 'kudos',
        timestamp: '5 hours ago',
        likes: 31,
        comments: 12,
        isLiked: false
      },
      {
        id: '3',
        author: {
          id: '4',
          name: 'Emily Rodriguez',
          profilePhoto: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
          department: 'Marketing'
        },
        content: '📢 Exciting news! We just crossed 10,000 users on our platform! 🚀 This milestone wouldn\'t have been possible without each and every one of you. Let\'s celebrate this achievement together! Who\'s up for a team lunch this Friday?',
        type: 'announcement',
        timestamp: '1 day ago',
        likes: 45,
        comments: 18,
        isLiked: true
      },
      {
        id: '4',
        author: {
          id: '5',
          name: 'David Park',
          profilePhoto: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
          department: 'Sales'
        },
        content: '🎊 Today marks 3 years since I joined this incredible team! Looking back, I\'m amazed at how much we\'ve grown together. Thank you for making every day enjoyable and for all the support along the way!',
        type: 'celebration',
        celebrationType: 'work_anniversary',
        timestamp: '2 days ago',
        likes: 38,
        comments: 15,
        isLiked: false
      }
    ];

    setPosts(mockPosts);
  }, []);

  const handleCreatePost = () => {
    if (!newPost.trim()) return;

    const post: Post = {
      id: Date.now().toString(),
      author: {
        id: user?.id || '',
        name: `${user?.firstName} ${user?.lastName}` || '',
        profilePhoto: user?.profilePhoto,
        department: user?.department
      },
      content: newPost,
      type: 'general',
      timestamp: 'now',
      likes: 0,
      comments: 0,
      isLiked: false
    };

    setPosts(prev => [post, ...prev]);
    setNewPost('');
    showSuccess('Post shared successfully! 🎉');
  };

  const handleLikePost = (postId: string) => {
    setPosts(prev => prev.map(post => 
      post.id === postId 
        ? { 
            ...post, 
            isLiked: !post.isLiked,
            likes: post.isLiked ? post.likes - 1 : post.likes + 1
          }
        : post
    ));
  };

  const getPostIcon = (post: Post) => {
    if (post.type === 'celebration') {
      switch (post.celebrationType) {
        case 'birthday':
          return <Cake className="w-4 h-4 text-pink-500" />;
        case 'work_anniversary':
          return <Star className="w-4 h-4 text-purple-500" />;
        default:
          return <Gift className="w-4 h-4 text-blue-500" />;
      }
    }
    return <Gift className="w-4 h-4 text-blue-500" />;
  };

  const getPostTypeLabel = (post: Post) => {
    if (post.type === 'celebration') {
      switch (post.celebrationType) {
        case 'birthday':
          return 'Birthday';
        case 'work_anniversary':
          return 'Work Anniversary';
        case 'personal_anniversary':
          return 'Anniversary';
        default:
          return 'Celebration';
      }
    }
    switch (post.type) {
      case 'kudos':
        return 'Kudos';
      case 'announcement':
        return 'Announcement';
      default:
        return 'Update';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            Team Feed 🎊
          </h1>
          <p className="text-gray-600">
            Share celebrations, kudos, and updates with your team
          </p>
        </motion.div>

        {/* Create Post */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center space-x-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user?.profilePhoto} />
                  <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm">{user?.firstName} {user?.lastName}</p>
                  <p className="text-xs text-gray-500">{user?.department}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Share something with your team... 🎉"
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                className="mb-4 resize-none"
                rows={3}
              />
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm">
                    <ImageIcon className="w-4 h-4 mr-2" />
                    Photo
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Smile className="w-4 h-4 mr-2" />
                    GIF
                  </Button>
                </div>
                <Button 
                  onClick={handleCreatePost}
                  disabled={!newPost.trim()}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Share
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Posts Feed */}
        <div className="space-y-6">
          {posts.map((post, index) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
            >
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={post.author.profilePhoto} />
                        <AvatarFallback>
                          {post.author.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center space-x-2">
                          <p className="text-sm">{post.author.name}</p>
                          {post.type === 'celebration' && (
                            <Badge variant="secondary" className="flex items-center space-x-1">
                              {getPostIcon(post)}
                              <span>{getPostTypeLabel(post)}</span>
                            </Badge>
                          )}
                          {post.type === 'kudos' && (
                            <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">
                              🏆 Kudos
                            </Badge>
                          )}
                          {post.type === 'announcement' && (
                            <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">
                              📢 Announcement
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          {post.author.department && (
                            <p className="text-xs text-gray-500">{post.author.department}</p>
                          )}
                          <span className="text-xs text-gray-400">•</span>
                          <p className="text-xs text-gray-500">{post.timestamp}</p>
                        </div>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>

                <CardContent>
                  <p className="text-gray-800 mb-4 leading-relaxed">{post.content}</p>
                  
                  {post.images && (
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      {post.images.map((image, idx) => (
                        <ImageWithFallback
                          key={idx}
                          src={image}
                          alt={`Post image ${idx + 1}`}
                          className="rounded-lg object-cover h-48 w-full"
                        />
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center space-x-6">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleLikePost(post.id)}
                        className={post.isLiked ? 'text-red-500' : 'text-gray-500'}
                      >
                        <Heart className={`w-4 h-4 mr-2 ${post.isLiked ? 'fill-current' : ''}`} />
                        {post.likes}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedPostComments(
                          selectedPostComments === post.id ? null : post.id
                        )}
                      >
                        <MessageCircle className="w-4 h-4 mr-2" />
                        {post.comments}
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Share2 className="w-4 h-4 mr-2" />
                        Share
                      </Button>
                    </div>
                  </div>

                  {/* Comments Section */}
                  {selectedPostComments === post.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 pt-4 border-t border-gray-100"
                    >
                      <div className="space-y-3 mb-4">
                        {/* Mock comments */}
                        <div className="flex items-start space-x-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face" />
                            <AvatarFallback className="text-xs">JD</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="bg-gray-100 rounded-lg px-3 py-2">
                              <p className="text-xs text-gray-600">John Doe</p>
                              <p className="text-sm">Congratulations! Well deserved! 🎉</p>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">2 hours ago</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={user?.profilePhoto} />
                          <AvatarFallback className="text-xs">
                            {user?.firstName?.[0]}{user?.lastName?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 flex items-center space-x-2">
                          <input
                            type="text"
                            placeholder="Write a comment..."
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            className="flex-1 px-3 py-1 text-sm border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500"
                          />
                          <Button size="sm" className="rounded-full">
                            <Send className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}