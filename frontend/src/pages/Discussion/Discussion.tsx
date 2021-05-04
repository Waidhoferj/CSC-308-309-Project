import "./Discussion.scss"
import {useQuery, useMutation, DocumentNode} from "@apollo/client"
import {useRef, useEffect, useMemo } from "react"
import {useHistory} from "react-router-dom"

import {
    ArrowLeft,
    Send
  } from "react-feather";
import useProfileInfo from "../../hooks/useProfileInfo";
import Spinner from "../../components/Spinner/Spinner";
import ConnectionErrorMessage from "../../components/ConnectionErrorMessage/ConnectionErrorMessage";

interface DiscussionProps {
  fetchQuery: DocumentNode;
  fetchVariables: object;
  commentResolver: (fetchResult: any) => {comments: DiscussionComment[], picture?: string};
  postMutation: DocumentNode,
  postResolver: (postInfo : {message: string, author: string}) => object;
}

export default function Discussion(props : DiscussionProps) {
    const {loading, data, error, startPolling, stopPolling} = useQuery(props.fetchQuery, {variables: props.fetchVariables});
    const {commentResolver} = props
    const {comments, picture} = useMemo(() => commentResolver(data), [data, commentResolver])
    const {profile} = useProfileInfo()
    const [sendMessage] = useMutation(props.postMutation)
    const {goBack} = useHistory()
    const contentRef = useRef<HTMLUListElement | null>(null)

    const headerStyles = {
      background: picture ? "transparent" : "linear-gradient(90deg, #32a6ff70, transparent)"
    }

    // Only poll when on the discussion page.
    useEffect(() => {
      startPolling(500);
      return () => stopPolling()
    }, [startPolling, stopPolling])

  function postMessage(message: string) {
    if(!profile) return;
    sendMessage({variables: props.postResolver({message, author: profile.id})})
    // Scroll to bottom after submitting.
    setTimeout(() => {
      contentRef.current?.scrollTo(0, contentRef.current.scrollHeight)
    }, 700)
  }
    if(loading) return <Spinner absCenter={true}/>
    else if(error) return <ConnectionErrorMessage>Couldn't find the conversation.</ConnectionErrorMessage>
    return <article className="Discussion">
        <header style={headerStyles}>
        {picture && <img src={picture} alt="Art" />}
        <button className="wrapper back-button" onClick={goBack}>
          <ArrowLeft />
        </button>
        <h1>Discussion</h1>
      </header>
      <ul className="content" ref={contentRef}>
            {comments.length ? 
            comments.map((data, i) => <CommentCard key={i} {...data}/>) :
            <p className="absolute-center">Looks like you are the first one here, start the discussion!</p>}
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