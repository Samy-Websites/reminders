import { useNavigate, useParams } from "react-router-dom";
import useFetch from "./useFetch";
import { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import BASE_URL from "./Config";

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
  const [year, month, day] = dateString.split("-");
  return new Date(year, month - 1, day); // Create local date
};

const formatDateToUTCString = (date) => {
  return date
    ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
        2,
        "0"
      )}-${String(date.getDate()).padStart(2, "0")}`
    : null;
};

const ReminderDetails = () => {
  const db = BASE_URL;
  const { id } = useParams();
  const { data: reminder, error, isPending } = useFetch(`${db}/${id}`);

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [saveDialog, setSaveDialog] = useState(false);

  const navigate = useNavigate(); // Initialize navigate

  const handleEdit = () => {
    setIsEditing(true);
    setTitle(reminder.title);
    setBody(reminder.body);
    setCategory(reminder.category);
    setDate(reminder.date ? parseDateToLocal(reminder.date) : null);
  };

  const handleSave = () => {
    const formattedDate = formatDateToUTCString(date);
    const updatedReminder = { title, body, category, date: formattedDate };

    fetch(`${db}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedReminder),
    }).then(() => {
      setIsEditing(false);
      setSaveDialog(false);
      navigate(0); // Reload the current page to reflect changes
    });
  };

  const handleDelete = () => {
    fetch(`${db}/${id}`, { method: "DELETE" }).then(() => {
      navigate(-1); // Reload the current page to reflect changes
    });
  };

  return (
    <>
      {!isEditing ? (
        <div className="reminder-details">
          {isPending && <div>Loading...</div>}
          {error && <div>{error}</div>}
          {!isPending && reminder && (
            <article>
              <h2>{reminder.title}</h2>
              <p>Date: {reminder.date}</p>
              <p>Category: {reminder.category}</p>
              <div>{reminder.body}</div>
              <div className="button-group">
                <button onClick={handleEdit}>Edit</button>
                <button onClick={() => setShowDialog(true)}>Delete</button>
              </div>
            </article>
          )}
          {showDialog && (
            <ConfirmationDialog
              message="Are you sure you want to delete this reminder?"
              onConfirm={() => {
                handleDelete();
                setShowDialog(false);
              }}
              onCancel={() => setShowDialog(false)}
            />
          )}
        </div>
      ) : (
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
                onChange={(selectedDate) => setDate(selectedDate)}
                dateFormat="yyyy-MM-dd"
                className="custom-datepicker"
              />
              <button type="button" onClick={() => setSaveDialog(true)}>
                Save
              </button>
              <button type="button" onClick={() => setIsEditing(false)}>
                Cancel
              </button>
            </div>
          </form>
          {saveDialog && (
            <ConfirmationDialog
              message="Are you sure you want to save changes?"
              onConfirm={handleSave}
              onCancel={() => setSaveDialog(false)}
            />
          )}
        </div>
      )}
    </>
  );
};

export default ReminderDetails;
