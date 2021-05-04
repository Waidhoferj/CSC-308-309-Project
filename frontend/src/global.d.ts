interface DiscussionComment {
  author: String;
  content: String;
  datePosted: Date;
}

type GqlCommentData = {
  content: string;
  datePosted: string;
  author: {
    name: string;
  };
};

interface GqlArtworkData {
  pictures: string[];
  title: string;
  description: string;
  tags: string[];
  id: string;
  metrics: {
    totalVisits: number;
  };
  rating: number;
}
