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
};

export default queries;
