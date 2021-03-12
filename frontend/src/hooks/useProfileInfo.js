import { useQuery, gql } from "@apollo/client";

const GET_USER_QUERY = gql`
  query fetchUser($id: ID!) {
    users(id: $id) {
      edges {
        node {
          name
          bio
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
 * @param {string} id User ID
 * @returns {{profile: {name : string, bio : string, metrics : {worksFound: number, worksVisited: number}}, error: object}} A user profile and any errors that may have occurred in fetching
 */
export default function useProfileInfo(id) {
  const { data, error } = useQuery(GET_USER_QUERY, {
    variables: { id },
  });
  const profile = data?.users.edges[0].node;
  return { profile, error };
}
