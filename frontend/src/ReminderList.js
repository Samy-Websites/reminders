import { Link } from "react-router-dom";

const ReminderList = ({ reminders, title }) => {
  return (
    <div className="reminder-list">
      <h1> {title} </h1>
      <hr />
      {reminders.map((reminder) => (
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
