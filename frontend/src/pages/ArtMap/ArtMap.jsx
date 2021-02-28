import "./ArtMap.scss";
import ReactMapboxGl, { ScaleControl, Source, Layer } from "react-mapbox-gl";
import { useState } from "react";
import artAreasJSON from "./art-areas.json";
import ArtInfo from "./components/ArtInfo";
import ArtChoices from "./components/ArtChoices";
import { useRouteMatch, useHistory, useParams } from "react-router-dom";
import { X as XIcon, ArrowLeft } from "react-feather";

const Map = ReactMapboxGl({
  accessToken:
    "pk.eyJ1Ijoid2FpZGhvZmVyaiIsImEiOiJja2wwMGNtOHQyMTFqMndqdW9zZ2V3eDB3In0.Ptj-ozNnxV_X6mx5J4DIBA",
});

const mapStyles = {
  width: "100%",
  height: "100%",
  position: "absolute",
  top: 0,
  position: "relative",
};

const geojsonSource = {
  type: "geojson",
  data: artAreasJSON,
  cluster: true,
  clusterMaxZoom: 10,
  clusterRadius: 20,
};

const clusterLayer = {
  id: "clusters",
  type: "circle",
  sourceId: "artworks",
  filter: ["has", "point_count"],
  paint: {
    "circle-color": "#f1f075",
    "circle-radius": 20,
  },
};

const clusterCountLayer = {
  id: "cluster-count",
  type: "symbol",
  sourceId: "artworks",
  filter: ["has", "point_count"],
  layout: {
    "text-field": "{point_count_abbreviated}",
    "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
    "text-size": 12,
  },
};

const unclusteredPoint = {
  id: "unclustered-point",
  type: "circle",
  sourceId: "artworks",
  filter: ["!", ["has", "point_count"]],
  paint: {
    "circle-color": "#11b4da",
    "circle-radius": 4,
    "circle-stroke-width": 1,
    "circle-stroke-color": "#fff",
    "circle-radius": 10,
  },
};

export default function ArtMap() {
  const { artwork } = useParams();
  console.log({ artwork });
  const [location, setLocation] = useState([-122.447372, 37.750411]);
  const [zoom, setZoom] = useState([11]);
  const [selectedCluster, setSelectedCluster] = useState([]);
  const [selectedArtwork, setSelectedArtwork] = useState(-1);

  const { goBack, push: goTo } = useHistory();
  const viewingArtwork = useRouteMatch({ path: "/map/:artwork", exact: true });
  const navigating = useRouteMatch("/map/:artwork/directions");
  console.log({ viewingArtwork, navigating });

  const cardOpen = viewingArtwork || selectedCluster.length;

  function onClusterClick(e) {
    const features = e.target.queryRenderedFeatures(e.point, {
      layers: ["clusters"],
    });
    const clusterId = features[0].properties.cluster_id;
    const pointCount = features[0].properties.point_count;
    e.target
      .getSource("artworks")
      .getClusterLeaves(clusterId, pointCount, 0, function (err, children) {
        console.log(children);
        setSelectedCluster(children.map((c) => c.properties));
      });
  }

  function onArtworkClick(e) {
    setSelectedCluster([e.features[0].properties]);
    setSelectedArtwork(e.features[0].properties.id);
    goTo("/map/" + e.features[0].properties.id);
  }

  function showPointer({ target }) {
    target.getCanvas().style.cursor = "pointer";
  }

  function hidePointer({ target }) {
    target.getCanvas().style.cursor = "";
  }

  return (
    <article className="ArtMap">
      <Map
        // eslint-disable-next-line
        style="mapbox://styles/mapbox/light-v10"
        containerStyle={mapStyles}
        center={location}
        zoom={zoom}
      >
        <Source id="artworks" geoJsonSource={geojsonSource} />
        <Layer
          {...clusterLayer}
          onClick={onClusterClick}
          onMouseEnter={showPointer}
          onMouseLeave={hidePointer}
        />
        <Layer {...clusterCountLayer} />
        <Layer
          {...unclusteredPoint}
          onClick={onArtworkClick}
          onMouseEnter={showPointer}
          onMouseLeave={hidePointer}
        />
        <ScaleControl measurement="mi" />
      </Map>

      {cardOpen && (
        <aside className="card">
          <nav>
            <button className="wrapper" onClick={goBack}>
              {viewingArtwork ? <ArrowLeft /> : <XIcon />}
            </button>
          </nav>
          {viewingArtwork ? (
            <ArtInfo
              {...selectedCluster.filter(({ id }) => id === selectedArtwork)[0]}
            />
          ) : (
            <ArtChoices choices={selectedCluster} />
          )}
        </aside>
      )}
    </article>
  );
}
