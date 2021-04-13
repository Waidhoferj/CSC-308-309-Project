import "./Discussion.scss"
import {useQuery, gql} from "@apollo/client"
import { useMemo } from "react"
import {useParams, useHistory} from "react-router-dom"

import {
    ArrowLeft,
  } from "react-feather";

const GET_DISCUSSION = gql`
query getDiscussion($id: ID!) {
  artwork(id: $id) {
    edges {
      node {
        pictures
        comments {
          edges {
            node {
              content
              datePosted
              author {
                  name
              }
            }
          }
        }
      }
    }
  }
}
`

export default function Discussion() {
    const {comments, picture} = useComments()
    const {goBack} = useHistory()
    console.log({comments, picture})
    return <article className="Discussion">
        <header>
        <img src={picture} alt="Art" />
        <button className="wrapper back-button" onClick={goBack}>
          <ArrowLeft />
        </button>
        <h1>Discussion</h1>
      </header>
      <ul className="content">
            {comments.map(data => <Comment {...data}/>)}
      </ul>
    </article>

}

type CommentProps = {
    author: String,
    content: String,
    datePosted: Date
}


function Comment(props: CommentProps) {
    const dateOptions: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
    const dateStr:string = props.datePosted.toLocaleString("en", dateOptions)
    return <li className="Comment">
        <div className="metadata">
            <p className="user">{props.author}</p>
            <p className="datetime"> {dateStr}</p>
        </div>
        <p>{props.content}</p>
    </li>
}

type GqlCommentData = {
    content: string,
    datePosted: string,
    author: {
        name : string
    },

}

/**
 * Handles retrieving artwork comments from the server.
 */
function useComments() : {picture: string, comments: CommentProps[]} {
    const {id} = useParams<{id:string}>()
    const {loading, data, error} = useQuery(GET_DISCUSSION, {variables: {id}});
    const hasNoData = loading || error
    const comments: CommentProps[] = hasNoData ? [] : data.artwork.edges?.[0]
    .node.comments.edges.map(({node}:{node : GqlCommentData}) => 
    ({content: node.content, author: node.author.name, datePosted: new Date(node.datePosted)}))
    console.log({data, error})
    const picture = hasNoData ? "" : data.artwork.edges?.[0].node.pictures[0]
    return {comments, picture}
}