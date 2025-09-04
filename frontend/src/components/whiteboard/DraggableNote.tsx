import React, { useState } from "react";
import { SketchPicker } from "react-color";
import ColorResult from "react-color";

// Define Note type locally to match usage in this component
interface Note {
  id: string;
  text: string;
  color?: string;
  image?: string;
  x: number;
  y: number;
}

interface DraggableNoteProps {
  note: Note;
  updateNote: (note: Note) => void;
  deleteNote: (id: string) => void;
}

const DraggableNote = ({
  note,
  updateNote,
  deleteNote,
}: DraggableNoteProps) => {
  const [showColor, setShowColor] = useState(false);

  // Handle color change
  const handleColorChange = (color: ColorResult) => {
    updateNote({ ...note, color: color.hex });
  };

  // Handle image upload
  const handleImageUpload = async (e: any) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/upload`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      updateNote({ ...note, image: data.imageUrl });
    } catch (err) {
      console.error("Image upload failed", err);
    }
  };

  return (
    <div
      style={{ backgroundColor: note.color, top: note.y, left: note.x }}
      className="absolute p-3 rounded-lg shadow-md w-48 cursor-move"
    >
      {/* Editable text */}
      <textarea
        value={note.text}
        onChange={(e) => updateNote({ ...note, text: e.target.value })}
        className="w-full h-20 resize-none bg-transparent outline-none"
      />

      {/* Image preview */}
      {note.image && (
        <img
          src={note.image}
          alt="note"
          className="w-full h-20 object-cover mt-2 rounded"
        />
      )}

      {/* Controls */}
      <div className="flex justify-between mt-2">
        <button
          onClick={() => setShowColor(!showColor)}
          className="text-xs bg-blue-500 text-white px-2 py-1 rounded"
        >
          🎨
        </button>
        <label className="text-xs bg-green-500 text-white px-2 py-1 rounded cursor-pointer">
          📷
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
        </label>
        <button
          onClick={() => deleteNote(note.id)}
          className="text-xs bg-red-500 text-white px-2 py-1 rounded"
        >
          ✕
        </button>
      </div>

      {/* Color Picker */}
      {showColor && (
        <div className="absolute z-10 mt-2">
          <SketchPicker color={note.color} onChange={handleColorChange} />
        </div>
      )}
    </div>
  );
};

export default DraggableNote;
