// components/LoadingDots.tsx

import { motion } from "framer-motion";

const dotVariants = {
  initial: { y: 0 },
  animate: {
    y: -8,
    transition: {
      type: "spring",
      stiffness: 1000,
      damping: 10,
      repeat: Infinity,
      repeatType: "mirror" as const,
    },
  },
};

export const LoadingDots = () => {
  return (
    <motion.div className="flex space-x-1" initial="initial" animate="animate">
      {[1, 2, 3].map((i) => (
        <motion.div
          key={i}
          className="h-2 w-2 rounded-full bg-slate-400"
          variants={dotVariants}
          style={{ transitionDelay: `${i * 0.1}s` }}
        />
      ))}
    </motion.div>
  );
};
