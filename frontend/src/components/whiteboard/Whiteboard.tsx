// src/components/whiteboard/Whiteboard.tsx
import React, { useEffect, useState, useCallback } from "react";
import Draggable from "react-draggable";
import { Rnd } from "react-rnd";
import socket from "../../socket";
import { Button } from "../ui/button";
import { Plus, Smile, ImagePlus, Trash } from "lucide-react";
import EmojiPicker from "emoji-picker-react";

// Note type
interface Note {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  content: string;
  type: "text" | "emoji" | "gif";
}

const Whiteboard: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  // 🔌 Load notes from server
  useEffect(() => {
    socket.on("connect", () => {
      console.log("✅ Connected to socket server", socket.id);
    });

    socket.on("disconnect", () => {
      console.log("❌ Disconnected from socket server");
    });

    socket.on("loadNotes", (serverNotes: Note[]) => {
      setNotes(serverNotes);
    });

    socket.on("noteAdded", (note: Note) => {
      setNotes((prev) => [...prev, note]);
    });

    socket.on("noteUpdated", (updatedNote: Note) => {
      setNotes((prev) =>
        prev.map((n) => (n.id === updatedNote.id ? updatedNote : n))
      );
    });

    socket.on("noteDeleted", (noteId: string) => {
      setNotes((prev) => prev.filter((n) => n.id !== noteId));
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("loadNotes");
      socket.off("noteAdded");
      socket.off("noteUpdated");
      socket.off("noteDeleted");
    };
  }, []);

  // 🔨 Add a new sticky note
  const addNote = () => {
    const newNote: Note = {
      id: Date.now().toString(),
      x: 100,
      y: 100,
      width: 200,
      height: 200,
      content: "New Note",
      type: "text",
    };
    socket.emit("addNote", newNote);
  };

  // 🎨 Add emoji
  const addEmoji = (emoji: any) => {
    const newNote: Note = {
      id: Date.now().toString(),
      x: 150,
      y: 150,
      width: 100,
      height: 100,
      content: emoji.emoji,
      type: "emoji",
    };
    socket.emit("addNote", newNote);
    setShowEmojiPicker(false);
  };

  // 🖼️ Add GIF (dummy for now)
  const addGif = async () => {
    const gifUrl = prompt("Enter GIF URL:");
    if (!gifUrl) return;

    const newNote: Note = {
      id: Date.now().toString(),
      x: 200,
      y: 200,
      width: 200,
      height: 200,
      content: gifUrl,
      type: "gif",
    };
    socket.emit("addNote", newNote);
  };

  // 📝 Update note position/size/content
  const updateNote = useCallback((note: Note) => {
    socket.emit("updateNote", note);
  }, []);

  // 🗑️ Delete note
  const deleteNote = (id: string) => {
    socket.emit("deleteNote", id);
  };

  return (
    <div className="relative w-full h-[calc(100vh-4rem)] bg-gray-100 overflow-hidden">
      {/* Toolbar */}
      <div className="absolute top-4 left-4 flex space-x-2 z-50">
        <Button onClick={addNote}>
          <Plus className="w-4 h-4 mr-2" /> Note
        </Button>
        <Button onClick={() => setShowEmojiPicker(!showEmojiPicker)}>
          <Smile className="w-4 h-4 mr-2" /> Emoji
        </Button>
        <Button onClick={addGif}>
          <ImagePlus className="w-4 h-4 mr-2" /> GIF
        </Button>
      </div>

      {/* Emoji Picker */}
      {showEmojiPicker && (
        <div className="absolute top-16 left-4 z-50">
          <EmojiPicker onEmojiClick={addEmoji} />
        </div>
      )}

      {/* Render Notes */}
      {notes.map((note) => (
        <Rnd
          key={note.id}
          size={{ width: note.width, height: note.height }}
          position={{ x: note.x, y: note.y }}
          onDragStop={(e, d) => updateNote({ ...note, x: d.x, y: d.y })}
          onResizeStop={(e, direction, ref, delta, position) => {
            updateNote({
              ...note,
              width: parseInt(ref.style.width),
              height: parseInt(ref.style.height),
              ...position,
            });
          }}
          bounds="parent"
          className="absolute"
        >
          <div className="w-full h-full bg-yellow-200 rounded-lg shadow-md p-2 relative">
            <button
              onClick={() => deleteNote(note.id)}
              className="absolute top-1 right-1 text-red-500"
            >
              <Trash className="w-4 h-4" />
            </button>
            {note.type === "text" && (
              <textarea
                value={note.content}
                onChange={(e) =>
                  updateNote({ ...note, content: e.target.value })
                }
                className="w-full h-full bg-transparent resize-none outline-none"
              />
            )}
            {note.type === "emoji" && (
              <div className="flex justify-center items-center text-4xl h-full">
                {note.content}
              </div>
            )}
            {note.type === "gif" && (
              <img
                src={note.content}
                alt="GIF"
                className="w-full h-full object-cover rounded-lg"
              />
            )}
          </div>
        </Rnd>
      ))}
    </div>
  );
};

export default Whiteboard;
