import { gql } from "@apollo/client";

export const GET_GROUP_QUERY = gql`
  query getGroup($id: ID!) {
    groups(id: $id) {
      edges {
        node {
          name
          bio
          metrics {
            artworkCount
            memberCount
          }
          groupPortfolio {
            artworks(first: 7) {
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

export const GET_COMMENTS_QUERY = gql`
  query getComments($id: ID!) {
    groups(id: $id) {
      edges {
        node {
          chat {
            edges {
              node {
                content
                datePosted
                author {
                  name
                }
              }
            }
          }
        }
      }
    }
  }
`;

export const POST_DISCUSSION_MESSAGE = gql`
  mutation postMessage($id: ID!, $content: String!, $author: ID!) {
    addGroupComment(
      groupId: $id
      comment: { content: $content, author: $author }
    ) {
      comment {
        content
      }
    }
  }
`;

export interface GqlGroupData {
  groups: {
    edges: {
      node: {
        name: string;
        bio: string;
        metrics: {
          artworkCount: number;
          memberCount: number;
        };
        groupPortfolio: {
          artworks: {
            edges: {
              node: {
                id: string;
                title: string;
                pictures: string[];
              };
            }[];
          };
        };
      };
    }[];
  };
}

interface Artwork {
  title: string;
  pictures: string[];
  id: string;
}

interface Group {
  name: string;
  bio: string;
  metrics: {
    artworkCount: number;
    memberCount: number;
  };
  artworks: Artwork[];
}

export function groupResolver(data: GqlGroupData): Group | undefined {
  const group = data?.groups.edges?.[0].node;
  const artworks: Artwork[] = group?.groupPortfolio.artworks.edges.map(
    ({ node }: { node: Artwork }) => ({
      title: node.title,
      pictures: node.pictures,
      id: node.id,
    })
  );
  return (
    group && {
      name: group.name,
      bio: group.bio,
      metrics: group.metrics,
      artworks,
    }
  );
}

export function groupCommentsResolver(
  data: any
): { comments: DiscussionComment[]; picture?: string } {
  const comments: DiscussionComment[] = !data
    ? []
    : data.groups.edges?.[0].node.chat.edges.map(({ node }: { node: any }) => ({
        content: node.content,
        author: node.author.name,
        datePosted: new Date(node.datePosted),
      }));
  return { comments };
}
