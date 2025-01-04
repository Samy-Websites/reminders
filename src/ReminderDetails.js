import { useHistory, useParams } from "react-router-dom";
import useFetch from "./useFetch";
import { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const ConfirmationDialog = ({ message, onConfirm, onCancel }) => {
  return (
    <div className="modal">
      <div className="modal-content">
        <p>{message}</p>
        <div className="modal-actions">
          <button onClick={onConfirm} className="confirm-btn">
            Confirm
          </button>
          <button onClick={onCancel} className="cancel-btn">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

const parseDateToLocal = (dateString) => {
  console.log("Raw date from database:", dateString);
  const [year, month, day] = dateString.split("-");
  const localDate = new Date(year, month - 1, day); // Create local date
  console.log("Parsed local date:", localDate);
  return localDate;
};

const formatDateToUTCString = (date) => {
  if (!date) {
    console.log("No date provided to format.");
    return null;
  }
  const utcString = `${date.getFullYear()}-${String(
    date.getMonth() + 1
  ).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  console.log("Formatted date for save:", utcString);
  return utcString;
};

const ReminderDetails = () => {
  const db = "http://localhost:8000/reminders/";
  const history = useHistory();
  const { id } = useParams();
  const { data: reminder, error, isPending } = useFetch(db + id);

  const [showDialog, setShowDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState(null);

  const handleDelete = () => {
    fetch(db + reminder.id, {
      method: "DELETE",
    }).then(() => {
      history.push("/");
    });
  };

  const handleEdit = () => {
    setIsEditing(true);
    setTitle(reminder.title);
    setBody(reminder.body);
    setCategory(reminder.category);

    const parsedDate = reminder.date ? parseDateToLocal(reminder.date) : null;
    console.log("Date set for DatePicker:", parsedDate);
    setDate(parsedDate);
  };

  const handleSave = () => {
    const formattedDate = formatDateToUTCString(date);
    console.log("Saving reminder with date:", formattedDate);

    const updatedReminder = { title, body, category, date: formattedDate };

    fetch(db + reminder.id, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedReminder),
    }).then(() => {
      setIsEditing(false);
      history.push(`/reminders/${id}`);
    });
  };

  return (
    <div className="reminder-details">
      {isPending && <div>Loading...</div>}
      {error && <div>{error}</div>}
      {!isEditing && reminder && (
        <article>
          <h2>{reminder.title}</h2>
          <p>Date: {reminder.date}</p>
          <p>Category: {reminder.category}</p>
          <div>{reminder.body}</div>
          <button onClick={handleEdit}>Edit</button>
          <button onClick={() => setShowDialog(true)}>Delete</button>
        </article>
      )}
      {isEditing && (
        <div className="create">
          <h2>Edit Reminder</h2>
          <form>
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
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="Birthday">Birthday</option>
              <option value="Appointment">Appointment</option>
              <option value="Event">Event</option>
            </select>
            <label>Reminder Date:</label>
            <div className="date-picker-container">
              <DatePicker
                selected={date}
                onChange={(selectedDate) => {
                  console.log("Date selected in DatePicker:", selectedDate);
                  setDate(selectedDate);
                }}
                dateFormat="yyyy-MM-dd"
                className="custom-datepicker"
              />
            </div>
            <div className="button-group">
              <button type="button" onClick={() => setShowDialog(true)}>
                Save
              </button>
              <button
                type="button"
                onClick={() => history.push(`/reminders/${id}`)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
      {showDialog && (
        <ConfirmationDialog
          message={
            isEditing
              ? "Are you sure you want to save changes?"
              : "Are you sure you want to delete this reminder?"
          }
          onConfirm={() => {
            if (isEditing) {
              handleSave();
            } else {
              handleDelete();
            }
            setShowDialog(false);
          }}
          onCancel={() => setShowDialog(false)}
        />
      )}
    </div>
  );
};

export default ReminderDetails;
