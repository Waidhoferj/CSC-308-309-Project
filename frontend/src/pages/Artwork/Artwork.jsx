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
import exampleArt from "../../assets/example-art.jpg";
import MetricBadge from "../../components/MetricBadge/MetricBadge";
import Tag from "../../components/Tag/Tag";
import { useParams } from "react-router-dom";
import { gql, useQuery } from '@apollo/client';

const metrics = [{ value: 17, unit: "People Visited" },
            { value: 12, unit: "Related Pieces"},
            { value: 53, unit: "Comments"}];
const rating = 3.2;

export default function Artwork() {
  const { id } = useParams();
  const query = gql`
    query {
      artwork (id:"${id}") {
        edges {
          node {
            title
            description
            tags
          }
        }
      }
    }
  `;

  const { loading, error, data } = useQuery(query);

  if (loading) return (<h1>Loading...</h1>);
  if (error) return (<h1>Error: {error.message}</h1>);

  const artwork = data.artwork.edges[0]?.node;

  if (artwork == undefined) return (<h1>Error: Artwork does not exist</h1>);

  return (
    <article className="Artwork">
      <header>
        <img src={exampleArt} alt="Art" />
        <button className="wrapper back-button">
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
              <Tag>{tag}</Tag>
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
          <button>
            <Star />
          </button>
          <button>
            <MessageSquare />
          </button>
          <button>
            <AlertCircle />
          </button>
          <button>
            <Camera />
          </button>
        </div>
      </div>
    </article>
  );
}
