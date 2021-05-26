import { GET_ARTWORK, ArtworkQueryData } from "../Artwork/gql";

import { gql, useQuery } from '@apollo/client';
import { ArrowLeft } from "react-feather";
import { useParams, useHistory, Route, Switch } from "react-router-dom";
import AwesomeSlider from 'react-awesome-slider';
import 'react-awesome-slider/dist/styles.css';
import 'react-awesome-slider/dist/custom-animations/cube-animation.css';


export default function ArtGallery() {
    const history = useHistory();
    const { id } = useParams<{ id: string }>();

    const { loading, error, data } = useQuery<ArtworkQueryData>(GET_ARTWORK, {
      variables: { id },
    });

    console.log("data is ");
    console.log(data);

    let picture: string;
    //for (picture: data?.artwork.edges[0].node)

    const artwork = data?.artwork.edges[0].node.pictures[0];

    console.log("artwork is" + artwork);


    return (
        <section className="ArtGallery">
          <nav>
            <button className="wrapper" onClick={history.goBack}>
              <ArrowLeft />
            </button>
          </nav>

          <img src={artwork} />

          <AwesomeSlider>
            <div data-src={artwork} />
          </AwesomeSlider>

        </section>
    );
}