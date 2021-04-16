import MetricBadge from "../../../components/MetricBadge/MetricBadge";
import Tag from "../../../components/Tag/Tag";
import { useHistory } from "react-router-dom";

export default function ArtInfo({
  description,
  rating,
  title,
  tags = [],
  metrics,
  distance,
  onConfirm,
  visited,
  id,
}) {
  const history = useHistory();
  return (
    <div className="ArtInfo">
      <h2>{title}</h2>
      <p>{description}</p>
      <div className="metrics">
        {rating ? <MetricBadge value={rating} unit="star rating" /> : null}
        {metrics?.totalRatings ? (
          <MetricBadge value={metrics.totalRatings} unit="ratings" />
        ) : null} 
        {metrics?.totalVisits ? (
          <MetricBadge value={metrics.totalVisits} unit="visitors" />
        ) : null}
        {distance ? <MetricBadge value={distance} unit="miles away" /> : null}
      </div>

      {tags.length ? (
        <ul className="wrapper">
          {tags.map((tag) => (
            <Tag key={tag}>{tag}</Tag>
          ))}
        </ul>
      ) : null}
      {visited ? (
        <button onClick={() => history.push("/artwork/" + id)}>
          View In Portfolio
        </button>
      ) : (
        <button onClick={onConfirm}>Let's Go</button>
      )}
    </div>
  );
}
