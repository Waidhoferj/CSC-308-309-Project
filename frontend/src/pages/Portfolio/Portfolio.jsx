import "./Portfolio.scss";

import { gql, useQuery } from "@apollo/client";
import { useMemo } from "react";
import { useHistory } from "react-router-dom";
import { AlertCircle, Search } from "react-feather";
import useProfileInfo from "../../hooks/useProfileInfo";

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
  const { profile } = useProfileInfo();
  const artworks = usePortfolio(profile.id);
  const history = useHistory();
  return (
    <article className="Portfolio">
      <header>
        <h1>Portfolio</h1>
      </header>

      <ul className="artworks">
        {!artworks ? (
          <CannotFindArtworkMessage />
        ) : !artworks.length ? (
          <NoArtworkMessage />
        ) : (
          artworks?.map((artwork) => (
            <ArtworkCard
              key={artwork.title}
              {...artwork}
              onClick={() => history.push("/artwork/" + artwork.id)}
            />
          ))
        )}
      </ul>
    </article>
  );
}

/**
 * Represents single artwork in Portfolio
 */
function ArtworkCard({ title, picture, onClick }) {
  return (
    <li className="ArtworkCard" onClick={onClick}>
      <img src={picture} alt="Artwork" />
      <h2 className="title">{title}</h2>
    </li>
  );
}

function NoArtworkMessage() {
  const history = useHistory();
  return (
    <div className="message">
      <Search />
      <p>
        This is where you can view all of your discovered artwork. Start
        exploring to fill your portfolio.
      </p>
      <button onClick={() => history.push("/map")}>Discover Art</button>
    </div>
  );
}

function CannotFindArtworkMessage() {
  return (
    <div className="message">
      <AlertCircle />
      <p>
        Oops something went wrong. Check your connection and reload the page.
      </p>
    </div>
  );
}

/**
 * Grabs necessary artwork portfolio data from the server.
 * @param {string} id
 * @returns {{title: string, picture: string, id: string}} artwork portfolio info
 */
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
