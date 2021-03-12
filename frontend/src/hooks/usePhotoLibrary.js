import { useEffect, useState } from "react";
let images = [];
let listeners = [];

/**
 *
 * @returns {{images : string[], addImage, removeImage, clearLibrary}} array of base64 encoded photos.
 */
export default function usePhotoLibrary() {
  const listener = useState(Date.now())[1];

  useEffect(() => {
    listeners.push(listener);
    return () => (listeners = listeners.filter((l) => l !== listener));
  }, [listener]);

  function updateListeners() {
    listeners.forEach((l) => l(Date.now()));
  }

  function addImage(image) {
    images.push(image);
    updateListeners();
  }

  function removeImage(i) {
    images.splice(i, 1);
    updateListeners();
  }

  function clearLibrary() {
    images = [];
    updateListeners();
  }

  return { images, addImage, removeImage, clearLibrary };
}
