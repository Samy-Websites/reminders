import { useHistory, useParams } from "react-router-dom";
import useFetch from "./useFetch";

const ReminderDetails = () => {
  const db = "http://localhost:8000/reminders/";
  const history = useHistory();

  const { id } = useParams();
  const { data: reminder, error, isPending } = useFetch(db + id);

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
          <button onClick={handleDelete}>Delete</button>
        </article>
      )}
    </div>
  );
};

export default ReminderDetails;
