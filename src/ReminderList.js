import { Link } from "react-router-dom";

const ReminderList = ({ reminders, title }) => {
  return (
    <div className="reminder-list">
      <h1> {title} </h1>
      <hr />
      {reminders.map((reminder) => (
        <div className="reminder-preview" key={reminder.id}>
          <Link to={`/reminders/${reminder.id}`}>
            <h2>{reminder.title}</h2>
            <p>Date: X</p>
          </Link>
        </div>
      ))}
    </div>
  );
};

export default ReminderList;
