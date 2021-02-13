import { X, Trash } from "react-feather";
import { useHistory } from "react-router-dom";

export default function PhotoGallery({ photos, onHide }) {
  const { goBack } = useHistory();

  function deletePhoto() {
    const shouldDelete = true;
    if (!shouldDelete) return;
    // Figure out which image and delete it.
  }
  return (
    <article className="PhotoGallery">
      <nav>
        <button className="wrapper" aria-label="Back" onClick={onHide}>
          <X />
        </button>
      </nav>
      {photos.length ? (
        <>
          <ul className="photos">
            {photos.map((photoData, i) => (
              <li className="photo" key={i}>
                <img src={photoData} />
              </li>
            ))}
          </ul>
          <button className="trash-button">
            <Trash color="white" size="35" />
          </button>
        </>
      ) : (
        <div className="no-photos">
          <p>No photos taken</p>
        </div>
      )}
    </article>
  );
}
