import "./Discussion.scss"
import {useQuery, useMutation, gql} from "@apollo/client"
import React, { useMemo, useRef, useEffect } from "react"
import {useParams, useHistory} from "react-router-dom"

import {
    ArrowLeft,
    Send
  } from "react-feather";
import useProfileInfo from "../../../../hooks/useProfileInfo";

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

const POST_MESSAGE = gql`
  mutation postMessage($id : ID!, $content: String!, $author: ID!) {
    addArtworkComment(artworkId: $id, comment: {
    content: $content
    author: $author
  }) {
    comment {
      content
    }
  }
  }
`

export default function Discussion() {
    const {comments, picture} = useComments()
    const {profile} = useProfileInfo()
    const [sendMessage] = useMutation(POST_MESSAGE)
    const {goBack} = useHistory()
    const {id:artworkId} = useParams<{id:string}>()
    const contentRef = useRef<HTMLUListElement | null>(null)

  function postMessage(message: string) {
    if(!profile) return;
    sendMessage({variables: {id: artworkId, content: message, author: profile.id}})
    // Scroll to bottom after submitting.
    setTimeout(() => {
      contentRef.current?.scrollTo(0, contentRef.current.scrollHeight)
    }, 700)
  }

    return <article className="Discussion">
        <header>
        <img src={picture} alt="Art" />
        <button className="wrapper back-button" onClick={goBack}>
          <ArrowLeft />
        </button>
        <h1>Discussion</h1>
      </header>
      <ul className="content" ref={contentRef}>
            {comments.map((data, i) => <Comment key={i} {...data}/>)}
        <MessageComposer onSend={postMessage}/>
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
    const {loading, data, error} = useQuery(GET_DISCUSSION, {variables: {id}, pollInterval: 500});
    const hasNoData = loading || error
    const comments: CommentProps[] = hasNoData ? [] : data.artwork.edges?.[0]
    .node.comments.edges.map(({node}:{node : GqlCommentData}) => 
    ({content: node.content, author: node.author.name, datePosted: new Date(node.datePosted)}))
    const picture = hasNoData ? "" : data.artwork.edges?.[0].node.pictures[0]
    return {comments, picture}
}


function MessageComposer({ onSend }: {onSend : (text: string) => void}) {

  let textFieldRef = useRef<HTMLDivElement | null>(null);

  // Takes the message from the content editable field and sends it out
  function sendMessage() {
    const emptyField = /^\s*$/g;
    if (
      !textFieldRef.current ||
      emptyField.test(textFieldRef.current.innerText)
    )
      return;
    let message = textFieldRef.current.innerText.trim();
    textFieldRef.current.innerText = "";
    onSend(message);
  }

  // Send Message on Enter Pressed
  useEffect(() => {
    const textField = textFieldRef.current;
    if (!textField) return;
    const onEnter = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        sendMessage();
      }
    };
    textField.addEventListener("keypress", onEnter);
    return () => textField.removeEventListener("keypress", onEnter);
  });

  return (
    <div className="MessageComposer">
        <div
        role="input"
          className="text-field"
          ref={textFieldRef}
          contentEditable="true"
        ></div>
        <button className="send-button" onClick={() => sendMessage()}>
          <Send size={20} />
          <p className="button-text">Send</p>
        </button>
    </div>
  );
}