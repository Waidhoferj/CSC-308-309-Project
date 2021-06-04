import { gql } from "@apollo/client";

export const ADD_PHOTOS = gql`
  mutation addPhotos($artworkId: ID!, $pictures_to_add: [String]) {
    updateArtwork(artworkData: { id: $artworkId, pictures: $pictures_to_add }) {
      artwork {
        id
      }
    }
  }
`;

export const GET_ARTWORK_DISCUSSION = gql`
  query getDiscussion($id: ID!) {
    artwork(id: $id) {
      edges {
        node {
          pictures
          comments {
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
    addArtworkComment(
      artworkId: $id
      comment: { content: $content, author: $author }
    ) {
      comment {
        content
      }
    }
  }
`;

export const GET_ARTWORK = gql`
  query getArtwork($id: ID!) {
    artwork(id: $id) {
      edges {
        node {
          pictures
          title
          description
          tags
          id
          metrics {
            totalVisits
          }
          rating
          location {
            coordinates
          }
        }
      }
    }
  }
`;

export const GET_GROUPS = gql`
  query getGroups($userId: ID!) {
    users(id: $userId) {
      edges {
        node {
          groups {
            edges {
              node {
                name
                id
              }
            }
          }
        }
      }
    }
  }
`;

interface GroupOption {
  name: string;
  id: string;
}

/**
 * Reformats data to flat array of group options for adding artwork to group.
 * @param data getGroups() GraphQL query result
 * @returns Array of group options
 */
export function groupOptionsResolver(data: any): GroupOption[] {
  return (
    data?.users.edges?.[0].node.groups.edges.map((e: any) => ({
      name: e.node.name,
      id: e.node.id,
    })) || []
  );
}

export const ADD_ARTWORK_TO_GROUP = gql`
  mutation addArtworkToGroup($artworkId: String!, $groupId: String!) {
    updateGroup(groupData: { id: $groupId, artToAdd: $artworkId }) {
      group {
        id
      }
    }
  }
`;

export interface ArtworkQueryData {
  artwork: {
    edges: {
      node: GqlArtworkData;
    }[];
  };
}

interface ArtworkCommentData {
  artwork: {
    edges: {
      node: {
        pictures: string[];
        comments: {
          edges: {
            node: GqlCommentData;
          }[];
        };
      };
    }[];
  };
}

/**
 * Turns gql data into a list of comments and an image.
 */
export function artCommentResolver(data: ArtworkCommentData | undefined): {
  picture: string;
  comments: DiscussionComment[];
} {
  const comments: DiscussionComment[] | undefined = !data
    ? []
    : data.artwork.edges?.[0].node.comments.edges.map(({ node }) => {
        return {
          content: node.content,
          author: node.author.name,
          datePosted: new Date(node.datePosted),
        };
      });
  const picture = !data ? "" : data.artwork.edges?.[0].node.pictures[0];
  comments.sort((a, b) => a.datePosted.getTime() - b.datePosted.getTime());
  return { comments, picture };
}
