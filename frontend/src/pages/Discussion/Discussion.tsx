import "./Discussion.scss"
import {useQuery, useMutation, gql, DocumentNode} from "@apollo/client"
import {useRef, useEffect, useMemo } from "react"
import {useParams, useHistory} from "react-router-dom"

import {
    ArrowLeft,
    Send
  } from "react-feather";
import useProfileInfo from "../../hooks/useProfileInfo";





interface DiscussionProps {
  fetchQuery: DocumentNode;
  fetchVariables: object;
  commentResolver: (fetchResult: any) => {comments: DiscussionComment[], picture?: string};
  postMutation: DocumentNode,
  postResolver: (postInfo : {message: string, author: string}) => object;
}

export default function Discussion(props : DiscussionProps) {

    const {loading, data, error} = useQuery(props.fetchQuery, {variables: props.fetchVariables, pollInterval: 500});
    const {comments, picture} = useMemo(() => props.commentResolver(data), [data])
    const {profile} = useProfileInfo()
    const [sendMessage] = useMutation(props.postMutation)
    const {goBack} = useHistory()
    const {id:artworkId} = useParams<{id:string}>()
    const contentRef = useRef<HTMLUListElement | null>(null)

  function postMessage(message: string) {
    if(!profile) return;
    sendMessage({variables: props.postResolver({message, author: profile.id})})
    // Scroll to bottom after submitting.
    setTimeout(() => {
      contentRef.current?.scrollTo(0, contentRef.current.scrollHeight)
    }, 700)
  }

    return <article className="Discussion">
        <header>
        {picture && <img src={picture} alt="Art" />}
        <button className="wrapper back-button" onClick={goBack}>
          <ArrowLeft />
        </button>
        <h1>Discussion</h1>
      </header>
      <ul className="content" ref={contentRef}>
            {comments.map((data, i) => <CommentCard key={i} {...data}/>)}
        <MessageComposer onSend={postMessage}/>
      </ul>
    </article>

}



function CommentCard(props: DiscussionComment) {
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
          role="textbox"
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