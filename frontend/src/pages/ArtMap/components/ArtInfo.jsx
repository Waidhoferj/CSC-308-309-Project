import MetricBadge from "../../../components/MetricBadge/MetricBadge";
import Tag from "../../../components/Tag/Tag";

export default function ArtInfo({
  description,
  rating,
  title,
  tags,
  visitors,
  distance,
  onConfirm,
}) {
  return (
    <div className="ArtInfo">
      <h2>{title}</h2>
      <p>{description}</p>
      <div className="metrics">
        <MetricBadge value={rating} unit="star rating" />
        <MetricBadge value={visitors} unit="visitors" />
        {distance && <MetricBadge value={distance} unit="miles away" />}
      </div>

      {tags && (
        <ul className="wrapper">
          {tags.map((tag) => (
            <Tag key={tag}>{tag}</Tag>
          ))}
        </ul>
      )}
      <button onClick={onConfirm}>Let's Go</button>
    </div>
  );
}
