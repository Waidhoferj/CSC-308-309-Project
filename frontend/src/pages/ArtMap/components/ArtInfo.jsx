import { useLocation } from "react-router-dom";

import MetricBadge from "../../../components/MetricBadge/MetricBadge";
import Tag from "../../../components/Tag/Tag";

export default function ArtInfo({ description, rating, title, tags }) {
  console.log({ tags });
  return (
    <div className="ArtInfo">
      <h1>{title}</h1>
      <p>{description}</p>
      <div className="metrics">
        <MetricBadge value={rating} unit="star rating" />
      </div>

      {tags && (
        <ul>
          {tags.map((tag) => (
            <Tag key={tag} {...tag} />
          ))}
        </ul>
      )}
      <button>Let's Go</button>
    </div>
  );
}
