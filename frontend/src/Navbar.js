import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="navbar">
      <h1>
        <Link to="/">REMINDERS</Link>
      </h1>
      <div className="links">
        <Link to="/">Home</Link>
        <Link to="/subscribe">Subscribe</Link>
        <Link to="/contact">Contact</Link>
        <Link className="reminderlink" to="/create">
          New Reminder
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
