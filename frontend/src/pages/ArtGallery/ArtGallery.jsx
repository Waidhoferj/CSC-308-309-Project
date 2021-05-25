import { GET_ARTWORK } from "../Artwork/gql.ts";

import { gql, useQuery } from '@apollo/client';
import { ArrowLeft } from "react-feather";
import { useHistory } from "react-router-dom";
import AwesomeSlider from 'react-awesome-slider';
import 'react-awesome-slider/dist/styles.css';
import AwesomeSliderStyles from 'react-awesome-slider/src/styles';


export default function ArtGallery() {
    const {loading, error, data }= useQuery(GET_ARTWORK);
    console.log(data);

    const history = useHistory();

    return (
        <section className="ArtGallery">
          <nav>
            <button className="wrapper" onClick={history.goBack}>
              <ArrowLeft />
            </button>
          </nav>

          {/* <AwesomeSlider cssModule={AwesomeSliderStyles}>
            <div data-src="/../../../../backend/assets/sample-artworks/camila-waz-2l5U8g4f8hQ-unsplash.jpg" />
            <div data-src="/path/to/image-1.png" />
            <div data-src="/path/to/image-2.jpg" />
            <img src="https://gravatar.com/avatar/nothing" />
            <img src="../../../../backend/assets/sample-artworks/camila-waz-2l5U8g4f8hQ-unsplash.jpg" />
          </AwesomeSlider> */}
        </section>
    );
}