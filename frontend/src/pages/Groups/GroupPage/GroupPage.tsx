import "./GroupPage.scss"
import {useQuery} from "@apollo/client"
import {GET_GROUP_QUERY, GET_COMMENTS_QUERY, POST_DISCUSSION_MESSAGE, groupResolver, groupCommentsResolver} from "./gql"
import {ArrowLeft, MessageSquare, BookOpen} from "react-feather"
import MetricBadge from "../../../components/MetricBadge/MetricBadge"
import { Switch, useHistory, useParams } from "react-router-dom"
import { useMemo } from "react";
import ConnectionErrorMessage from "../../../components/ConnectionErrorMessage/ConnectionErrorMessage.jsx";
import {Route} from "react-router-dom"
import Portfolio from "../../Portfolio/Portfolio"
import Discussion from "../../Discussion/Discussion"




export default function GroupPage() {
    const {goBack, push} = useHistory()
    const {id} = useParams<{id:string}>()
    const {data} = useQuery(GET_GROUP_QUERY, {variables: {id}})
    const group = useMemo(() => groupResolver(data), [data]);

    function groupPostResolver(postInfo: {message: string, author: string}) {
      return {content: postInfo.message, author: postInfo.author, id }
    }

    return <Switch>
        <Route exact path="/group/:id">
            {
              group ? <article className="GroupPage">
              <header>
          <img src={group.artworks[0].pictures[0]} alt="Art" />
          <button className="wrapper back-button" onClick={goBack}>
            <ArrowLeft />
          </button>
          <h1>{group.name}</h1>
          <div className="header-options">
      <button className="wrapper" onClick={() => push("/group/" + id + "/portfolio")}><BookOpen/></button>
      <button className="wrapper" onClick={() => push("/group/" + id + "/discussion")}><MessageSquare/></button>
    </div>
        </header>
        <div className="content">
            <section>
              <h2>Group Bio</h2>
              <p>{group.bio}</p>
            </section>
            <section>
              <h2 style={{marginBottom: 0}}>Activity</h2>
              <span className="entry-count">{group.artworks.length} entries</span>
              <div className="side-scroller">
                {group.artworks.map(work => <ArtworkCard image={work.pictures[0]} title={work.title} onClick={() => push("/artwork/" + work.id)}/>)}
              </div>
            </section>
            <section>
              <h2 style={{marginBottom: 0}}>Metrics</h2>
                <div className="side-scroller">
                  <MetricBadge value={group.metrics.artworkCount} unit="Artworks" fallbackVal={0}/>
                  <MetricBadge value={group.metrics.memberCount} unit="Members" fallbackVal={0}/>
                </div>
            </section>
        </div>
      </article> : <ConnectionErrorMessage>
          Could not find the group you are looking for.
      </ConnectionErrorMessage>
            }
        </Route>
        <Route exact path="/group/:id/portfolio">
          <Portfolio title={`${group?.name} Portfolio`} artworks={group?.artworks} showBackButton={true} />
        </Route>
        <Route exact path="/group/:id/discussion">
        <Discussion 
        fetchQuery={GET_COMMENTS_QUERY} 
        fetchVariables={{id}} 
        commentResolver={groupCommentsResolver} 
        postMutation={POST_DISCUSSION_MESSAGE} 
        postResolver={groupPostResolver} />
        </Route>
    </Switch>
}

interface ArtworkCardProps {
  image: string,
  title: string
  onClick: React.MouseEventHandler<HTMLDivElement>
}

function ArtworkCard(props : ArtworkCardProps) {
  return <div className="ArtworkCard" onClick={props.onClick}>
    <img src={props.image} alt={props.title}/>
    <h3>{props.title}</h3>
  </div>
}
