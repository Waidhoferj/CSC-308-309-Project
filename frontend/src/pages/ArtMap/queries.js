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
};

export default queries;
