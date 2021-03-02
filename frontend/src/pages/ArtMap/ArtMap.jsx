import "./ArtMap.scss";
import { useEffect, useState } from "react";

import artAreasJSON from "./art-areas.json";
import ArtInfo from "./components/ArtInfo";
import ArtChoices from "./components/ArtChoices";
import DirectionsCard from "./components/DirectionsCard";

import {
  useRouteMatch,
  useHistory,
  useParams,
  Switch,
  Route,
} from "react-router-dom";
import { ArrowLeft, Star } from "react-feather";
import { motion, AnimatePresence } from "framer-motion";
import { GeolocateControl } from "mapbox-gl";
import ReactMapboxGl, { ScaleControl, Cluster, Marker } from "react-mapbox-gl";

const Map = ReactMapboxGl({
  accessToken:
    "pk.eyJ1Ijoid2FpZGhvZmVyaiIsImEiOiJja2wwMGNtOHQyMTFqMndqdW9zZ2V3eDB3In0.Ptj-ozNnxV_X6mx5J4DIBA",
});

const mapStyles = {
  width: "100%",
  height: "100%",
  position: "absolute",
  top: 0,
};

export default function ArtMap() {
  const { artwork: artId } = useParams();
  const [mapLocation] = useState([-122.447372, 37.750411]);
  const [userLocation, setUserLocation] = useState(null);
  const [zoom] = useState([11]);
  const [selectedCluster, setSelectedCluster] = useState([]);
  const [selectedArtwork, setSelectedArtwork] = useState(null);
  const artDistance =
    userLocation && selectedArtwork
      ? getGeoDistance(userLocation, selectedArtwork.coordinates)
      : null;

  const { push: goTo, goBack } = useHistory();
  const viewingArtwork = useRouteMatch({ path: "/map/:artwork", exact: true });
  const navigating = useRouteMatch("/map/:artwork/track");
  const cardOpen = (viewingArtwork || selectedCluster.length) && !navigating;

  useEffect(
    function handleDirectNavigation() {
      if ((viewingArtwork || navigating) && !selectedArtwork) {
        // Reach out to the server and get the correct artwork
        // This is gonna trigger if someone shares a link, skipping the browsing phase.
        const id = Number(artId);
        const targetArt = artAreasJSON.features.find(
          (art) => art.properties.id === id
        );
        setSelectedArtwork({
          ...targetArt.properties,
          coordinates: targetArt.geometry.coordinates,
        });
      }
    },
    [viewingArtwork, navigating, artId, selectedArtwork]
  );

  function onMapLoad(map) {
    const geoControl = new GeolocateControl({ trackUserLocation: true });
    map.addControl(geoControl);

    geoControl.on("geolocate", (e) => {
      setUserLocation([e.coords.longitude, e.coords.latitude]);
    });
  }

  function chooseArtworkMarker(artwork) {
    setSelectedCluster([]);
    setSelectedArtwork(artwork);
    goTo("/map/" + artwork.id);
  }

  function chooseArtwork(artwork) {
    setSelectedArtwork(artwork);
    goTo("/map/" + artwork.id);
  }

  function chooseCluster(children) {
    const clusterArtworks = children.map((child) => ({
      ...child.props.artwork,
      coordinates: child.props.coordinates,
    }));
    setSelectedArtwork(null);
    setSelectedCluster(clusterArtworks);
  }

  function deselectArtwork() {
    setSelectedArtwork(null);
    goTo("/map");
  }

  function startDirecting() {
    if (!userLocation) {
      const geolocateControl = document.querySelector(
        ".mapboxgl-ctrl-geolocate"
      );
      geolocateControl?.click();
    }
    goTo(`/map/${artId}/track`);
  }

  function ClusterMarker(coordinates, pointCount, getLeaves) {
    return (
      <Marker
        className="ClusterMarker"
        coordinates={coordinates}
        onClick={() => chooseCluster(getLeaves())}
      >
        <p>{pointCount}</p>
      </Marker>
    );
  }

  return (
    <article className="ArtMap">
      <Map
        // eslint-disable-next-line
        style="mapbox://styles/mapbox/light-v10"
        containerStyle={mapStyles}
        center={mapLocation}
        zoom={zoom}
        onStyleLoad={onMapLoad}
        renderChildrenInPortal={true}
      >
        <Cluster ClusterMarkerFactory={ClusterMarker}>
          {artAreasJSON.features.map((feature, key) => (
            <Marker
              coordinates={feature.geometry.coordinates}
              key={key}
              onClick={() =>
                chooseArtworkMarker({
                  ...feature.properties,
                  coordinates: feature.geometry.coordinates,
                })
              }
              artwork={feature.properties}
            >
              <div className="art-marker">
                <p>{feature.properties.rating}</p> <Star />
              </div>
            </Marker>
          ))}
        </Cluster>
        <ScaleControl measurement="mi" />
      </Map>
      <AnimatePresence>
        {cardOpen && (
          <motion.aside
            className="card"
            initial={{ y: "110%" }}
            animate={{ y: "0%" }}
            exit={{ y: "110%" }}
            transition={{ duration: 0.5, type: "tween" }}
          >
            <nav>
              <button className="wrapper">
                <ArrowLeft
                  onClick={() =>
                    viewingArtwork ? deselectArtwork() : setSelectedCluster([])
                  }
                />
              </button>
            </nav>
            <Switch>
              <Route exact path="/map/:artwork">
                <ArtInfo
                  {...selectedArtwork}
                  distance={artDistance}
                  onConfirm={startDirecting}
                />
              </Route>
              <Route exact path="*">
                <ArtChoices
                  artworks={selectedCluster}
                  onArtworkSelected={chooseArtwork}
                />
              </Route>
            </Switch>
          </motion.aside>
        )}
      </AnimatePresence>
      <Route exact path="/map/:artwork/track">
        <DirectionsCard
          {...selectedArtwork}
          distance={artDistance}
          onCancel={goBack}
        />
      </Route>
    </article>
  );
}

/**
 *
 * @param {number[]} p1
 * @param {number[]} p2
 * @returns distance
 */
function getGeoDistance(p1, p2) {
  if (p1[0] === p2[0] && p1[1] === p2[1]) {
    return 0;
  } else {
    p1[1] = (Math.PI * p1[1]) / 180;
    p2[1] = (Math.PI * p2[1]) / 180;
    let theta = (Math.PI * (p1[0] - p2[0])) / 180;
    var dist =
      Math.sin(p1[1]) * Math.sin(p2[1]) +
      Math.cos(p1[1]) * Math.cos(p2[1]) * Math.cos(theta);
    if (dist > 1) {
      dist = 1;
    }
    dist = Math.acos(dist);
    dist = (dist * 180) / Math.PI;
    dist = dist * 60 * 1.1515;
    return Math.round(dist * 100) / 100;
  }
}
