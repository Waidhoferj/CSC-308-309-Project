import "./GroupsList.scss";
import { useQuery, gql } from "@apollo/client";
import useProfileInfo from "../../../hooks/useProfileInfo";
import ConnectionErrorMessage from "../../../components/ConnectionErrorMessage/ConnectionErrorMessage";
import Spinner from "../../../components/Spinner/Spinner";
import { motion } from "framer-motion";
import { useMemo } from "react";
import { useHistory } from "react-router";

const GROUP_LIST_QUERY = gql`
  query getGroups($id: ID!) {
    users(id: $id) {
      edges {
        node {
          groups {
            edges {
              node {
                name
                id
                metrics {
                  artworkCount
                  memberCount
                }
                groupPortfolio {
                  artworks(first: 4) {
                    edges {
                      node {
                        pictures
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`;

export default function GroupsList() {
  let { loading, groups } = useGroupList();
  let history = useHistory();
  function openGroup(id) {
    history.push("group/" + id);
  }

  return (
    <article className="GroupsList">
      <header>
        <h1>Groups</h1>
      </header>
      {loading ? (
        <div className="spinner">
          <Spinner />
        </div>
      ) : groups.length ? (
        <ul className="groups">
          {groups.map((group, key) => (
            <GroupCard
              key={key}
              {...group}
              onClick={() => openGroup(group.id)}
            />
          ))}
        </ul>
      ) : (
        <ConnectionErrorMessage>
          Doesn't look like you've joined any groups
        </ConnectionErrorMessage>
      )}
    </article>
  );
}

function useGroupList() {
  const { profile } = useProfileInfo();
  const { loading, data } = useQuery(GROUP_LIST_QUERY, {
    variables: { id: profile?.id },
  });
  const groups = useMemo(
    () =>
      data?.users.edges?.[0].node.groups.edges.map(({ node: group }) => ({
        name: group.name,
        metrics: group.metrics,
        id: group.id,
        pictures: group.groupPortfolio.artworks.edges.flatMap(
          ({ node: work }) => work.pictures
        ),
      })) || [],
    [data]
  );
  return { loading, groups };
}

function GroupCard({ name, pictures, metrics, id, onClick }) {
  return (
    <li className="GroupCard" onClick={onClick}>
      <div className="images">
        {pictures.map((picture, key) => (
          <img key={key} src={picture} />
        ))}
      </div>
      <motion.div className="info" whileTap={{ scale: 0.9 }}>
        <h2>{name}</h2>
        <div className="metrics">
          <p>{metrics.memberCount} members</p>
          <p>{metrics.artworkCount} artworks</p>
        </div>
      </motion.div>
    </li>
  );
}
