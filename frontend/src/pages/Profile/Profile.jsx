import "./Profile.scss";
import { useQuery } from "@apollo/client";
import { MoreHorizontal } from "react-feather";
import MetricBadge from "../../components/MetricBadge/MetricBadge";
import exampleProfile from "../../assets/example-profile.jpg";

export default function Profile() {
  return (
    <article className="Profile">
      <header>
        <div className="user">
          <img src={exampleProfile} alt="Profile" />
          <h1>User</h1>
        </div>
        <div className="options">
          <button className="wrapper">
            <MoreHorizontal size={30} />
          </button>
        </div>
      </header>
      <div className="content">
        <div className="metrics">
          <MetricBadge value={23} unit="Creations" />
          <MetricBadge value={104} unit="Works Found" />
          <MetricBadge value={2063} unit="Posts Written" />
        </div>

        <h2>Bio</h2>
        <p>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Iste dolorem
          unde ex sit veritatis suscipit voluptatum aliquam harum similique
          exercitationem, fuga aspernatur dolores repudiandae facere voluptatem
          eum, delectus natus molestiae!
        </p>
      </div>
    </article>
  );
}
