import "./Profile.scss";
import { LogOut } from "react-feather";
import MetricBadge from "../../components/MetricBadge/MetricBadge";
import ConnectionErrorMessage from "../../components/ConnectionErrorMessage/ConnectionErrorMessage";
import useProfileInfo from "../../hooks/useProfileInfo";
import auth from "../../auth";
import { useHistory } from "react-router";
import { gql, useMutation } from "@apollo/client";
import { toast } from "react-toastify";

const CHANGE_PROFILE_PIC_MUTATION = gql`
  mutation changeProfilePic($id: String!, $profilePic: String!) {
    updateUser(userData: { id: $id, profilePic: $profilePic }) {
      user {
        id
      }
    }
  }
`;

export default function Profile() {
  const { profile: user, error, setUser } = useProfileInfo();
  const history = useHistory();
  const [submitProfilePic] = useMutation(CHANGE_PROFILE_PIC_MUTATION);

  function logOut() {
    auth.currentUser()?.logout();
    setUser(null);
    history.push("/login");
  }

  async function changeProfilePic(e) {
    const { files } = e.target;
    if (files.length === 0) {
      return;
    }

    const fr = new FileReader();

    fr.addEventListener(
      "load",
      async function () {
        const payload = {
          id: user.id,
          profilePic: fr.result.toString(),
        };

        try {
          await submitProfilePic({ variables: payload });
          toast("Profile picture updated");
        } catch (err) {
          console.error(err.message);
          toast.error("Cannot submit profile picture.");
        }
      },
      false
    );
    fr.readAsDataURL(files[0]);
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

            <div className="input">
              <label htmlFor="profile_pic">Change Profile Picture</label>
              <br />
              <input
                type="file"
                accept="image"
                name="profile_pic"
                id="profile_pic"
                title=""
                style={{ color: "transparent" }}
                onChange={changeProfilePic}
              />
            </div>
          </div>
        </>
      )}
    </article>
  );
}
