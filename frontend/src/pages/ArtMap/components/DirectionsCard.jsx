import { motion } from "framer-motion";
import { Star, X } from "react-feather";

export default function DirectionsCard({ title, distance, rating, onCancel }) {
  return (
    <motion.aside
      className="DirectionsCard"
      initial={{ y: "-150%", x: "-50%" }}
      animate={{ y: "0%", x: "-50%" }}
      exit={{ y: "-150%", x: "-50%" }}
      transition={{ duration: 0.5, type: "tween" }}
    >
      <p>
        {rating} <Star />
      </p>
      <div className="mid-wrapper">
        <h3>{title.length > 20 ? title.slice(0, 20) + "..." : title}</h3>
        {distance && <h2>{distance} mi</h2>}
      </div>

      <button className="wrapper" onClick={onCancel}>
        <X />
      </button>
    </motion.aside>
  );
}
