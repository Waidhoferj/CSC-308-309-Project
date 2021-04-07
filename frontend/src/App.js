import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import ArtMap from "./pages/ArtMap/ArtMap";
import Camera from "./pages/Camera/Camera";
import Artwork from "./pages/Artwork/Artwork";
import StyleGuide from "./components/StyleGuide";
import ArtSubmission from "./pages/ArtSubmission/ArtSubmission";
import Portfolio from "./pages/Portfolio/Portfolio";
import Profile from "./pages/Profile/Profile";
<<<<<<< HEAD
import GroupsList from "./pages/Groups/GroupsList/GroupsList";
=======
>>>>>>> b87794f (Added initial report page)
import ReportArtwork from "./pages/ReportArtwork/ReportArtwork";
import TabBar from "./components/TabBar/TabBar";
import useProfileInfo from "./hooks/useProfileInfo";
import { useEffect } from "react";

const userId = "VXNlclR5cGU6am9obkBqb2huLmNvbQ==";

function App() {
  const { setUser } = useProfileInfo();
  // Until we get sign in working, this will set the user across the entire app.
  useEffect(() => {
    setUser(userId);
  }, []);
  return (
    <main id="App">
      <Router>
        <div id="app-screen">
          <Switch>
            <Route exact path="/map" component={ArtMap} />
            <Route exact path="/map/:artwork" component={ArtMap} />
            <Route exact path="/map/:artwork/track" component={ArtMap} />
            <Route path="/artwork/:id/report" component={ReportArtwork} />
            <Route path="/artwork/:id" component={Artwork} />
            <Route path="/camera" component={Camera} />
            <Route path="/art-submission" component={ArtSubmission} />
            <Route path="/profile" component={Profile} />
            <Route path="/portfolio" component={Portfolio} />
            <Route path="/groups" component={GroupsList} />
            <Route path="/style-guide" component={StyleGuide} />
            <Route path="*" component={ArtMap} />
          </Switch>
        </div>

        <TabBar />
      </Router>
    </main>
  );
}

export default App;
