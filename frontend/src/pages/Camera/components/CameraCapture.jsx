import Webcam from "react-webcam";
import { useRef } from "react";
import { useHistory } from "react-router-dom";
import usePhotoLibrary from "../../../hooks/usePhotoLibrary";
import {
  Image,
  Camera as CamIcon,
  ArrowRightCircle,
  Upload,
} from "react-feather";

const videoConstraints = {
  facingMode: "environment",
};

export default function CameraCapture({ onShowPhotos, onImageCapture }) {
  const cameraRef = useRef(null);
  const flashRef = useRef(null);
  const history = useHistory();
  const { images } = usePhotoLibrary();

  function takePhoto() {
    if (!cameraRef.current) return;
    const photo = cameraRef.current.getScreenshot();
    onImageCapture(photo);
    flashRef?.current.animate(
      {
        transform: [0, 5].map((v) => `translate(-50%, -50%) scale(${v})`),
        opacity: [1, 0],
      },
      500
    );
  }

  function submitPhotos() {
    history.push("/art-submission");
  }

  function getInputtedFiles(e) {
    const { files } = e.target;
    const fr = new FileReader();
    fr.addEventListener("load", () => {
      onImageCapture(fr.result.toString());
    });
    fr.readAsDataURL(files[0]);
  }

  return (
    <article className="CameraCapture">
      <Webcam
        audio={false}
        ref={cameraRef}
        videoConstraints={videoConstraints}
      />
      <nav className="camera-nav">
        <button className="wrapper">
          <label>
            <Upload />
            <input
              type="file"
              accept="image"
              style={{ display: "none" }}
              onChange={getInputtedFiles}
            />
          </label>
        </button>
      </nav>
      <ul className="action-tray">
        <li>
          <button className="wrapper" onClick={onShowPhotos}>
            <Image />
          </button>
        </li>
        <li>
          <button className="wrapper snapshot-button" onClick={takePhoto}>
            <div className="flash" ref={flashRef}></div>
            <CamIcon />
          </button>
        </li>
        <li>
          <button
            className="wrapper"
            onClick={submitPhotos}
            disabled={images.length < 1}
          >
            <ArrowRightCircle />
          </button>
        </li>
      </ul>
    </article>
  );
}
