import { useHistory, useParams } from "react-router-dom";
import useFetch from "./useFetch";
import { useState } from "react";

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

const ReminderDetails = () => {
  const db = "http://localhost:8000/reminders/";
  const history = useHistory();
  const { id } = useParams();
  const { data: reminder, error, isPending } = useFetch(db + id);

  const [showDialog, setShowDialog] = useState(false);

  const handleDelete = () => {
    fetch(db + reminder.id, {
      method: "DELETE",
    }).then(() => {
      history.push("/");
    });
  };

  return (
    <div className="reminder-details">
      {isPending && <div>Loading...</div>}
      {error && <div>{error}</div>}
      {reminder && (
        <article>
          <h2>{reminder.title}</h2>
          <p>Date: X</p>
          <div>{reminder.body}</div>
          <button onClick={() => setShowDialog(true)}>Delete</button>
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
  );
};

export default ReminderDetails;
