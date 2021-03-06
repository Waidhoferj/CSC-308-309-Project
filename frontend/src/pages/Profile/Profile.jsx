import "./Profile.scss";
import { MoreHorizontal } from "react-feather";
import MetricBadge from "../../components/MetricBadge/MetricBadge";
import ConnectionErrorMessage from "../../components/ConnectionErrorMessage/ConnectionErrorMessage";
import useProfileInfo from "../../hooks/useProfileInfo";

export default function Profile() {
  const { profile: user, error } = useProfileInfo();
  return (
    <article className="Profile">
      {error ? (
        <ConnectionErrorMessage>
          Error: Couldn't find user info
        </ConnectionErrorMessage>
      ) : (
        <>
          <header>
            <div className="user">
              <img src={user?.profilePic} alt="Profile" />
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
                value={user?.metrics.worksFound}
                unit="Works Found"
              />
              <MetricBadge
                value={user?.metrics.worksVisited}
                unit="Works Visited"
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
