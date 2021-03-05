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

const artwork = {
  title: "Some Artwork",
  description:
    "Lorem ipsum dolor sit amet consectetur, adipisicing elit. Laboriosam est atque, similique dignissimos itaque ipsum, nemo, dolore modi tempore esse voluptatem temporibus? Recusandae molestias dolor non beatae nobis enim debitis!",
  tags: ["very", "noice", "tag3"],
  metrics: [{ value: 17, unit: "People Visited" },
            { value: 12, unit: "Related Pieces"},
            { value: 53, unit: "Comments"}],
  rating: 3.2,
};

export default function Artwork() {
  return (
    <article className="Artwork">
      <header>
        <img src={exampleArt} alt="Art" />
        <button className="wrapper back-button">
          <ArrowLeft />
        </button>
        <h1>Artwork</h1>
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
          {artwork.tags.map((tag) => (
            <li>
              <Tag>{tag}</Tag>
            </li>
          ))}
        </ul>

        <h2>Stats</h2>
        <div className="metric-badges">
          {artwork.metrics.map((metric) => (
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
