import "./Discussion.scss"


export default function Discission() {

    return <article className="Discussion">

    </article>

}

type CommentProps = {
    author: String,
    content: String,

}


function Comment() {
    return <li className="Comment">
        <div className="metadata">
            <p className="user"></p>
            <p className="datetime"> { }</p>
        </div>
    </li>
}