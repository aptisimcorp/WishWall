import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { Square } from "lucide-react";
// src/components/whiteboard/Whiteboard.tsx
import React, { useState, useRef, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Users,
  Save,
  Share2,
  Download,
  ZoomIn,
  ZoomOut,
  Undo,
  Redo,
  Trash2,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { useNotification } from "../../contexts/NotificationContext";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Badge } from "../ui/badge";

// Fix: Add ImportMetaEnv type declaration for Vite
// Add this to the top of the file (or in env.d.ts if preferred)
declare global {
  interface ImportMeta {
    env: {
      VITE_API_URL: string;
    };
  }
}

// -----------------------------
// Component
// -----------------------------
const Whiteboard = () => {
  const { eventId } = useParams();
  const { user } = useAuth();
  const { showSuccess, showInfo } = useNotification();

  // Canvas and state
  const canvasRef = useRef(null);
  const [selectedTool, setSelectedTool] = useState("move");
  const [selectedColor, setSelectedColor] = useState("#8B5CF6");
  const [elements, setElements] = useState([]);
  const [activeUsers, setActiveUsers] = useState([]);
  const [zoom, setZoom] = useState(1);

  // Sticky notes
  const [showStickyNoteDialog, setShowStickyNoteDialog] = useState(false);
  const [newStickyNote, setNewStickyNote] = useState("");
  const [stickyNotePosition, setStickyNotePosition] = useState({ x: 0, y: 0 });

  // Editing sticky notes
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [editingNoteContent, setEditingNoteContent] = useState("");
  const [editingNoteColor, setEditingNoteColor] = useState("");
  const [editingNoteImage, setEditingNoteImage] = useState("");

  // Whiteboard title
  const [title, setTitle] = useState("Untitled Whiteboard");
  const [editingTitle, setEditingTitle] = useState(false);

  // Save state
  const [saving, setSaving] = useState(false);

  // Media upload state
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaUploading, setMediaUploading] = useState(false);
  const [mediaUrl, setMediaUrl] = useState("");

  // Preset options
  const colors = ["#8B5CF6", "#F59E0B", "#10B981", "#EF4444", "#3B82F6"];
  const presetGifs = [
    "https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif",
    "https://media.giphy.com/media/3oEjI6SIIHBdRxXI40/giphy.gif",
    "https://media.giphy.com/media/xT9IgG50Fb7Mi0prBC/giphy.gif",
  ];
  const tools = [
    { id: "move", label: "Move", icon: ArrowLeft },
    { id: "sticky", label: "Sticky Note", icon: Square }, // Use Square icon from your imports
    // ... other tools
  ];

  // -----------------------------
  // Effects
  // -----------------------------
  useEffect(() => {
    const API_URL = import.meta.env.VITE_API_URL || "";
    if (eventId && eventId !== "new") {
      fetch(`${API_URL}/whiteboard/${eventId}`)
        .then((res) => res.json())
        .then((data) => {
          setTitle(data.title || "Untitled Whiteboard");
          setElements(data.elements || []);
        })
        .catch(() => {
          setTitle("Untitled Whiteboard");
          setElements([]);
        });
    } else {
      setActiveUsers([]);
      setElements([]);
    }
  }, [eventId]);

  // Save whiteboard helper for API calls after note changes
  const saveWhiteboard = (updatedElements) => {
    const API_URL = import.meta.env.VITE_API_URL || "";
    const isNew = eventId === "new";
    const url = isNew
      ? `${API_URL}/whiteboard`
      : `${API_URL}/whiteboard/${eventId}`;
    const method = isNew ? "POST" : "PUT";
    fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title,
        elements: updatedElements,
      }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to save");
        return res.json();
      })
      .then((data) => {
        showSuccess("Whiteboard saved!");
        // If new, redirect to the new board
        if (isNew && data.id) {
          window.location.replace(`/whiteboard/${data.id}`);
        }
      })
      .catch(() => {
        showInfo("Error saving whiteboard");
      });
  };

  // -----------------------------
  // Handlers (implement these properly in your logic)
  // -----------------------------
  const handleSave = () => {
    setSaving(true);
    const API_URL = import.meta.env.VITE_API_URL || "";
    const isNew = eventId === "new";
    const url = isNew
      ? `${API_URL}/whiteboard`
      : `${API_URL}/whiteboard/${eventId}`;
    const method = isNew ? "POST" : "PUT";
    fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title,
        elements,
      }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to save");
        return res.json();
      })
      .then((data) => {
        showSuccess("Whiteboard saved!");
        // If new, redirect to the new board
        if (isNew && data.id) {
          window.location.replace(`/whiteboard/${data.id}`);
        }
      })
      .catch(() => {
        showInfo("Error saving whiteboard");
      })
      .finally(() => {
        setSaving(false);
      });
  };

  const handleShare = () => showInfo("Share link copied!");
  const handleExport = async () => {
    try {
      const boardDiv = document.querySelector(
        ".whiteboard-export-area"
      ) as HTMLElement;
      if (!boardDiv) {
        showInfo(
          "Whiteboard area not found. Please make sure there are sticky notes on the board."
        );
        return;
      }
      // Wait for all images/videos to load before exporting
      const mediaElements = boardDiv.querySelectorAll("img, video");
      await Promise.all(
        Array.from(mediaElements).map(
          (el) =>
            new Promise<void>((resolve) => {
              if (el.tagName === "IMG") {
                const img = el as HTMLImageElement;
                if (img.complete) resolve();
                else img.onload = () => resolve();
              } else if (el.tagName === "VIDEO") {
                const vid = el as HTMLVideoElement;
                if (vid.readyState >= 2) resolve();
                else vid.onloadeddata = () => resolve();
              } else resolve();
            })
        )
      );
      // Now export with html2canvas
      const canvas = await html2canvas(boardDiv, {
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
        logging: false,
        scale: 2,
      });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "landscape" });
      pdf.setFontSize(20);
      pdf.text(title, 10, 20);
      const pageWidth = pdf.internal.pageSize.getWidth();
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pageWidth - 20;
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(imgData, "PNG", 10, 30, pdfWidth, pdfHeight);
      pdf.save(`${title || "whiteboard"}.pdf`);
      showSuccess("Whiteboard exported as PDF!");
    } catch (err) {
      console.error("PDF export error:", err);
      showInfo("Failed to export PDF. See console for details.");
    }
  };
  const handleZoomIn = () => setZoom((z) => Math.min(z + 0.1, 2));
  const handleZoomOut = () => setZoom((z) => Math.max(z - 0.1, 0.5));
  const handleNewStickyNote = () => setShowStickyNoteDialog(true);
  const handleCanvasClick = () => {};
  const handleDrop = () => {};
  const handleDragStart = () => {};
  const handleEditStickyNote = (el: any) => {
    setEditingNoteId(el.id);
    setEditingNoteContent(el.content);
    setEditingNoteColor(el.color);
    setEditingNoteImage(el.image || "");
  };
  const handleSaveStickyNoteEdit = () => {
    const updatedElements = elements.map((el) =>
      el.id === editingNoteId
        ? {
            ...el,
            content: editingNoteContent,
            color: editingNoteColor,
            image: editingNoteImage,
          }
        : el
    );
    setElements(updatedElements);
    setEditingNoteId(null);
    setEditingNoteContent("");
    setEditingNoteColor("");
    setEditingNoteImage("");
    saveWhiteboard(updatedElements);
  };
  const handleCancelStickyNoteEdit = () => {
    setEditingNoteId(null);
    setEditingNoteContent("");
    setEditingNoteColor("");
    setEditingNoteImage("");
  };
  const handleAddStickyNote = () => {
    const newNote = {
      id: Date.now().toString(),
      type: "sticky_note",
      x: stickyNotePosition.x,
      y: stickyNotePosition.y,
      width: 200,
      height: 150,
      color: selectedColor,
      content: newStickyNote,
      author: user,
      media: mediaUrl,
    };
    const updatedElements = [...elements, newNote];
    setElements(updatedElements);
    setNewStickyNote("");
    setMediaFile(null);
    setMediaUrl("");
    setShowStickyNoteDialog(false);
    saveWhiteboard(updatedElements);
  };
  const handleDeleteElement = (id: string) =>
    setElements((prev) => prev.filter((el) => el.id !== id));

  // File input ref for media uploads
  const mediaInputRef = useRef(null);

  // -----------------------------
  // Render
  // -----------------------------
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
              {editingTitle ? (
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onBlur={() => setEditingTitle(false)}
                  autoFocus
                  className="text-xl font-bold w-64"
                />
              ) : (
                <h1
                  className="text-xl font-bold cursor-pointer"
                  onClick={() => setEditingTitle(true)}
                  title="Click to edit title"
                >
                  {title}
                </h1>
              )}
              <p className="text-sm text-gray-500">
                Team celebration whiteboard
              </p>
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {/* Active Users */}
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4 text-gray-500" />
              <div className="flex -space-x-2">
                {activeUsers.map((activeUser) => (
                  <Avatar
                    key={activeUser.id}
                    className="h-8 w-8 border-2 border-white"
                  >
                    <AvatarImage src={activeUser.profilePhoto} />
                    <AvatarFallback className="text-xs">
                      {activeUser.name
                        .split(" ")
                        .map((n: string) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                ))}
                <Avatar className="h-8 w-8 border-2 border-white">
                  <AvatarImage src={user?.profilePhoto} />
                  <AvatarFallback className="bg-purple-500 text-white text-xs">
                    {user?.firstName?.[0]}
                    {user?.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
              </div>
              <span className="text-sm text-gray-500">
                {activeUsers.length + 1} online
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSave}
                disabled={saving}
              >
                <Save className="w-4 h-4 mr-2" />
                {saving ? "Saving..." : "Save"}
              </Button>
              <Button variant="outline" size="sm" onClick={handleShare}>
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
              <Button variant="outline" size="sm" onClick={handleExport}>
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNewStickyNote}
                title="Add Sticky Note"
              >
                <Square className="w-4 h-4 mr-2 text-yellow-500" />
                Sticky Note
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Whiteboard Body */}
      <div className="flex h-[calc(100vh-80px)]">
        {/* Toolbar */}
        {/* ...toolbar code from your version here (kept same)... */}

        {/* Canvas + Elements */}
        <div className="relative flex-1 bg-white whiteboard-export-area">
          {elements
            .filter((el) => el.type === "sticky_note")
            .map((note, idx) => (
              <motion.div
                key={note.id}
                className="absolute shadow-lg rounded-lg p-3 cursor-move"
                style={{
                  left: typeof note.x === "number" ? note.x : 40,
                  top: typeof note.y === "number" ? note.y : 40,
                  width: note.width || 220,
                  minHeight: note.media ? 220 : 150,
                  background: note.color || "#FDE68A",
                  zIndex: 10,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "flex-start",
                  alignItems: "center",
                  overflow: "visible",
                  padding: "12px 8px",
                }}
                drag
                dragMomentum={false}
                onDragEnd={(e, info) => {
                  const boardDiv = document.querySelector(
                    ".whiteboard-export-area"
                  );
                  let offsetX = 0,
                    offsetY = 0;
                  if (boardDiv) {
                    const rect = boardDiv.getBoundingClientRect();
                    offsetX = rect.left;
                    offsetY = rect.top;
                  }
                  setElements((prev) => {
                    const updatedElements = prev.map((el, i) => {
                      // Use info.point minus parent offset for accurate position
                      return i === idx
                        ? {
                            ...el,
                            x: Math.max(0, info.point.x - offsetX),
                            y: Math.max(0, info.point.y - offsetY),
                          }
                        : el;
                    });
                    saveWhiteboard(updatedElements);
                    return updatedElements;
                  });
                }}
                onClick={() => handleEditStickyNote(note)}
              >
                {note.media && (
                  <div
                    style={{
                      width: "100%",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      marginBottom: "8px",
                    }}
                  >
                    {note.media.match(/\.(mp4|webm|ogg)$/) ? (
                      <video
                        src={note.media}
                        controls
                        style={{
                          maxWidth: 180,
                          maxHeight: 120,
                          borderRadius: "8px",
                        }}
                      />
                    ) : (
                      <img
                        src={note.media}
                        alt="media"
                        style={{
                          maxWidth: 180,
                          maxHeight: 120,
                          borderRadius: "8px",
                        }}
                      />
                    )}
                  </div>
                )}
                <div
                  style={{
                    width: "100%",
                    textAlign: "center",
                    marginBottom: "8px",
                    wordBreak: "break-word",
                    padding: "4px 0",
                  }}
                >
                  {note.content}
                </div>
                <div
                  className="flex items-center gap-2 mt-2"
                  style={{
                    width: "100%",
                    justifyContent: "center",
                    paddingBottom: "4px",
                  }}
                >
                  <Avatar className="h-6 w-6 border-2 border-white">
                    <AvatarImage src={note.author?.profilePhoto} />
                    <AvatarFallback className="bg-purple-500 text-white text-xs">
                      {note.author?.firstName?.[0]}
                      {note.author?.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-gray-700 font-medium">
                    {note.author?.firstName} {note.author?.lastName}
                  </span>
                </div>
              </motion.div>
            ))}
        </div>
      </div>

      {/* Sticky Note Dialog */}
      {showStickyNoteDialog && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30"
          style={{ background: "rgba(0, 0, 0, 0.5)" }}
        >
          <div
            className="bg-white rounded-lg shadow-lg p-8 w-[480px] max-w-full"
            style={{ width: "30%", padding: "24px" }}
          >
            <h2 className="text-lg font-bold mb-4">Add Sticky Note</h2>
            <Textarea
              value={newStickyNote}
              onChange={(e) => setNewStickyNote(e.target.value)}
              placeholder="Enter note content..."
              className="mb-4"
              rows={3}
            />
            <div className="mb-4 flex flex-col items-center gap-3 p-3 w-full">
              {/* Colorful Upload Media Button with file input ref */}
              <Button
                type="button"
                variant="default"
                className="w-full bg-gradient-to-r from-purple-500 via-pink-500 to-yellow-500 text-white font-bold py-2 px-4 rounded shadow"
                style={{ marginBottom: "8px", padding: "12px 0" }}
                disabled={mediaUploading}
                onClick={() =>
                  mediaInputRef.current && mediaInputRef.current.click()
                }
              >
                {mediaUploading ? "Uploading..." : "Upload Media"}
              </Button>
              <input
                ref={mediaInputRef}
                id="media-upload"
                type="file"
                accept="image/*,video/*,.gif"
                style={{ display: "none" }}
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  setMediaFile(file);
                  setMediaUploading(true);
                  const API_URL = import.meta.env.VITE_API_URL || "";
                  const formData = new FormData();
                  formData.append("file", file);
                  try {
                    const res = await fetch(`${API_URL}/upload`, {
                      method: "POST",
                      body: formData,
                    });
                    const data = await res.json();
                    if (data.imageUrl) {
                      setMediaUrl(data.imageUrl);
                      showSuccess("Media uploaded!");
                    } else {
                      setMediaUrl("");
                      showInfo("Upload failed");
                    }
                  } catch {
                    setMediaUrl("");
                    showInfo("Upload failed");
                  }
                  setMediaUploading(false);
                }}
                disabled={mediaUploading}
              />
              {/* Preview uploaded media */}
              {mediaUrl && (
                <div className="flex flex-col items-center justify-center w-full">
                  {mediaUrl.match(/\.(mp4|webm|ogg)$/) ? (
                    <video
                      src={mediaUrl}
                      controls
                      style={{
                        maxWidth: 180,
                        maxHeight: 120,
                        margin: "0 auto",
                      }}
                    />
                  ) : (
                    <img
                      src={mediaUrl}
                      alt="media"
                      style={{
                        maxWidth: 180,
                        maxHeight: 120,
                        margin: "0 auto",
                      }}
                    />
                  )}
                </div>
              )}
            </div>
            <div className="mb-4 flex gap-2 p-2">
              {colors.map((color) => (
                <button
                  key={color}
                  type="button"
                  className={`w-6 h-6 rounded-full border-2 ${
                    selectedColor === color ? "border-black" : "border-gray-300"
                  }`}
                  style={{ background: color }}
                  onClick={() => setSelectedColor(color)}
                  aria-label={`Select color ${color}`}
                />
              ))}
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowStickyNoteDialog(false)}
              >
                Cancel
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={handleAddStickyNote}
                disabled={
                  !newStickyNote.trim() ||
                  (mediaFile && (!mediaUrl || mediaUploading))
                }
              >
                Add
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Whiteboard;
