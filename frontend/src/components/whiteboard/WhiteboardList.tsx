import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Plus } from "lucide-react";

export default function WhiteboardList() {
  const [whiteboards, setWhiteboards] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/whiteboard")
      .then((res) => res.json())
      .then((data) => {
        setWhiteboards(data);
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
        <h1 className="text-xl md:text-2xl font-bold text-gray-800">
          Recent Whiteboards
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
                  background: "whitesmoke",
                  boxShadow: "2px 3px 6px #9b7acd",
                }}
                key={boardId}
                className="bg-gradient-to-r from-purple-50 to-fuchsia-50 border border-purple-100 hover:shadow-2xl hover:scale-[1.02] transition-transform duration-300 rounded-2xl"
              >
                <CardContent className="p-5 flex flex-col gap-3">
                  <Link
                    to={`/whiteboard/${boardId}`}
                    className="text-lg font-semibold text-purple-700 hover:underline"
                  >
                    {board.title}
                  </Link>
                  <div className="text-sm text-gray-500">
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
