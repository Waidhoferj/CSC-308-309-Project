import "./Portfolio.scss";

import { gql, useQuery } from "@apollo/client";
import { useMemo } from "react";
import { useHistory } from "react-router-dom";

const GET_PORTFOLIO = gql`
  query getPortfolio($id: ID!) {
    users(id: $id) {
      edges {
        node {
          personalPortfolio {
            artworks {
              edges {
                node {
                  id
                  title
                  pictures
                }
              }
            }
          }
        }
      }
    }
  }
`;

export default function Portfolio() {
  const artworks = usePortfolio("VXNlclR5cGU6Z3JhbnRAZ3JhbnQuY29t");
  const history = useHistory();
  return (
    <article className="Portfolio">
      <header>
        <h1>Portfolio</h1>
      </header>

      <ul className="artworks">
        {artworks?.map((artwork) => (
          <ArtworkCard
            key={artwork.title}
            {...artwork}
            onClick={() => history.push("/artwork/" + artwork.id)}
          />
        ))}
      </ul>
    </article>
  );
}

function ArtworkCard({ title, picture, onClick }) {
  return (
    <li className="ArtworkCard" onClick={onClick}>
      <img src={picture} alt="Artwork" />
      <h2 className="title">{title}</h2>
    </li>
  );
}

function usePortfolio(id) {
  const { data } = useQuery(GET_PORTFOLIO, { variables: { id } });
  const portfolio = useMemo(
    () =>
      data?.users.edges[0]?.node.personalPortfolio.artworks.edges.map(
        ({ node }) => ({
          title: node.title,
          picture: node.pictures?.[0],
          id: node.id,
        })
      ),
    [data]
  );
  return portfolio;
}
