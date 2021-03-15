import { gql } from "@apollo/client";

const queries = {
  getArtworks: gql`
    query {
      artwork {
        edges {
          node {
            id
            title
            description
            rating
            tags
            metrics {
              totalVisits
            }
            location {
              coordinates
            }
          }
        }
      }
    }
  `,
  addArtworkToPortfolio: gql`
    mutation addArtwork($userId: String!, $artId: String!) {
      updateUser(userData: { id: $userId, artToAdd: $artId }) {
        user {
          id
        }
      }
    }
  `,
  getSeenArtworkIds: gql`
    query getSeenArt($id: ID!) {
      users(id: $id) {
        edges {
          node {
            personalPortfolio {
              artworks {
                edges {
                  node {
                    id
                  }
                }
              }
            }
          }
        }
      }
    }
  `,
};

export default queries;
