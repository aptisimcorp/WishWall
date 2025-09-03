import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { useAuth } from "../../contexts/AuthContext";
import { useNotification } from "../../contexts/NotificationContext";
import { Card, CardContent, CardHeader } from "../ui/card";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Badge } from "../ui/badge";
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
  MoreHorizontal,
} from "lucide-react";
import { ImageWithFallback } from "../figma/ImageWithFallback";

interface Post {
  id: string;
  author: {
    id: string;
    name: string;
    profilePhoto?: string;
    department?: string;
  };
  content: string;
  type: "celebration" | "announcement" | "kudos" | "general";
  timestamp: string;
  likes: number;
  comments: number;
  isLiked: boolean;
  images?: string[];
  celebrationType?: "birthday" | "work_anniversary" | "personal_anniversary";
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
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState("");
  const [selectedPostComments, setSelectedPostComments] = useState(null);
  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState({});
  const [selectedTag, setSelectedTag] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);

  useEffect(() => {
    const API_URL = import.meta.env.VITE_API_URL || "";
    let interval: NodeJS.Timeout;
    const fetchPosts = () => {
      fetch(`${API_URL}/socialfeed`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && Array.isArray(data.data)) {
            setPosts(
              data.data.map((post: any) => ({
                id: post.id,
                author: {
                  id: post.userId,
                  name: post.userName || "User",
                  profilePhoto: post.userProfilePhoto || "",
                  department: post.userDepartment || "",
                },
                content: post.text,
                type: post.type || "general",
                celebrationType: post.celebrationType,
                timestamp: post.createdAt,
                likes: post.likes || 0,
                comments: Array.isArray(post.comments)
                  ? post.comments.length
                  : 0,
                isLiked: false,
                images: Array.isArray(post.mediaUrls)
                  ? post.mediaUrls
                  : post.mediaUrl
                  ? [post.mediaUrl]
                  : [],
                tags: Array.isArray(post.tags)
                  ? post.tags
                  : post.tags
                  ? [post.tags]
                  : [],
              }))
            );
          }
        })
        .catch(() => {});
    };
    fetchPosts();
    interval = setInterval(fetchPosts, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const handleCreatePost = async () => {
    if (!newPost.trim()) return;
    const API_URL = import.meta.env.VITE_API_URL || "";
    const formData = new FormData();
    formData.append("userId", user?.id || "");
    formData.append(
      "userName",
      `${user?.firstName || ""} ${user?.lastName || ""}`.trim()
    );
    formData.append("userProfilePhoto", user?.profilePhoto || "");
    formData.append("userDepartment", user?.department || "");
    formData.append("text", newPost);
    selectedTag.forEach((tag) => formData.append("tags", tag));
    selectedFiles.forEach((file) => formData.append("files", file));
    try {
      const res = await fetch(`${API_URL}/socialfeed`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setNewPost("");
        setSelectedTag([]);
        setSelectedFiles([]);
        showSuccess("Post shared successfully! 🎉");
      }
    } catch {
      // Optionally show error
    }
  };

  const handleLikePost = (postId: string) => {
    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId
          ? {
              ...post,
              isLiked: !post.isLiked,
              likes: post.isLiked ? post.likes - 1 : post.likes + 1,
            }
          : post
      )
    );
    const API_URL = import.meta.env.VITE_API_URL || "";
    const post = posts.find((p: any) => p.id === postId);
    fetch(`${API_URL}/socialfeed/${postId}/like`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ like: !post?.isLiked }),
    });
  };

  const fetchComments = async (postId: string) => {
    const API_URL = import.meta.env.VITE_API_URL || "";
    const res = await fetch(`${API_URL}/socialfeed/${postId}/comments`);
    const data = await res.json();
    if (data.success) {
      setComments((prev) => ({ ...prev, [postId]: data.data }));
    }
  };

  const handleShowComments = (postId: string) => {
    if (selectedPostComments === postId) {
      setSelectedPostComments(null);
    } else {
      setSelectedPostComments(postId);
      fetchComments(postId);
    }
  };

  const handleAddComment = async (postId: string) => {
    if (!newComment.trim()) return;
    const API_URL = import.meta.env.VITE_API_URL || "";
    const res = await fetch(`${API_URL}/socialfeed/${postId}/comment`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: user?.id || "",
        userName: user?.name || "",
        userProfilePhoto: user?.profilePhoto || "",
        text: newComment,
      }),
    });
    const data = await res.json();
    if (data.success) {
      setNewComment("");
      fetchComments(postId);
      showSuccess("Comment added!");
    }
  };

  const getPostIcon = (post: Post) => {
    if (post.type === "celebration") {
      switch (post.celebrationType) {
        case "birthday":
          return <Cake className="w-4 h-4 text-pink-500" />;
        case "work_anniversary":
          return <Star className="w-4 h-4 text-purple-500" />;
        default:
          return <Gift className="w-4 h-4 text-blue-500" />;
      }
    }
    return <Gift className="w-4 h-4 text-blue-500" />;
  };

  const getPostTypeLabel = (post: Post) => {
    if (post.type === "celebration") {
      switch (post.celebrationType) {
        case "birthday":
          return "Birthday";
        case "work_anniversary":
          return "Work Anniversary";
        case "personal_anniversary":
          return "Anniversary";
        default:
          return "Celebration";
      }
    }
    switch (post.type) {
      case "kudos":
        return "Kudos";
      case "announcement":
        return "Announcement";
      default:
        return "Update";
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
                    {user?.firstName?.[0]}
                    {user?.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm">
                    {user?.firstName} {user?.lastName}
                  </p>
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
              <div className="flex flex-wrap items-center gap-3 mb-4">
                {/* Custom Tag Multiselect */}
                <div className="flex items-center gap-2">
                  {["Birthday", "Anniversary", "Work Anniversary"].map(
                    (tag) => (
                      <label
                        key={tag}
                        className={`flex items-center px-3 py-1 rounded-full cursor-pointer border transition-all duration-150 ${
                          selectedTag.includes(tag)
                            ? "bg-gradient-to-r from-purple-400 to-pink-400 text-white border-transparent shadow"
                            : "bg-white border-gray-300 text-gray-700"
                        }`}
                        style={{ fontSize: "0.85rem" }}
                      >
                        <input
                          type="checkbox"
                          checked={selectedTag.includes(tag)}
                          onChange={() => {
                            setSelectedTag((prev) =>
                              prev.includes(tag)
                                ? prev.filter((t) => t !== tag)
                                : [...prev, tag]
                            );
                          }}
                          className="mr-2 accent-pink-500"
                          style={{ display: "none" }}
                        />
                        {selectedTag.includes(tag) && (
                          <span className="mr-1">✔️</span>
                        )}
                        {tag}
                      </label>
                    )
                  )}
                </div>

                {/* Fancy Photo Upload Button */}
                <label className="flex items-center cursor-pointer px-4 py-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold shadow hover:scale-105 transition-transform relative">
                  <ImageIcon className="w-6 h-6 mr-2" />
                  <input
                    type="file"
                    accept="image/*,image/gif"
                    multiple
                    style={{ display: "none" }}
                    onChange={(e) => {
                      if (e.target.files) {
                        setSelectedFiles(Array.from(e.target.files));
                      }
                    }}
                  />
                  <span className="text-sm">Add Photo/GIF</span>
                </label>
                {selectedFiles.length > 0 && (
                  <span className="text-xs text-green-600 font-medium px-2 py-1 rounded bg-green-50 border border-green-200">
                    {selectedFiles.map((file) => file.name).join(", ")}
                  </span>
                )}
              </div>
              <div className="flex items-center justify-end">
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
                          {post.author.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center space-x-2">
                          <p className="text-sm">{post.author.name}</p>
                          {post.type === "celebration" && (
                            <Badge
                              variant="secondary"
                              className="flex items-center space-x-1"
                            >
                              {getPostIcon(post)}
                              <span>{getPostTypeLabel(post)}</span>
                            </Badge>
                          )}
                          {post.type === "kudos" && (
                            <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">
                              🏆 Kudos
                            </Badge>
                          )}
                          {post.type === "announcement" && (
                            <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">
                              📢 Announcement
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          {post.author.department && (
                            <p className="text-xs text-gray-500">
                              {post.author.department}
                            </p>
                          )}
                          <span className="text-xs text-gray-400">•</span>
                          <p className="text-xs text-gray-500">
                            {post.timestamp}
                          </p>
                        </div>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>

                <CardContent>
                  <p className="text-gray-800 mb-4 leading-relaxed">
                    {post.content}
                  </p>

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
                        className={
                          post.isLiked ? "text-red-500" : "text-gray-500"
                        }
                      >
                        <Heart
                          className={`w-4 h-4 mr-2 ${
                            post.isLiked ? "fill-current" : ""
                          }`}
                        />
                        {post.likes}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleShowComments(post.id)}
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
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 pt-4 border-t border-gray-100"
                    >
                      <div className="space-y-3 mb-4">
                        {(comments[post.id] || []).map((comment: any) => (
                          <div
                            key={comment.id}
                            className="flex items-start space-x-2"
                          >
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={comment.userProfilePhoto} />
                              <AvatarFallback className="text-xs">
                                {comment.userName
                                  ?.split(" ")
                                  .map((n: string) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="bg-gray-100 rounded-lg px-3 py-2">
                                <p className="text-xs text-gray-600">
                                  {comment.userName}
                                </p>
                                <p className="text-sm">{comment.text}</p>
                              </div>
                              <p className="text-xs text-gray-500 mt-1">
                                {comment.createdAt}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="flex items-center space-x-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={user?.profilePhoto} />
                          <AvatarFallback className="text-xs">
                            {user?.firstName?.[0]}
                            {user?.lastName?.[0]}
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
                          <Button
                            size="sm"
                            className="rounded-full"
                            onClick={() => handleAddComment(post.id)}
                          >
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
