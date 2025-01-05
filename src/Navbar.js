import { Link } from "react-router-dom";
import Contact from "./Contact";

const Navbar = () => {
  return (
    <nav className="navbar">
      <h1>
        <Link to="/">Reminders</Link>
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
