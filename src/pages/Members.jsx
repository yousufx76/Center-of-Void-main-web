import { motion } from "framer-motion";
import Navbar from "../components/Navbar";
import MemberCard from "../components/MemberCard";
import MotionBg from "../components/MotionBg";
import { TEAM } from "../config/team";

export default function Members() {
  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white relative">
      <MotionBg />
      <Navbar />

      <section className="max-w-6xl mx-auto px-6 pt-32 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-crimson text-sm font-semibold uppercase tracking-widest mb-3">
            The Team
          </p>
          <h1 className="text-4xl md:text-5xl font-extrabold">
            Meet the Squad<span className="text-crimson">.</span>
          </h1>
          <p className="text-white/50 mt-4 text-lg">
            {TEAM.members.length} people. One vision.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {TEAM.members.map((member, index) => (
            <MemberCard
              key={member.id}
              member={member}
              index={index}
            />
          ))}
        </div>
      </section>

      <footer className="text-center py-8 text-white/30 text-sm border-t border-white/10">
        © {new Date().getFullYear()} {TEAM.name}. All rights reserved.
      </footer>
    </div>
  );
}