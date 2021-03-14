import { useQuery, gql } from "@apollo/client";
import { useEffect, useState } from "react";

let uid = "";
let listeners = [];
const GET_USER_QUERY = gql`
  query fetchUser($id: ID!) {
    users(id: $id) {
      edges {
        node {
          name
          bio
          profilePic
          metrics {
            worksFound
            worksVisited
          }
        }
      }
    }
  }
`;

/**
 *
 * @returns {{profile: {name : string, bio : string, profilePic:string, metrics : {worksFound: number, worksVisited: number}}, error: object, setUser: function}} A user profile and any errors that may have occurred in fetching
 */
export default function useProfileInfo() {
  const listener = useState(Date.now())[1];
  const { data, error } = useQuery(GET_USER_QUERY, {
    variables: { id: uid },
  });
  const profile = data?.users.edges[0].node;

  function setUser(id) {
    uid = id;
    listeners.forEach((l) => l(Date.now()));
  }

  useEffect(() => {
    listeners.push(listener);
    return () => (listeners = listeners.filter((l) => l !== listener));
  }, [listener]);

  return { profile, error, setUser };
}
