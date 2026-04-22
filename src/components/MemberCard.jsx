import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import GlowCard from "./GlowCard";

export default function MemberCard({ member, index }) {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group [perspective:1000px] cursor-pointer"
      style={{ height: "320px" }}
      onClick={() => navigate(`/members/${member.id}`)}
    >
      <div className="relative w-full h-full transition-transform duration-700 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)]">

        {/* FRONT */}
        <div className="absolute inset-0 [backface-visibility:hidden]">
          <GlowCard className="w-full h-full flex flex-col overflow-hidden">
            <div className="flex-1 overflow-hidden rounded-xl">
              <img
                src={member.avatar}
                alt={member.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=e63946&color=fff&size=256`;
                }}
              />
            </div>
            <div className="p-4">
              <div className="flex items-center gap-1">
                <h3 className="text-white font-bold text-sm">{member.name}</h3>
                {member.verified && <span className="text-crimson text-xs">✔</span>}
              </div>
              <p className="text-crimson text-xs mt-0.5">{member.role}</p>
            </div>
          </GlowCard>
        </div>

        {/* BACK */}
        <div className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)]">
          <GlowCard className="w-full h-full flex flex-col justify-between p-5">
            <div>
              <div className="flex items-center gap-1 mb-1">
                <h3 className="text-white font-bold text-sm">{member.name}</h3>
                {member.verified && <span className="text-crimson text-xs">✔</span>}
              </div>
              <p className="text-crimson text-xs mb-3">{member.role}</p>
              <p className="text-white/50 text-xs leading-relaxed line-clamp-4">
                {member.bio}
              </p>
              <div className="flex flex-wrap gap-1 mt-3">
                {member.skills?.slice(0, 3).map((skill) => (
                  <span key={skill} className="text-xs bg-crimson/20 text-crimson px-2 py-0.5 rounded-full">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-white/30 text-xs">📍 {member.location}</p>
              <span className="text-crimson text-xs font-semibold">View Profile →</span>
            </div>
          </GlowCard>
        </div>

      </div>
    </motion.div>
  );
}