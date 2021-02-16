import "./MetricBadge.scss";

export default function MetricBadge({ value, unit, ...restProps }) {
  return (
    <div className="MetricBadge" {...restProps}>
      <p className="value">{value}</p>
      <p className="unit">{unit}</p>
    </div>
  );
}
