import "./Portfolio.scss";

import { gql, useQuery } from "@apollo/client";
import { useMemo } from "react";
import { useHistory } from "react-router-dom";
import { AlertCircle, Search, ArrowLeft } from "react-feather";
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

interface Artwork {
  title: string,
  pictures: string[]
  id: string
}

interface PortfolioProps {
  title?: string,
  showBackButton?: boolean,
  artworks: Artwork[] | undefined
}

export default function Portfolio({ showBackButton = false, ...props}:PortfolioProps) {
  const history = useHistory();
  return (
    <article className="Portfolio">
      <header>
        {showBackButton && <button className="wrapper" onClick={history.goBack}><ArrowLeft/></button>}
        <h1>{props.title || "Portfolio"}</h1>
      </header>

      <ul className="artworks">
        {!props.artworks ? (
          <CannotFindArtworkMessage />
        ) : !props.artworks.length ? (
          <NoArtworkMessage />
        ) : (
          props.artworks?.map((artwork) => (
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

export function UserPortfolio() {
  const { profile } = useProfileInfo();
  const artworks = usePortfolio(profile?.id);
  return <Portfolio title="Personal Portfolio" artworks={artworks} />;
}

interface ArtworkCardProps {
  title: string,
  pictures: string[],
  onClick: React.MouseEventHandler<HTMLLIElement> 
}

/**
 * Represents single artwork in Portfolio
 */
function ArtworkCard({ title, pictures, onClick }: ArtworkCardProps) {
  return (
    <li className="ArtworkCard" onClick={onClick}>
      <img src={pictures[0]} alt="Artwork" />
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

function usePortfolio(id: string | undefined) {
  const { data } = useQuery(GET_PORTFOLIO, { variables: { id } });
  const portfolio: Artwork[] = useMemo(
    () =>
      data?.users.edges[0]?.node.personalPortfolio.artworks.edges.map(
        ({ node }: {node :Artwork}) => ({
          title: node.title,
          pictures: [node.pictures?.[0]],
          id: node.id,
        })
      ),
    [data]
  );
  return portfolio;
}
