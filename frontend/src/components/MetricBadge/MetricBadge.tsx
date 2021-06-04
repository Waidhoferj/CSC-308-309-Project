import "./MetricBadge.scss";

interface MetricBadgeProps {
  value: string | number;
  unit: string;
  fallbackVal?: string | number;
}

export default function MetricBadge({
  value,
  unit,
  fallbackVal,
  ...restProps
}: MetricBadgeProps) {
  return (
    <div className="MetricBadge" {...restProps}>
      <p className="value">{value ?? fallbackVal}</p>
      <p className="unit">{unit}</p>
    </div>
  );
}
