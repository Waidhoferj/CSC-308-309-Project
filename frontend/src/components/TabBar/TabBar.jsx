import "./TabBar.scss";
import { User, Camera, BookOpen, Map } from "react-feather";
import { Link } from "react-router-dom";

const routes = [
  { to: "/map", Icon: Map },
  { to: "/portfolio", Icon: BookOpen },
  { to: "/camera", Icon: Camera },
  { to: "/profile", Icon: User },
];

export default function TabBar() {
  return (
    <nav className="TabBar">
      <ul>
        {routes.map(({ to, Icon }) => (
          <li>
            <Link to={to}>
              <Icon />
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
