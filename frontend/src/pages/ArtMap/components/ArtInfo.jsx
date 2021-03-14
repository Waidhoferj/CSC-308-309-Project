import MetricBadge from "../../../components/MetricBadge/MetricBadge";
import Tag from "../../../components/Tag/Tag";

export default function ArtInfo({
  description,
  rating,
  title,
  tags = [],
  metrics,
  distance,
  onConfirm,
  id,
}) {
  return (
    <div className="ArtInfo">
      <h2>{title}</h2>
      <p>{description}</p>
      <div className="metrics">
        {rating ? <MetricBadge value={rating} unit="star rating" /> : null}
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
      <button onClick={onConfirm}>Let's Go</button>
    </div>
  );
}
