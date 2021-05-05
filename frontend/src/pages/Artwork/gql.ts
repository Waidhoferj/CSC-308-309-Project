import { gql } from "@apollo/client";

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
        }
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
export function artCommentResolver(
  data: ArtworkCommentData | undefined
): { picture: string; comments: DiscussionComment[] } {
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
