import { Link } from "react-router-dom";

const ReminderList = ({ reminders, title }) => {
  // Sort reminders by date
  const sortedReminders = [...reminders].sort(
    (a, b) => new Date(a.date) - new Date(b.date)
  );

  return (
    <div className="reminder-list">
      <h1> {title} </h1>
      <hr />
      {sortedReminders.map((reminder) => (
        <div className="reminder-preview" key={reminder._id}>
          <Link to={`/reminders/${reminder._id}`}>
            <h2>{reminder.title}</h2>
            <p>Date: {reminder.date}</p>
          </Link>
        </div>
      ))}
    </div>
  );
};

export default ReminderList;
