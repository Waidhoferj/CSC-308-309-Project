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

export function resolveGroups(data: any) {
  return (
    data?.users.edges?.[0].node.groups.edges.map(({ node: group }: any) => ({
      name: group.name,
      metrics: group.metrics,
      id: group.id,
      pictures: group.groupPortfolio.artworks.edges.flatMap(
        ({ node: work }: any) => work.pictures
      ),
    })) || []
  );
}

export const CREATE_GROUP_MUTATION = gql`
  mutation createGroup($name: String!, $bio: String!, $creator: String!) {
    createGroup(groupData: { name: $name, memberToAdd: $creator, bio: $bio }) {
      group {
        id
      }
    }
  }
`;
