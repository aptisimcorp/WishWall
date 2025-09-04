// src/components/whiteboard/Whiteboard.tsx
import React, { useEffect, useState, useCallback } from "react";
import Draggable from "react-draggable";
import { Rnd } from "react-rnd";
import socket from "../../socket";
import { Button } from "../ui/button";
import { Plus, Smile, ImagePlus, Trash } from "lucide-react";
import EmojiPicker from "emoji-picker-react";


// Whiteboard object type
type ObjectType = "note" | "image" | "drawing" | "shape";
interface WhiteboardObject {
  id: string;
  type: ObjectType;
  x: number;
  y: number;
  width?: number;
  height?: number;
  color?: string;
  content?: string;
  imageUrl?: string;
  shapeType?: string;
  points?: Array<{ x: number; y: number }>;
}


const Whiteboard = () => {
  const [objects, setObjects] = useState([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [tool, setTool] = useState("note");
  const [drawing, setDrawing] = useState(null);

  // 🔌 Load objects from server
  useEffect(() => {
    socket.on("connect", () => {
      console.log("✅ Connected to socket server", socket.id);
    });
    socket.on("disconnect", () => {
      console.log("❌ Disconnected from socket server");
    });
    socket.on("loadObjects", (serverObjects: WhiteboardObject[]) => {
      setObjects(serverObjects);
    });
    socket.on("objectAdded", (object: WhiteboardObject) => {
      setObjects((prev) => [...prev, object]);
    });
    socket.on("objectUpdated", (updatedObject: WhiteboardObject) => {
      setObjects((prev) =>
        prev.map((o) => (o.id === updatedObject.id ? updatedObject : o))
      );
    });
    socket.on("objectDeleted", (objectId: string) => {
      setObjects((prev) => prev.filter((o) => o.id !== objectId));
    });
    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("loadObjects");
      socket.off("objectAdded");
      socket.off("objectUpdated");
      socket.off("objectDeleted");
    };
  }, []);


  // Add a new sticky note
  const addNote = () => {
    const newObj: WhiteboardObject = {
      id: Date.now().toString(),
      type: "note",
      x: 100,
      y: 100,
      width: 200,
      height: 200,
      color: "#FFFACD",
      content: "New Note",
    };
    socket.emit("addObject", newObj);
  };


  // Add emoji note
  const addEmoji = (emoji: any) => {
    const newObj: WhiteboardObject = {
      id: Date.now().toString(),
      type: "note",
      x: 150,
      y: 150,
      width: 100,
      height: 100,
      color: "#FFFACD",
      content: emoji.emoji,
    };
    socket.emit("addObject", newObj);
    setShowEmojiPicker(false);
  };


  // Add image
  const addImage = async () => {
    const imageUrl = prompt("Enter Image URL:");
    if (!imageUrl) return;
    const newObj: WhiteboardObject = {
      id: Date.now().toString(),
      type: "image",
      x: 200,
      y: 200,
      width: 200,
      height: 200,
      imageUrl,
    };
    socket.emit("addObject", newObj);
  };


  // Update object position/size/content
  const updateObject = useCallback((object: WhiteboardObject) => {
    socket.emit("updateObject", object);
  }, []);


  // Delete object
  const deleteObject = (id: string) => {
    socket.emit("deleteObject", id);
  };


  return (
    <div className="relative w-full h-[calc(100vh-4rem)] bg-gray-100 overflow-hidden">
      {/* Toolbar */}
      <div className="absolute top-4 left-4 flex space-x-2 z-50">
        <Button onClick={() => setTool("note")}>Note</Button>
        <Button onClick={() => setShowEmojiPicker(!showEmojiPicker)}>Emoji</Button>
        <Button onClick={() => setTool("image")}>Image</Button>
        <Button onClick={() => setTool("drawing")}>Pencil</Button>
        <Button onClick={() => setTool("shape")}>Shape</Button>
        {tool === "note" && <Button onClick={addNote}>Add Note</Button>}
        {tool === "image" && <Button onClick={addImage}>Add Image</Button>}
      </div>

      {/* Emoji Picker */}
      {showEmojiPicker && (
        <div className="absolute top-16 left-4 z-50">
          <EmojiPicker onEmojiClick={addEmoji} />
        </div>
      )}

      {/* Drawing Canvas */}
      {tool === "drawing" && (
        <canvas
          className="absolute top-0 left-0 w-full h-full z-10"
          style={{ pointerEvents: "auto" }}
          width={window.innerWidth}
          height={window.innerHeight}
          onMouseDown={(e) => {
            const rect = (e.target as HTMLCanvasElement).getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            setDrawing({
              id: Date.now().toString(),
              type: "drawing",
              points: [{ x, y }],
            });
          }}
          onMouseMove={(e) => {
            if (!drawing) return;
            const rect = (e.target as HTMLCanvasElement).getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            setDrawing({
              ...drawing,
              points: [...(drawing.points || []), { x, y }],
            });
          }}
          onMouseUp={() => {
            if (drawing) {
              socket.emit("addObject", drawing);
              setDrawing(null);
            }
          }}
        />
      )}

      {/* Render Objects */}
      {objects.map((obj) => {
        if (obj.type === "note") {
          return (
            <Rnd
              key={obj.id}
              size={{ width: obj.width || 200, height: obj.height || 200 }}
              position={{ x: obj.x, y: obj.y }}
              onDragStop={(e, d) => updateObject({ ...obj, x: d.x, y: d.y })}
              onResizeStop={(e, direction, ref, delta, position) => {
                updateObject({
                  ...obj,
                  width: parseInt(ref.style.width),
                  height: parseInt(ref.style.height),
                  ...position,
                });
              }}
              bounds="parent"
              className="absolute"
            >
              <div
                className="w-full h-full rounded-lg shadow-md p-2 relative"
                style={{ background: obj.color || "#FFFACD" }}
              >
                <button
                  onClick={() => deleteObject(obj.id)}
                  className="absolute top-1 right-1 text-red-500"
                >
                  <Trash className="w-4 h-4" />
                </button>
                <textarea
                  value={obj.content}
                  onChange={(e) =>
                    updateObject({ ...obj, content: e.target.value })
                  }
                  className="w-full h-full bg-transparent resize-none outline-none"
                />
              </div>
            </Rnd>
          );
        }
        if (obj.type === "image" && obj.imageUrl) {
          return (
            <Rnd
              key={obj.id}
              size={{ width: obj.width || 200, height: obj.height || 200 }}
              position={{ x: obj.x, y: obj.y }}
              onDragStop={(e, d) => updateObject({ ...obj, x: d.x, y: d.y })}
              onResizeStop={(e, direction, ref, delta, position) => {
                updateObject({
                  ...obj,
                  width: parseInt(ref.style.width),
                  height: parseInt(ref.style.height),
                  ...position,
                });
              }}
              bounds="parent"
              className="absolute"
            >
              <div className="w-full h-full relative">
                <button
                  onClick={() => deleteObject(obj.id)}
                  className="absolute top-1 right-1 text-red-500"
                >
                  <Trash className="w-4 h-4" />
                </button>
                <img
                  src={obj.imageUrl}
                  alt="Whiteboard Image"
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
            </Rnd>
          );
        }
        if (obj.type === "drawing" && obj.points) {
          return (
            <svg
              key={obj.id}
              style={{ position: "absolute", left: 0, top: 0, pointerEvents: "none" }}
              width={window.innerWidth}
              height={window.innerHeight}
            >
              <polyline
                points={obj.points.map((p) => `${p.x},${p.y}`).join(" ")}
                stroke="black"
                strokeWidth={2}
                fill="none"
              />
            </svg>
          );
        }
        // Add shape rendering here (rectangle, circle, etc.)
        return null;
      })}
    </div>
  );
};

export default Whiteboard;
