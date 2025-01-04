import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="navbar">
      <h1>Reminders</h1>
      <div className="links">
        <Link to="/">Home</Link>
        <Link className="reminderlink" to="/create">
          New Reminder
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
