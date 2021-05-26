import { gql } from "@apollo/client";

export const GROUP_LIST_QUERY = gql`
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
