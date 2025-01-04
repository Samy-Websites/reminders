import { useState } from "react";
import { useHistory } from "react-router-dom";

const Create = () => {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [category, setCategory] = useState("Birthday"); // This means Birthday is the default option
  const [isPending, setIsPending] = useState(false);
  const history = useHistory();

  const handleSubmit = (e) => {
    e.preventDefault();
    const reminder = { title, body, category };

    setIsPending(true);

    fetch("http://localhost:8000/reminders", {
      method: "POST",
      headers: { "Content-Type": "applications/json" },
      body: JSON.stringify(reminder),
    }).then(() => {
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
        <label>Reminder body:</label>
        <textarea
          required
          value={body}
          onChange={(e) => setBody(e.target.value)}
        ></textarea>
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="Birthday">Birthday</option>
          <option value="Appointment">Appointment</option>
          <option value="Event">Event</option>
        </select>
        <label>Reminder Date: X (Implement this later)</label> <br />
        {!isPending && <button>Add Reminder</button>}
        {isPending && <button disabled>Add Reminder</button>}
      </form>
    </div>
  );
};

export default Create;
