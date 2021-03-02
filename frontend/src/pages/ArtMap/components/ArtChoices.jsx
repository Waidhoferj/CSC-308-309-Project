import { Star } from "react-feather";
export default function ArtChoices({ artworks, onArtworkSelected }) {
  return (
    <div className="ArtChoices">
      <h2>Artworks</h2>
      <hr />
      <ul>
        {artworks.map((work) => (
          <ArtChoice {...work} onClick={() => onArtworkSelected(work)} />
        ))}
      </ul>
    </div>
  );
}

function ArtChoice({ onClick, rating, title }) {
  return (
    <li onClick={onClick} className="ArtChoice">
      <h3 className="title">{title}</h3>
      <p className="rating">
        {rating} <Star />
      </p>
    </li>
  );
}
