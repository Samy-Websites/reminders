import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css"; // Import default styles
import REMINDERS_URL from "./Config";

const Create = () => {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [category, setCategory] = useState("Birthday"); // Default option
  const [date, setDate] = useState(null); // Date object for the picker
  const [isPending, setIsPending] = useState(false);
  const navigate = useNavigate(); // Replaces history.push in React Router v6

  const handleSubmit = (e) => {
    e.preventDefault();

    const formattedDate = date
      ? `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(
          2,
          "0"
        )}-${String(date.getUTCDate()).padStart(2, "0")}`
      : null;

    const reminder = { title, body, category, date: formattedDate };

    setIsPending(true);

    fetch(REMINDERS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(reminder),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to add reminder");
        }
        return response.json();
      })
      .then(() => {
        console.log("New reminder added");
        setIsPending(false);
        navigate("/"); // Navigate to the homepage after adding a reminder
      })
      .catch((error) => {
        console.error("Error:", error.message);
        setIsPending(false);
      });
  };

  return (
    <div className="create">
      <h2>Add a New Reminder</h2>
      <form onSubmit={handleSubmit}>
        <label>Reminder Title:</label>
        <input
          type="text"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <label>Reminder Body:</label>
        <textarea
          placeholder="Optional"
          value={body}
          onChange={(e) => setBody(e.target.value)}
        ></textarea>
        <label>Category:</label>
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="Birthday">Birthday</option>
          <option value="Appointment">Appointment</option>
          <option value="Event">Event</option>
        </select>
        <label>Reminder Date:</label>
        <div className="date-picker-container">
          <DatePicker
            selected={date}
            onChange={(selectedDate) => setDate(selectedDate)}
            dateFormat="yyyy-MM-dd"
            className="custom-datepicker"
          />
          {!isPending && <button>Add Reminder</button>}
          {isPending && <button disabled>Adding Reminder...</button>}
        </div>
      </form>
    </div>
  );
};

export default Create;
