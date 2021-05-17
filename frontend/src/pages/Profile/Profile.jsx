import "./Profile.scss";
import { LogOut } from "react-feather";
import MetricBadge from "../../components/MetricBadge/MetricBadge";
import ConnectionErrorMessage from "../../components/ConnectionErrorMessage/ConnectionErrorMessage";
import useProfileInfo from "../../hooks/useProfileInfo";
import auth from "../../auth";
import { useHistory } from "react-router";

export default function Profile() {
  const { profile: user, error, setUser } = useProfileInfo();
  const history = useHistory();
  function logOut() {
    auth.currentUser()?.logout();
    setUser(null);
    history.push("/login");
  }

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
                <LogOut size={30} onClick={logOut} />
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
