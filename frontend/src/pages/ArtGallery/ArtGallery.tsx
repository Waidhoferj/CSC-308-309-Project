import "./ArtGallery.scss";

import { GET_ARTWORK, ArtworkQueryData } from "../Artwork/gql";

import { useQuery } from "@apollo/client";
import { ArrowLeft } from "react-feather";
import { useParams, useHistory } from "react-router-dom";
import ImageGallery from "react-image-gallery";
import "react-image-gallery/styles/scss/image-gallery.scss";

export default function ArtGallery() {
  const history = useHistory();
  const { id } = useParams<{ id: string }>();

  const { data } = useQuery<ArtworkQueryData>(GET_ARTWORK, {
    variables: { id },
  });

  const pictures = data?.artwork.edges[0].node.pictures;

  const pictureObjs = pictures?.map((picture) => {
    return { original: picture, thumbnail: picture };
  });

  return (
    <section className="ArtGallery">
      <nav>
        <button
          className="wrapper"
          onClick={history.goBack}
          style={{ color: "black" }}
        >
          <ArrowLeft />
        </button>
      </nav>

      {pictureObjs instanceof Array && (
        <ImageGallery items={pictureObjs} showThumbnails={true} />
      )}
    </section>
  );
}
