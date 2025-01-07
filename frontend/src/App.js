import Navbar from "./Navbar";
import Home from "./Home";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Create from "./Create";
import Contact from "./Contact";
import ReminderDetails from "./ReminderDetails";
import NotFound from "./NotFound";
import Subscribe from "./Subscribe";

function App() {
  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <div className="App">
        <Navbar />
        <div className="content">
          <Routes>
            <Route exact path="/" element={<Home />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/subscribe" element={<Subscribe />} />
            <Route path="/create" element={<Create />} />
            <Route path="/reminders/:id" element={<ReminderDetails />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
