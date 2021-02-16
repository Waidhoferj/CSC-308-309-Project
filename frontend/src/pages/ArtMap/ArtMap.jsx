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
          /*
          symbolLayout={{
            "text-field": "hello",
            "text-font": ["Open Sans Semibold"],
            "text-offset": [0, 0.6],
            "text-anchor": "top"
          }}
          */
          fillLayout={{visibility: "visible"}}
          fillPaint={{
            "fill-color": "blue",
            "fill-opacity": 1,
          }}
        />
        <ScaleControl measurement="mi" />
      </Map>
    </article>
  );
}
