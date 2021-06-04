import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  useHistory,
} from "react-router-dom";
import ArtMap from "./pages/ArtMap/ArtMap";
import Camera from "./pages/Camera/Camera";
import Artwork from "./pages/Artwork/Artwork";
import ArtSubmission from "./pages/ArtSubmission/ArtSubmission";
import { UserPortfolio } from "./pages/Portfolio/Portfolio";
import Profile from "./pages/Profile/Profile";
import GroupPage from "./pages/Groups/GroupPage/GroupPage";
import GroupsList from "./pages/Groups/GroupsList/GroupsList";
import ReportArtwork from "./pages/ReportArtwork/ReportArtwork";
import TabBar from "./components/TabBar/TabBar";
import SignUp from "./pages/SignUp/SignUp";
import Login from "./pages/Login/Login";
import { useEffect } from "react";
import useProfileInfo from "./hooks/useProfileInfo";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  function CameraPage() {
    const history = useHistory();
    return <Camera onSubmit={() => history.push("/art-submission")} />;
  }

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

  const { profile } = useProfileInfo();

  return (
    <main id="App">
      <Router>
        <div id="app-screen">
          <Switch>
            <Route path="/sign-up" component={SignUp} />
            <Route path="/login" component={Login} />
            <ProtectedRoute exact path="/map" component={ArtMap} />
            <ProtectedRoute exact path="/map/:artwork" component={ArtMap} />
            <ProtectedRoute
              exact
              path="/map/lat=:lat/long=:long"
              component={ArtMap}
            />
            <ProtectedRoute
              exact
              path="/map/:artwork/track"
              component={ArtMap}
            />
            <ProtectedRoute
              exact
              path="/artwork/:id/report"
              component={ReportArtwork}
            />
            <ProtectedRoute path="/artwork/:id" component={Artwork} />
            <ProtectedRoute path="/camera" component={CameraPage} />
            <ProtectedRoute path="/art-submission" component={ArtSubmission} />
            <ProtectedRoute path="/profile" component={Profile} />
            <ProtectedRoute path="/portfolio" component={UserPortfolio} />
            <ProtectedRoute path="/groups" component={GroupsList} />
            <ProtectedRoute path="/group/:id" component={GroupPage} />
            <Route path="*" component={profile ? ArtMap : Login} />
          </Switch>
        </div>

        {profile && <TabBar />}
      </Router>
      <ToastContainer />
    </main>
  );
}

export default App;
