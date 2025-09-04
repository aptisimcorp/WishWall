import React from "react";

const gifOptions = [
  {
    label: "Congratz",
    url: "https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExeWc1bTBuZGRtZDk5bDZkaXM5ZGIydTU1OHN6Y3FnMnkwaW9vZGpmMSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/dZS9HgCrRbgA0imoak/giphy.gif",
  },
  {
    label: "Happy birthday",
    url: "https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExMjJ1Z3dnOG5qZXNwYzBwNHpiZWNpOHgybnVqc2lqc2xycGQ0emNhMiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/9rO5Aksmn0dHQKXJAu/giphy.gif",
  },
  {
    label: "Happy Anniversary",
    url: "https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExMjY5MGc0ZTlrMXhlejNobGwybDluczlyanFtamVpajV6N254bzRjeiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/F3OHH5KL7po9qfHOJc/giphy.gif",
  },
  {
    label: "Party",
    url: "https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExZmd0ZzVxZ21mYThmeG1leTg2dHU2MGFpZmM4Nnd4aTY1c3JhMzBmayZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3KC2jD2QcBOSc/giphy.gif",
  },
  {
    label: "Dancing",
    url: "https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExZDN5aWlsdm1pNjdocmthNThua3JtdGthenBqanF4dWoyM3lpMnQ1dyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/10UeedrT5MIfPG/giphy.gif",
  },
];

export default function GifPicker({ onSelect, value }) {
  // Ensure controlled value for dropdown
  const selectedValue = typeof value === "string" ? value : "";
  return (
    <div style={{ padding: 8 }}>
      <label htmlFor="gif-dropdown" style={{ fontWeight: "bold" }}>
        Select a GIF:
      </label>
      <select
        id="gif-dropdown"
        style={{ marginLeft: 8, padding: 4 }}
        value={selectedValue}
        onChange={(e) => {
          const url = e.target.value;
          onSelect(url); // Always call onSelect, even if empty
        }}
      >
        <option value="">-- Choose --</option>
        {gifOptions.map((opt) => (
          <option key={opt.url} value={opt.url}>
            {opt.label}
          </option>
        ))}
      </select>
      {selectedValue && (
        <div style={{ marginTop: 12 }}>
          <img
            src={selectedValue}
            alt="Selected GIF"
            style={{ maxWidth: 120, maxHeight: 120, borderRadius: 8 }}
          />
        </div>
      )}
    </div>
  );
}
