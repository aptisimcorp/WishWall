import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Plus } from "lucide-react";

export default function WhiteboardList() {
  const [whiteboards, setWhiteboards] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const API_URL = import.meta.env.VITE_API_URL || "";
    fetch(`${API_URL}/whiteboard`)
      .then((res) => res.json())
      .then((data) => {
        // Only keep boards with a title
        const boardsWithTitle = Array.isArray(data)
          ? data.filter((b) => b.title && b.title.trim() !== "")
          : [];
        setWhiteboards(boardsWithTitle);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div
      className="p-8"
      style={{
        maxWidth: "85%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignContent: "center",
        gap: "0rem",
        paddingTop: "2%",
        paddingLeft: "15%",
        // alignItems intentionally commented out
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1
          className="text-xl md:text-2xl font-bold text-gray-800"
          style={{ color: "#07042aff", fontSize: "1.5rem", fontWeight: "500" }}
        >
          Recent Whiteboards ({whiteboards.length})
        </h1>
        <Link
          to="/whiteboard/new"
          className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white font-semibold rounded-xl shadow-md hover:shadow-xl transition-all duration-300 px-4 py-2"
        >
          <Plus size={18} />
          New Whiteboard
        </Link>
      </div>

      {/* Content */}
      {loading ? (
        <div className="text-gray-500">Loading...</div>
      ) : whiteboards.length === 0 ? (
        <div className="text-gray-500">No whiteboards found.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {whiteboards.map((board) => {
            const boardId = board.id || board._id;
            return (
              <Card
                style={{
                  padding: "10px",
                  background:
                    "linear-gradient(to right, rgb(153 34 118), rgb(242 112 190)) rgb(168 92 138)",
                  color: "#fff",
                  boxShadow: "2px 3px 6px #9b7acd",
                  transition: "background 0.3s, color 0.3s, transform 0.3s",
                }}
                key={boardId}
                className="border border-purple-100 rounded-2xl"
                onMouseEnter={(e) => {
                  e.currentTarget.style.background =
                    "linear-gradient(to right, #24243e, #302b63, #0f0c29)";
                  e.currentTarget.style.color = "#fff";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background =
                    "linear-gradient(to right, rgb(153 34 118), rgb(242 112 190)) rgb(168 92 138)";
                  e.currentTarget.style.color = "#fff";
                }}
              >
                <CardContent className="p-5 flex flex-col gap-3">
                  <Link
                    to={`/whiteboard/${boardId}`}
                    className="text-lg font-semibold hover:underline"
                    style={{ color: "#fff" }}
                  >
                    {board.title}
                  </Link>
                  <div className="text-sm" style={{ color: "#fff" }}>
                    Last updated: {new Date(board.updatedAt).toLocaleString()}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
