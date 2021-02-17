import "./ArtMap.scss";
import ReactMapboxGl, { ScaleControl, GeoJSONLayer } from "react-mapbox-gl";
import { useState } from "react";
import artAreasJSON from "./art-areas.json"

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

function handleClick() {}  // Needs functionality

export default function ArtMap() {
  const [location, setLocation] = useState([-122.447372, 37.750411]);
  const [zoom, setZoom] = useState([11]);

  return (
    <article className="ArtMap">
      <Map
        // eslint-disable-next-line
        style="mapbox://styles/mapbox/light-v10"
        containerStyle={mapStyles}
        center={location}
        zoom={zoom}
      >
        <GeoJSONLayer
          data={artAreasJSON}
          circlePaint={{
            "circle-color": ["get", "color"],
            "circle-radius": [
              "interpolate",
              ["linear"],
              ["zoom"],
              10,
              5,
              100,
              1500
            ],
            "circle-opacity": 0.4,
            "circle-stroke-color": ["get", "color"],
            "circle-stroke-width": 2,
            "circle-stroke-opacity": 1
          }}
          circleOnClick={handleClick}
        />
        <ScaleControl measurement="mi" />
      </Map>
    </article>
  );
}
