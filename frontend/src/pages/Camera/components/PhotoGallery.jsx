import { useRef } from "react";
import { X, Trash } from "react-feather";
import usePhotoLibrary from "../../../hooks/usePhotoLibrary";

export default function PhotoGallery({ onHide }) {
  const { images, removeImage } = usePhotoLibrary();
  const sideScrollRef = useRef();
  function deletePhoto() {
    const photos = sideScrollRef.current;
    const i = Math.floor(
      (photos.scrollLeft / photos.scrollWidth) * images.length
    );
    removeImage(i);
  }
  return (
    <article className="PhotoGallery">
      <nav>
        <button className="wrapper" aria-label="Back" onClick={onHide}>
          <X />
        </button>
      </nav>
      {images.length ? (
        <>
          <ul className="photos" ref={sideScrollRef}>
            {images.map((photoData, i) => (
              <li className="photo" key={i}>
                <img alt={"Photo " + (i + 1)} src={photoData} />
              </li>
            ))}
          </ul>
          <button className="trash-button" onClick={deletePhoto}>
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
