import "./GroupPage.scss";
import { useQuery, useMutation } from "@apollo/client";
import {
  GET_GROUP_QUERY,
  GET_COMMENTS_QUERY,
  POST_DISCUSSION_MESSAGE,
  LEAVE_GROUP,
  JOIN_GROUP,
  CHECK_MEMBERSHIP,
  groupResolver,
  groupCommentsResolver,
  Group,
} from "./gql";
import { ArrowLeft, MessageSquare, BookOpen } from "react-feather";
import MetricBadge from "../../../components/MetricBadge/MetricBadge";
import Spinner from "../../../components/Spinner/Spinner";
import { Switch, useHistory, useParams } from "react-router-dom";
import { useMemo, useState } from "react";
import ConnectionErrorMessage from "../../../components/ConnectionErrorMessage/ConnectionErrorMessage.jsx";
import { Route } from "react-router-dom";
import Portfolio from "../../Portfolio/Portfolio";
import Discussion from "../../Discussion/Discussion";
import useProfileInfo from "../../../hooks/useProfileInfo";

/**
 * Wrapper component around individual group activities.
 */
export default function GroupPage() {
  const { id } = useParams<{ id: string }>();
  const { data, error, loading } = useQuery(GET_GROUP_QUERY, {
    variables: { id },
  });
  const group = useMemo(() => groupResolver(data), [data]);

  function groupPostResolver(postInfo: { message: string; author: string }) {
    return { content: postInfo.message, author: postInfo.author, id };
  }

  if (loading) return <Spinner absCenter={true} />;
  if (error)
    return (
      <ConnectionErrorMessage>
        Could not find the group you are looking for.
      </ConnectionErrorMessage>
    );
  return (
    <Switch>
      <Route exact path="/group/:id">
        {group && <GroupHub group={group} />}
      </Route>
      <Route exact path="/group/:id/portfolio">
        <Portfolio
          title={`${group?.name} Portfolio`}
          artworks={group?.artworks}
          showBackButton={true}
        />
      </Route>
      <Route exact path="/group/:id/discussion">
        <Discussion
          fetchQuery={GET_COMMENTS_QUERY}
          fetchVariables={{ id }}
          commentResolver={groupCommentsResolver}
          postMutation={POST_DISCUSSION_MESSAGE}
          postResolver={groupPostResolver}
        />
      </Route>
    </Switch>
  );
}

interface GroupHubProps {
  group: Group;
}

/**
 * Presents general group info like the bio, metrics and recent activity.
 */
function GroupHub({ group }: GroupHubProps) {
  const { id } = useParams<{ id: string }>();
  const { goBack, push } = useHistory();
  const [leaveGroupMutation] = useMutation(LEAVE_GROUP);
  const [joinGroupMutation] = useMutation(JOIN_GROUP);
  const [checkMembershipMutation] = useMutation(CHECK_MEMBERSHIP);
  const { profile: user} = useProfileInfo();
  const [loading, setLoading] = useState(true)
  const [member, setMember] = useState(false)
  const [leaving, setLeaving] = useState(false)

  async function leaveGroup() {
    setLeaving(true);
    const payload = {
      user: user?.id,
      group: id,
    };
    let resp = await leaveGroupMutation({ variables: payload });

    if (resp["data"]["leaveGroup"]["success"]) {
      push("/groups");
    } else {
      alert("Error when attempting to leave group");
    }
  }


  async function checkMembership() {
    if (member) {
      setLoading(false);
      return
    }
    try {
      const payload = {
        user: user?.id,
        group: id
      };
      const memberResp = await checkMembershipMutation({ variables: payload });
      if (memberResp?.errors) {
        console.log(memberResp.errors)
        push("/groups");
      }
      if (memberResp.data.checkMembership.member === true) {
        setMember(true);
        setLoading(false);
        return
      }
      // not a member
      const joinResp = await joinGroupMutation({ variables: payload });
      if (joinResp?.errors) {
        alert('An error occurred')
        console.log(memberResp.errors)
        push("/groups");
      }
      console.log(joinResp)
      if (joinResp.data.joinGroup.success === true) {
        setMember(true);
        console.log(member);
        setLoading(false);
        return
      }
      console.log("Error trying to join group.")
    }
    catch(error) {
      alert(error);
    }
  }
  if (!member) {
    checkMembership()
  }
  if (loading) {
    return <Spinner absCenter={true} />;
  }


  return (
    <article className="GroupPage">
      <header>
        <img src={group.artworks[0].pictures[0]} alt="Art" />
        <button className="wrapper back-button" onClick={goBack}>
          <ArrowLeft />
        </button>
        <h1>{group.name}</h1>
        <div className="header-options">
          <button
            className="wrapper"
            onClick={() => push("/group/" + group.id + "/portfolio")}
          >
            <BookOpen />
          </button>
          <button
            className="wrapper"
            onClick={() => push("/group/" + group.id + "/discussion")}
          >
            <MessageSquare />
          </button>
        </div>
      </header>
      <div className="content">
        <div className="actions">
          <button onClick={() => leaveGroup()} disabled={leaving}>Leave Group</button>
        </div>
        <section>
          <h2>Group Bio</h2>
          <p>{group.bio}</p>
        </section>
        <section>
          <h2 style={{ marginBottom: 0 }}>Activity</h2>
          <span className="entry-count">{group.artworks.length} entries</span>
          <div className="side-scroller">
            {group.artworks.map((work, key) => (
              <ArtworkCard
                key={key}
                image={work.pictures[0]}
                title={work.title}
                onClick={() => push("/artwork/" + work.id)}
              />
            ))}
          </div>
        </section>
        <section>
          <h2 style={{ marginBottom: 0 }}>Metrics</h2>
          <div className="side-scroller">
            <MetricBadge
              value={group.metrics.artworkCount}
              unit="Artworks"
              fallbackVal={0}
            />
            <MetricBadge
              value={group.metrics.memberCount}
              unit="Members"
              fallbackVal={0}
            />
          </div>
        </section>
        <section>
          <h2>Options</h2>
          <div className="actions">
            <button className="danger" onClick={leaveGroup}>
              Leave Group
            </button>
          </div>
        </section>
      </div>
    </article>
  );
}

interface ArtworkCardProps {
  image: string;
  title: string;
  onClick: React.MouseEventHandler<HTMLDivElement>;
}

function ArtworkCard(props: ArtworkCardProps) {
  return (
    <div className="ArtworkCard" onClick={props.onClick}>
      <img src={props.image} alt={props.title} />
      <h3>{props.title}</h3>
    </div>
  );
}
