import "./Camera.scss";

import { AnimatePresence, motion } from "framer-motion";

import CameraCapture from "./components/CameraCapture";
import PhotoGallery from "./components/PhotoGallery";
import { useState } from "react";

export default function Camera() {
  const [images, setImages] = useState([]);
  const [showPhotos, setShowPhotos] = useState(false);
  function addPhoto(image) {
    setImages((images) => [...images, image]);
  }
  return (
    <section className="Camera">
      <CameraCapture
        onImageCapture={addPhoto}
        onShowPhotos={() => setShowPhotos(true)}
      />
      <AnimatePresence initial={false}>
        {showPhotos && (
          <motion.div
            key="PhotoGallery"
            initial={{ opacity: 0, transform: "translateY(100vh)" }}
            animate={{ opacity: 1, transform: "translateY(0vh)" }}
            exit={{ opacity: 0, transform: "translateY(100vh)" }}
            transition={{ ease: ["easeInOut"], duration: 0.4 }}
          >
            <PhotoGallery photos={images} onHide={() => setShowPhotos(false)} />
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
