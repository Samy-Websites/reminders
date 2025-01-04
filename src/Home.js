import ReminderList from "./ReminderList";
import useFetch from "./useFetch";

const Home = () => {
  const {
    data: reminders,
    isPending,
    error,
  } = useFetch("http://localhost:8000/reminders");

  return (
    <div className="home">
      {error && <div>{error}</div>}
      {isPending && <div>Loading...</div>}
      {reminders && (
        <ReminderList reminders={reminders} title="All Reminders" />
      )}
      {/* <ReminderList
        reminders={reminders.filter(
          (reminder) => reminder.category === "Birthdays"
        )}
        title="Birthdays!"
      />
      <ReminderList
        reminders={reminders.filter(
          (reminder) => reminder.category === "Appointment"
        )}
        title="Appointments"
      /> */}
    </div>
  );
};

export default Home;
