import Navbar from "./Navbar";
import Home from "./Home";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import Create from "./Create";
import Contact from "./Contact";
import ReminderDetails from "./ReminderDetails";
import NotFound from "./NotFound";
import Subscribe from "./Subscribe";

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <div className="content">
          <Switch>
            <Route exact path="/">
              <Home />
            </Route>
            <Route path="/contact">
              <Contact />
            </Route>
            <Route path="/subscribe">
              <Subscribe />
            </Route>
            <Route path="/create">
              <Create />
            </Route>
            <Route path="/reminders/:id">
              <ReminderDetails />
            </Route>
            <Route path="*">
              <NotFound />
            </Route>
          </Switch>
        </div>
      </div>
    </Router>
  );
}

export default App;
