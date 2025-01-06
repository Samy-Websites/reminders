import ReminderList from "./ReminderList";
import useFetch from "./useFetch";
import BASE_URL from "./Config";

const Home = () => {
  const { data: reminders, isPending, error } = useFetch(BASE_URL);

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
