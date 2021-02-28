import { motion } from "framer-motion";

export default function Card({ children, ...props }) {
  return (
    <motion.aside className="Card" {...props}>
      {children}
    </motion.aside>
  );
}
