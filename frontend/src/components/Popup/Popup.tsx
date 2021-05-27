import "./Popup.scss";
import { motion } from "framer-motion";
interface PopupProps {
  children?: React.ReactNode;
  onClose: () => void;
}

export default function Popup(props: PopupProps) {
  return (
    <motion.div className="Popup">
      <motion.div
        className="backdrop"
        onClick={props.onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.3 }}
        exit={{ opacity: 0 }}
      ></motion.div>
      <motion.div
        className="popup-wrapper"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.5 }}
      >
        <div className="popup-content">{props.children}</div>
      </motion.div>
    </motion.div>
  );
}
