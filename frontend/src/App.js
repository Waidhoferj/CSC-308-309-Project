import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import ArtMap from "./pages/ArtMap/ArtMap";
import Camera from "./pages/Camera/Camera";
import Artwork from "./pages/Artwork/Artwork";
import StyleGuide from "./components/StyleGuide";
import ArtSubmission from "./pages/ArtSubmission/ArtSubmission";
import Portfolio from "./pages/Portfolio/Portfolio";
import Profile from "./pages/Profile/Profile";
import { client } from "./graphql-config";
import { ApolloProvider } from "@apollo/client";
import TabBar from "./components/TabBar/TabBar";
import { MapPin } from "react-feather";

function App() {
  return (
    <main id="App">
      <ApolloProvider client={client}>
        <Router>
          <div id="app-screen">
            <Switch>
              <Route exact path="/map" component={ArtMap} />
              <Route exact path="/map/:artwork" component={ArtMap} />
              <Route exact path="/map/:artwork/track" component={ArtMap} />
              <Route path="/artwork/:id" component={Artwork} />
              <Route path="/camera" component={Camera} />
              <Route path="/art-submission" component={ArtSubmission} />
              <Route path="/profile" component={Profile} />
              <Route path="/style-guide" component={StyleGuide} />
              <Route path="*" component={ArtMap} />
            </Switch>
          </div>

          <TabBar />
        </Router>
      </ApolloProvider>
    </main>
  );
}

export default App;
