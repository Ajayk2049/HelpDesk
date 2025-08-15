import {motion} from "framer-motion";
import {Link} from "react-router-dom"
const Hero = () => {
  return (
    <section>
      <div className="text-center my-30">
        <motion.h1
          className="text-5xl font-bold text-gray-800 dark:text-gray-200"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          HelpDesk
        </motion.h1>
        <motion.h3
          className="text-3xl font-bold text-gray-800 dark:text-gray-200 mt-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Fix Problems Faster, Together.
        </motion.h3>
        <motion.p
          className="text-xl font-semibold  text-gray-800 dark:text-gray-200 mt-4 "
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.7 }}
        >
          HelpDesk connects users and support teams via real-time chat, media
          sharing, and live calls.
        </motion.p>
        <Link to="/pricing">
        <motion.button className="mt-10 hover:bg-indigo-600 hover:text-gray-200 font-semibold  border border-gray-800 dark:border-gray-200 text-gray-800 dark:text-gray-200 rounded-xl p-2 cursor-pointer"
        initial={{opacity:0, x:-30}}
        animate={{opacity:1, x:0}}
        transition={{delay:0.5, duration:0.9}}
        >
          Check pricing
        </motion.button>
        </Link>
      </div>
    </section>
  );
};

export default Hero;
