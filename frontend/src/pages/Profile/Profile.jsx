import "./Profile.scss";
import { useQuery, gql } from "@apollo/client";
import { MoreHorizontal, AlertCircle } from "react-feather";
import { useHistory } from "react-router-dom";
import MetricBadge from "../../components/MetricBadge/MetricBadge";
import exampleProfile from "../../assets/example-profile.jpg";

const GET_USER_QUERY = gql`
  query {
    users {
      edges {
        node {
          name
          bio
          metrics {
            worksFound
            worksVisited
            postsWritten
          }
        }
      }
    }
  }
`;
export default function Profile() {
  const { data, loading, error } = useQuery(GET_USER_QUERY);

  const { goBack } = useHistory();
  const user = data?.users.edges[1].node;

  return (
    <article className="Profile">
      {error ? (
        <div className="error-message">
          <AlertCircle size={35} />
          <p>Couldn't find user info</p>
          <button onClick={goBack}>Go Back</button>
        </div>
      ) : (
        <>
          <header>
            <div className="user">
              <img src={exampleProfile} alt="Profile" />
              <h1>{user?.name}</h1>
            </div>
            <div className="options">
              <button className="wrapper">
                <MoreHorizontal size={30} />
              </button>
            </div>
          </header>
          <div className="content">
            <div className="metrics">
              <MetricBadge
                value={user?.metrics.worksVisited}
                unit="Creations"
              />
              <MetricBadge
                value={user?.metrics.worksFound}
                unit="Works Found"
              />
              <MetricBadge
                value={user?.metrics.postsWritten}
                unit="Posts Written"
              />
            </div>

            <h2>Bio</h2>
            <p>{user?.bio}</p>
          </div>
        </>
      )}
    </article>
  );
}