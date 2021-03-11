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
import ConnectionErrorMessage from "../../components/ConnectionErrorMessage/ConnectionErrorMessage";
import { useParams, useHistory } from "react-router-dom";
import { gql, useQuery } from '@apollo/client';

const rating = 3.2;

export default function Artwork() {
  const { goBack } = useHistory();
  const { id } = useParams();
  const query = gql`
    query {
      artwork (id:"${id}") {
        edges {
          node {
            title
            description
            tags
            metrics {
              totalVisits
            }
          }
        }
      }
    }
  `;

  const { loading, error, data } = useQuery(query);

  if (loading) return (<h1>Loading...</h1>);
  if (error) return (<ConnectionErrorMessage>Error: {error.message}</ConnectionErrorMessage>);

  const artwork = data.artwork.edges[0]?.node;

  if (artwork == undefined) return (<ConnectionErrorMessage>Error: Artwork does not exist</ConnectionErrorMessage>);

  const metrics = [{ value: artwork.metrics.totalVisits, unit: "Total Visits" },];

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
