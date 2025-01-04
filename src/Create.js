import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css"; // Import default styles

const Create = () => {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [category, setCategory] = useState("Birthday"); // This means Birthday is the default option
  const [date, setDate] = useState(null); // Date object for the picker
  const [isPending, setIsPending] = useState(false);
  const history = useHistory();

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

    fetch("http://localhost:8000/reminders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(reminder),
    }).then(() => {
      console.log("New reminder added");
      setIsPending(false);
      history.push("/");
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
