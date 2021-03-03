import "./MetricBadge.scss";

export default function MetricBadge({
  value,
  unit,
  fallbackVal,
  ...restProps
}) {
  return (
    <div className="MetricBadge" {...restProps}>
      <p className="value">{value || fallbackVal}</p>
      <p className="unit">{unit}</p>
    </div>
  );
}
