import "./Tag.scss";
const noop = () => 0;
export default function Tag({ children, onClick = noop }) {
  return (
    <span className="Tag" onClick={onClick}>
      {children}
    </span>
  );
}
