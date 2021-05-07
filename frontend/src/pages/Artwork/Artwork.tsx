import "./Artwork.scss";
import {
  ArrowLeft,
  Upload,
  Maximize2,
  Star,
  MessageSquare,
  AlertCircle,
  Camera,
} from "react-feather";

import ArtReview from "../ArtReview/ArtReview";
import Discussion from "../Discussion/Discussion";
import {
  GET_ARTWORK_DISCUSSION,
  POST_DISCUSSION_MESSAGE,
  GET_ARTWORK,
  artCommentResolver,
  ArtworkQueryData,
} from "./gql";
import MetricBadge from "../../components/MetricBadge/MetricBadge";
import Tag from "../../components/Tag/Tag";
import ConnectionErrorMessage from "../../components/ConnectionErrorMessage/ConnectionErrorMessage";
import { useParams, useHistory, Route, Switch } from "react-router-dom";
import { useQuery } from "@apollo/client";
import Spinner from "../../components/Spinner/Spinner";

export default function Artwork() {
  const { goBack, push } = useHistory();
  const { id } = useParams<{ id: string }>();

  const { loading, error, data } = useQuery<ArtworkQueryData>(GET_ARTWORK, {
    variables: { id },
  });

  if (loading) return <Spinner absCenter={true} />;
  if (error || !data)
    return (
      <ConnectionErrorMessage>
        Could not access the artwork you requested.
      </ConnectionErrorMessage>
    );

  const artwork = data.artwork.edges[0]?.node;

  if (!artwork)
    return (
      <ConnectionErrorMessage>
        Error: Artwork does not exist
      </ConnectionErrorMessage>
    );

  const metrics = [
    { value: artwork.metrics.totalVisits, unit: "Total Visits" },
    { value: artwork.rating / 20, unit: "Stars" },
  ];

  const pic_src = artwork.pictures[0];

  function artPostResolver(postInfo: { message: string; author: string }) {
    return { content: postInfo.message, author: postInfo.author, id };
  }

  return (
    <Switch>
      <Route exact path="/artwork/:id">
        <article className="Artwork">
          <header>
            <img src={pic_src} alt="Art" />
            <button className="wrapper back-button" onClick={goBack}>
              <ArrowLeft />
            </button>
            <h1>{artwork.title}</h1>
            <div className="options">
              <button className="wrapper">
                <Upload />
              </button>
              <button className="wrapper">
                <Maximize2 />
              </button>
            </div>
          </header>

          <div className="content">
            <p className="description">{artwork.description}</p>

            <ul className="tags">
              {artwork.tags?.map((tag) => (
                <li>
                  <Tag key={tag}>{tag}</Tag>
                </li>
              ))}
            </ul>

            <h2>Stats</h2>
            <div className="metric-badges">
              {metrics.map((metric) => (
                <MetricBadge {...metric} />
              ))}
            </div>

            <div className="actions">
              <button onClick={() => push("/artwork/" + id + "/art-review")}>
                <Star />
              </button>
              <button onClick={() => push("/artwork/" + id + "/discussion")}>
                <MessageSquare />
              </button>
              <button onClick={() => push("/artwork/" + id + "/report")}>
                <AlertCircle />
              </button>
              <button>
                <Camera />
              </button>
            </div>
          </div>
        </article>
      </Route>
      <Route exact path="/artwork/:id/art-review">
        <ArtReview artwork={artwork} />
      </Route>
      <Route exact path="/artwork/:id/discussion">
        <Discussion
          fetchQuery={GET_ARTWORK_DISCUSSION}
          fetchVariables={{ id }}
          commentResolver={artCommentResolver}
          postMutation={POST_DISCUSSION_MESSAGE}
          postResolver={artPostResolver}
        />
      </Route>
    </Switch>
  );
}
