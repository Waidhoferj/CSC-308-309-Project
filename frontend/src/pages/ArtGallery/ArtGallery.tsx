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

    //const pictures = data?.artwork.edges[0].node.pictures;
    // const pictures = [...data?.artwork.edges[0].node.pictures];

    const pictures = data?.artwork.edges[0].node.pictures;

    //Why is the len of this always 1? 
    console.log("pics len is" + pictures?.length);
    console.log ("from server, pics len is" + data?.artwork.edges[0].node.pictures.length);


    const picturelist = pictures?.map((picture, index) => {
      return <div data-src={picture} key={`slider-${index}`}/>
    })

    return (
        <section className="ArtGallery">
          <nav>
            <button className="wrapper" onClick={history.goBack}>
              <ArrowLeft />
            </button>
          </nav>

          {/*  
          <AwesomeSlider animation="cubeAnimation">
            {picturelist}
          </AwesomeSlider>
          */}

          <AwesomeSlider animation="cubeAnimation">
            {pictures?.map((picture) => 
              <div data-src={picture} /> 
            )}
          </AwesomeSlider> 

      

        </section>
    );
}