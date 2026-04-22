import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";
import { TEAM } from "../config/team";
import MotionBg from "../components/MotionBg";

/**
 * 1. FIXED: Removed the duplicate local cn function. 
 * 2. FIXED: Corrected path from @/lib/utils to ../lib/utils based on your file structure.
 */
import { cn } from "../lib/utils";

function ElegantShape({ className, delay = 0, width = 400, height = 100, rotate = 0, gradient = "from-white/[0.08]" }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -150, rotate: rotate - 15 }}
      animate={{ opacity: 1, y: 0, rotate: rotate }}
      transition={{
        duration: 2.4,
        delay,
        ease: [0.23, 0.86, 0.39, 0.96],
        opacity: { duration: 1.2 },
      }}
      className={cn("absolute", className)}
    >
      <motion.div
        animate={{ y: [0, 20, 0] }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{ width, height }}
        className="relative"
      >
        <div
          className={cn(
            "absolute inset-0 rounded-full",
            "bg-gradient-to-r to-transparent",
            gradient,
            "backdrop-blur-[3px] border border-white/[0.1]",
            "shadow-[0_8px_32px_0_rgba(220,38,38,0.1)]", 
          )}
        />
      </motion.div>
    </motion.div>
  );
}

export default function Home() {
  return (
    <div className="relative min-h-screen bg-charcoal text-white overflow-hidden">
      <Navbar />

      {/* --- BACKGROUND LAYER --- */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(220,38,38,0.05),transparent_70%)]" />
        
        <ElegantShape
          delay={0.3}
          width={600}
          height={140}
          rotate={12}
          gradient="from-crimson/[0.15]"
          className="left-[-10%] top-[15%]"
        />
        <ElegantShape
          delay={0.5}
          width={500}
          height={120}
          rotate={-15}
          gradient="from-white/[0.05]"
          className="right-[-5%] top-[60%]"
        />
        <ElegantShape
          delay={0.7}
          width={300}
          height={80}
          rotate={-8}
          gradient="from-crimson/[0.1]"
          className="left-[10%] bottom-[10%]"
        />
        
        <div className="absolute inset-0 bg-gradient-to-b from-charcoal via-transparent to-charcoal pointer-events-none" />
      </div>

      {/* --- CONTENT LAYER --- */}
      <div className="relative z-10">
        <section className="min-h-screen flex flex-col items-center justify-center text-center px-6 pt-20">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="max-w-3xl"
          >
            <motion.p 
              initial={{ opacity: 0, tracking: "0.1em" }}
              animate={{ opacity: 1, tracking: "0.3em" }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="text-crimson text-sm font-semibold uppercase mb-4"
            >
              We are
            </motion.p>
            
            <h1 className="text-6xl md:text-8xl font-extrabold mb-6 leading-tight tracking-tighter">
              {TEAM.name}
              <span className="text-crimson">.</span>
            </h1>

            <p className="text-white/60 text-lg md:text-xl mb-10 max-w-2xl mx-auto">
              {TEAM.tagline}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/members"
                className="group relative bg-crimson text-white px-10 py-4 rounded-full font-bold overflow-hidden transition-all hover:scale-105 active:scale-95"
              >
                <span className="relative z-10">Meet the Squad</span>
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1.5 }}
            className="absolute bottom-10 flex flex-col items-center gap-4 text-white/30 text-xs tracking-widest"
          >
            <span className="uppercase">Explore</span>
            <div className="w-px h-12 bg-gradient-line from-crimson to-transparent"></div>
          </motion.div>
        </section>

        <section className="max-w-4xl mx-auto px-6 py-32 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="backdrop-blur-sm bg-white/[0.02] p-12 rounded-3xl border border-white/[0.05]"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-8">
              Who are we<span className="text-crimson">?</span>
            </h2>
            <p className="text-white/50 text-xl leading-relaxed">
              We are a group of <span className="text-white font-semibold">{TEAM.members.length} friends</span> who share 
              the same passion for adventure, creativity, and growth. This is our digital 
              headquarters.
            </p>
          </motion.div>
        </section>

        <footer className="text-center py-12 text-white/20 text-sm border-t border-white/5">
          © {new Date().getFullYear()} {TEAM.name}. Crafted with Passion.
        </footer>
      </div>
    </div>
  );
}