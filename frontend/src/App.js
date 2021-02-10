import "./App.css";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import ArtMap from "./pages/ArtMap/ArtMap";
import Compass from "./pages/Compass/Compass";
import Artwork from "./pages/Artwork/Artwork";
import ArtSubmission from "./pages/ArtSubmission/ArtSubmission";
function App() {
  return (
    <Router>
      <Switch>
        <Route path="/map" component={ArtMap} />
        <Route path="/compass" component={Compass} />
        {/* For example /artwork/1 */}
        <Route path="/artwork/:id" component={Artwork} />
        <Route path="/art-submission" component={ArtSubmission} />
        <Route path="*" component={ArtMap} />
      </Switch>
    </Router>
  );
}

export default App;
