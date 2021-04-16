import { useEffect, useState } from "react";
let images: string[] = [];
let listeners: React.Dispatch<React.SetStateAction<number>>[] = [];

export default function usePhotoLibrary() {
  const listener = useState(Date.now())[1];

  useEffect(() => {
    listeners.push(listener);
    return () => void (listeners = listeners.filter((l) => l !== listener));
  }, [listener]);

  function updateListeners() {
    listeners.forEach((l) => l(Date.now()));
  }

  function addImage(image: string) {
    images.push(image);
    updateListeners();
  }

  function removeImage(i: number) {
    images.splice(i, 1);
    updateListeners();
  }

  function clearLibrary() {
    images = [];
    updateListeners();
  }

  return { images, addImage, removeImage, clearLibrary };
}
