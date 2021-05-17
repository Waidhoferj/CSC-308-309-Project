import "./Drawer.scss";
import { motion } from "framer-motion";
interface DrawerProps {
  title?: string;
  children?: React.ReactNode;
  onClose: () => void;
}

export default function Drawer(props: DrawerProps) {
  return (
    <motion.div className="Drawer">
      <motion.div
        className="backdrop"
        onClick={props.onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.3 }}
        exit={{ opacity: 0 }}
      ></motion.div>
      <motion.div
        className="drawer-wrapper"
        initial={{ y: "120%", x: "-50%" }}
        animate={{ y: 0, x: "-50%" }}
        exit={{ y: "120%", x: "-50%" }}
      >
        {props.title && <h2>{props.title}</h2>}
        {props.children}
      </motion.div>
    </motion.div>
  );
}
