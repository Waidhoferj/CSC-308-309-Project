import "./Camera.scss";

import { AnimatePresence, motion } from "framer-motion";

import CameraCapture from "./components/CameraCapture";
import PhotoGallery from "./components/PhotoGallery";
import { Route, useHistory } from "react-router-dom";
import usePhotoLibrary from "../../hooks/usePhotoLibrary";

export default function Camera() {
  const { addImage } = usePhotoLibrary();
  const history = useHistory();
  return (
    <section className="Camera">
      <CameraCapture
        onImageCapture={addImage}
        onShowPhotos={() => history.push("/camera/library")}
      />
      <AnimatePresence>
        <Route path="/camera/library">
          <motion.div
            key="PhotoGallery"
            initial={{ opacity: 0, transform: "translateY(100vh)" }}
            animate={{ opacity: 1, transform: "translateY(0vh)" }}
            exit={{ opacity: 0, transform: "translateY(100vh)" }}
            transition={{ ease: ["easeInOut"], duration: 0.4 }}
          >
            <PhotoGallery onHide={() => history.push("/camera")} />
          </motion.div>
        </Route>
      </AnimatePresence>
    </section>
  );
}
