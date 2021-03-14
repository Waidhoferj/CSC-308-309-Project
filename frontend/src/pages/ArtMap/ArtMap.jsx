import "./ArtMap.scss";
import { useEffect, useMemo, useState } from "react";

import ArtInfo from "./components/ArtInfo";
import ArtChoices from "./components/ArtChoices";
import DirectionsCard from "./components/DirectionsCard";
import queries from "./queries";

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
import { useQuery, useMutation } from "@apollo/client";

const Map = ReactMapboxGl({
  accessToken:
    "pk.eyJ1Ijoid2FpZGhvZmVyaiIsImEiOiJja2wwMGNtOHQyMTFqMndqdW9zZ2V3eDB3In0.Ptj-ozNnxV_X6mx5J4DIBA",
});

const claimableDistance = 0.15; // miles

const mapStyles = {
  width: "100%",
  height: "100%",
  position: "absolute",
  top: 0,
};

export default function ArtMap() {
  const { artwork: artId } = useParams();
  const { loading: loadingArt, data: rawArtData } = useQuery(
    queries.getArtworks
  );

  const [mapLocation, setMapLocation] = useState([-120.666132, 35.311089]);
  const [userLocation, setUserLocation] = useState(null);
  const [zoom, setZoom] = useState([11]);
  const [selectedCluster, setSelectedCluster] = useState([]);
  const [selectedArtwork, setSelectedArtwork] = useState(null);
  const artDistance =
    userLocation && selectedArtwork
      ? getGeoDistance(userLocation, selectedArtwork.coordinates)
      : null;

  const [addArtworkToPortfolio] = useMutation(queries.addArtworkToPortfolio);
  const { push: goTo, goBack } = useHistory();
  const viewingArtwork = useRouteMatch({ path: "/map/:artwork", exact: true });
  const navigating = useRouteMatch("/map/:artwork/track");
  const cardOpen = (viewingArtwork || selectedCluster.length) && !navigating;
  const cardScreenAnimation = {
    className: "absolute",
    key: !!selectedArtwork,
    transition: { duration: 0.4, type: "tween" },
    initial: { x: !!selectedArtwork ? 300 : -300, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { scale: 0.7, opacity: 0 },
  };

  // Reformats the fetched data into a more manageable structure.
  const artworkData = useMemo(() => {
    return rawArtData?.artwork.edges.map(
      ({
        node: { title, id, description, rating, metrics, tags, location },
      }) => ({
        id,
        title,
        description,
        coordinates: [...location.coordinates],
        rating: (Math.round(rating) / 100) * 5,
        metrics,
        tags,
      })
    );
  }, [loadingArt, navigating]);

  useEffect(
    function handleDirectNavigation() {
      // If the art should be shown and the art is available
      if ((viewingArtwork || navigating) && !selectedArtwork && !loadingArt) {
        const targetArt = artworkData?.find((art) => art.id === artId);
        setSelectedArtwork({
          ...targetArt,
        });
      }
    },
    [viewingArtwork, navigating, artId, selectedArtwork, loadingArt]
  );

  /**
   * Called when map has initialized. Used for instantiating plugins and controls.
   * @param {*} map mapbox instance
   */
  function onMapLoad(map) {
    const geoControl = new GeolocateControl({ trackUserLocation: true });
    map.addControl(geoControl);

    geoControl.on("geolocate", (e) => {
      setUserLocation([e.coords.longitude, e.coords.latitude]);
    });
  }

  /**
   * Selects a single piece of artwork and deselects any clusters.
   * @param {*} artwork Data of single artwork
   */
  function chooseArtworkMarker(artwork) {
    setSelectedCluster([]);
    chooseArtwork(artwork);
  }

  /**
   * Selects a target artwork.
   * @param {*} artwork A single piece of artwork
   */
  function chooseArtwork(artwork) {
    setSelectedArtwork(artwork);
    goTo("/map/" + artwork.id);
    setZoom([15]);
    setMapLocation([...artwork.coordinates]);
  }

  /**
   * Opens card displaying all artworks that belong to the selected cluster.
   * @param {*} children mapbox nodes that belong to the cluster
   */
  function chooseCluster(children) {
    const clusterArtworks = children.map((child) => ({
      ...child.props.artwork,
    }));
    setSelectedArtwork(null);
    setSelectedCluster(clusterArtworks);
    goTo("/map");
  }

  function deselectArtwork() {
    setSelectedArtwork(null);
    goTo("/map");
  }

  /**
   * Triggers user location services and opens directions screen.
   */
  function startDirecting() {
    if (!userLocation) {
      const geolocateControl = document.querySelector(
        ".mapboxgl-ctrl-geolocate"
      );
      geolocateControl?.click();
    }
    goTo(`/map/${artId}/track`);
  }
  /**
   * Adds selected artwork to user portfolio. Only should be called when within claim distance.
   */
  function claimArtwork() {
    addArtworkToPortfolio({
      variables: {
        userId: "VXNlclR5cGU6am9obkBqb2huLmNvbQ==",
        artId: selectedArtwork?.id,
      },
    });
    goTo("/artwork/" + selectedArtwork.id);
  }

  /**
   * Represents a group of artworks on the map.
   * @param {*} coordinates position of cluster marker
   * @param {*} pointCount Number of artworks under the cluster
   * @param {*} getLeaves Returns artwork nodes that belong to the cluster
   * @returns A cluster marker
   */
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
        {rawArtData && (
          <Cluster
            ClusterMarkerFactory={ClusterMarker}
            zoomOnClick={true}
            zoomOnClickPadding={200}
            radius={55}
          >
            {artworkData.map((artwork, key) => (
              <Marker
                coordinates={artwork.coordinates}
                key={key}
                onClick={() => chooseArtworkMarker(artwork)}
                artwork={artwork}
              >
                <div className="art-marker">
                  <p>{artwork.rating}</p> <Star />
                </div>
              </Marker>
            ))}
          </Cluster>
        )}
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
            <AnimatePresence>
              <div className="content">
                <Switch>
                  <Route exact path="/map/:artwork">
                    <motion.div {...cardScreenAnimation}>
                      <ArtInfo
                        {...selectedArtwork}
                        distance={artDistance}
                        onConfirm={startDirecting}
                      />
                    </motion.div>
                  </Route>
                  <Route exact path="*">
                    <motion.div {...cardScreenAnimation}>
                      <ArtChoices
                        artworks={selectedCluster}
                        onArtworkSelected={chooseArtwork}
                      />
                    </motion.div>
                  </Route>
                </Switch>
              </div>
            </AnimatePresence>
          </motion.aside>
        )}
      </AnimatePresence>
      <AnimatePresence>
        <Route exact path="/map/:artwork/track">
          {selectedArtwork && (
            <DirectionsCard
              {...selectedArtwork}
              distance={artDistance}
              onCancel={goBack}
            />
          )}

          {artDistance && artDistance < claimableDistance && (
            <motion.button
              className="claim-button"
              onClick={claimArtwork}
              variants={{
                active: { transform: "translate(-50%, 0)", opacity: 1 },
                inactive: { transform: "translate(-50%, 120px", opacity: 0 },
              }}
              animate="active"
              initial="inactive"
              exit="inactive"
            >
              Add to Portfolio
            </motion.button>
          )}
        </Route>
      </AnimatePresence>
    </article>
  );
}

/**
 * Gets the distance in miles between two [lon, lat] points
 * @param {number[]} p1
 * @param {number[]} p2
 * @returns distance
 */
function getGeoDistance(point1, point2) {
  let p1 = [...point1];
  let p2 = [...point2];
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
