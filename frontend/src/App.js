import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import ArtMap from "./pages/ArtMap/ArtMap";
import Camera from "./pages/Camera/Camera";
import Artwork from "./pages/Artwork/Artwork";
import StyleGuide from "./components/StyleGuide";
import ArtSubmission from "./pages/ArtSubmission/ArtSubmission";
import { UserPortfolio } from "./pages/Portfolio/Portfolio";
import Profile from "./pages/Profile/Profile";
import GroupPage from "./pages/Groups/GroupPage/GroupPage";
import GroupsList from "./pages/Groups/GroupsList/GroupsList";
import ReportArtwork from "./pages/ReportArtwork/ReportArtwork";
import TabBar from "./components/TabBar/TabBar";
import useProfileInfo from "./hooks/useProfileInfo";
import NewAccount from "./pages/SignUp/SignUp";
import Login from "./pages/Login/Login";
import { useEffect } from "react";

const userId = "VXNlclR5cGU6am9obkBqb2huLmNvbQ==";

function App() {
  const { setUser } = useProfileInfo();
  // Until we get sign in working, this will set the user across the entire app.
  useEffect(() => {
    setUser(userId);
  }, [setUser]);

  // Sets true height for mobile devices so that the menu bars don't overlay our UI.
  useEffect(() => {
    const setSafeHeight = () =>
      document.documentElement.style.setProperty(
        "--safe-height",
        window.innerHeight + "px"
      );
    window.addEventListener("resize", setSafeHeight);
    setSafeHeight();
    return () => window.removeEventListener("resize", setSafeHeight);
  }, []);

  return (
    <main id="App">
      <Router>
        <div id="app-screen">
          <Switch>
            <Route exact path="/map" component={ArtMap} />
            <Route exact path="/map/:artwork" component={ArtMap} />
            <Route exact path="/map/:artwork/track" component={ArtMap} />
            <Route exact path="/artwork/:id/report" component={ReportArtwork} />
            <Route path="/artwork/:id" component={Artwork} />
            <Route path="/camera" component={Camera} />
            <Route path="/art-submission" component={ArtSubmission} />

            <Route path="/profile" component={Profile} />
            <Route path="/portfolio" component={UserPortfolio} />
            <Route path="/groups" component={GroupsList} />
            <Route path="/group/:id" component={GroupPage} />
            <Route path="/style-guide" component={StyleGuide} />
            <Route path="/sign-up" component={NewAccount} />
            <Route path="/login" component={Login} />
            <Route path="*" component={ArtMap} />
          </Switch>
        </div>

        <TabBar />
      </Router>
    </main>
  );
}

export default App;
