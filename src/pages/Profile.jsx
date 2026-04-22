import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { db } from "../firebase/config";
import { doc, onSnapshot, setDoc, increment } from "firebase/firestore";
import Navbar from "../components/Navbar";
import MotionBg from "../components/MotionBg";
import { TEAM } from "../config/team";
import GenshinCard from "../components/GenshinCard";


export default function Profile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const member = TEAM.members.find((m) => m.id === id);
  const [likes, setLikes] = useState(0);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    if (!member) return;
    const ref = doc(db, "likes", id);
    const unsub = onSnapshot(ref, (snap) => {
      if (snap.exists()) setLikes(snap.data().count || 0);
    });
    return () => unsub();
  }, [id]);

  const handleLike = async () => {
    const ref = doc(db, "likes", id);
    await setDoc(ref, { count: increment(1) }, { merge: true });
    setLiked(true);
  };

  if (!member) return (
    <div className="min-h-screen bg-[#0f0f0f] text-white flex items-center justify-center">
      <div className="text-center">
        <p className="text-white/40 mb-4">Member not found.</p>
        <button onClick={() => navigate("/members")} className="text-crimson">← Back</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white relative">
      <MotionBg />
      <Navbar />

      {/* Cover */}
      <div className="w-full h-64 md:h-80 mt-0 relative">
        <img
          src={member.coverImage}
          alt="cover"
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.onerror = null;
            e.target.style.background = "linear-gradient(135deg, #1a1a1a, #2a0a0a)";
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#0f0f0f]" />
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 pb-24">
        <div className="flex flex-col md:flex-row gap-8 -mt-24 relative z-10">

          {/* LEFT Sidebar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="md:w-72 flex-shrink-0"
          >
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col items-center text-center gap-4 md:sticky md:top-24">

              {/* Avatar */}
              <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-crimson shadow-lg shadow-crimson/20">
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

              {/* Name */}
              <div>
                <div className="flex items-center justify-center gap-2">
                  <h1 className="text-white font-extrabold text-xl">{member.name}</h1>
                  {member.verified && (
                    <span className="text-crimson" title="Verified">✔</span>
                  )}
                </div>
                <p className="text-crimson text-sm font-medium mt-1">{member.role}</p>
                {member.location && (
                  <p className="text-white/30 text-xs mt-1">📍 {member.location}</p>
                )}
              </div>

              {/* Status */}
              <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                member.status === "student"
                  ? "bg-blue-500/20 text-blue-400"
                  : "bg-green-500/20 text-green-400"
              }`}>
                {member.status === "student" ? "🎓 Student" : "💼 Working"}
              </span>
              <p className="text-white/30 text-xs -mt-2">{member.statusDetail}</p>

              <div className="w-full border-t border-white/10" />

{/* Contact */}
<div className="flex flex-col gap-3 w-full">
  {member.email && (
    <a href={`mailto:${member.email}`}
      className="flex items-center gap-3 text-white/40 hover:text-crimson transition-all duration-200 text-sm"
    >
      <span className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-base flex-shrink-0">✉️</span>
      <span>{member.email}</span>
    </a>
  )}
  {member.whatsapp && (
    <a href={`https://wa.me/${member.whatsapp.replace(/\D/g, "")}`}
      target="_blank" rel="noreferrer"
      className="flex items-center gap-3 text-white/40 hover:text-green-400 transition-all duration-200 text-sm"
    >
      <span className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-base flex-shrink-0">📱</span>
      <span>{member.whatsapp}</span>
    </a>
  )}
  {member.facebook && (
    <a href={member.facebook} target="_blank" rel="noreferrer"
      className="flex items-center gap-3 text-white/40 hover:text-blue-400 transition-all duration-200 text-sm"
    >
      <span className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-base flex-shrink-0">🔗</span>
      <span>Facebook</span>
    </a>
  )}
  {member.instagram && (
    <a href={member.instagram} target="_blank" rel="noreferrer"
      className="flex items-center gap-3 text-white/40 hover:text-pink-400 transition-all duration-200 text-sm"
    >
      <span className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-base flex-shrink-0">📸</span>
      <span>Instagram</span>
    </a>
  )}
  {member.github && (
    <a href={member.github} target="_blank" rel="noreferrer"
      className="flex items-center gap-3 text-white/40 hover:text-white transition-all duration-200 text-sm"
    >
      <span className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-base flex-shrink-0">💻</span>
      <span>GitHub</span>
    </a>
  )}
</div>

              <div className="w-full border-t border-white/10" />

              {/* Like */}
              <button
                onClick={handleLike}
                className={`w-full py-2 rounded-xl border font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 ${
                  liked
                    ? "bg-crimson/20 border-crimson text-crimson"
                    : "bg-white/5 border-white/10 text-white/50 hover:border-crimson hover:text-crimson"
                }`}
              >
                ❤️ {likes > 0 ? likes : ""} {liked ? "Liked!" : "Like"}
              </button>

              <button
                onClick={() => navigate("/members")}
                className="text-white/20 hover:text-white text-xs transition-colors duration-200"
              >
                ← Back to Members
              </button>
            </div>
          </motion.div>

          {/* RIGHT Content */}
          <div className="flex-1 flex flex-col gap-6 pt-4">

            {/* About */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-white/5 border border-white/10 rounded-2xl p-6"
            >
              <h2 className="text-white font-bold text-lg mb-3">
                About<span className="text-crimson">.</span>
              </h2>
              <p className="text-white/50 leading-relaxed">{member.bio}</p>
            </motion.div>

            {/* Skills */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white/5 border border-white/10 rounded-2xl p-6"
            >
              <h2 className="text-white font-bold text-lg mb-4">
                Skills<span className="text-crimson">.</span>
              </h2>
              <div className="flex flex-col gap-4">
                {member.skills?.map((skill, i) => (
                  <div key={skill}>
                    <div className="flex justify-between mb-1">
                      <span className="text-white/70 text-sm">{skill}</span>
                      <span className="text-crimson text-xs">{90 - i * 8}%</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${90 - i * 8}%` }}
                        transition={{ duration: 1, delay: 0.3 + i * 0.1 }}
                        className="bg-crimson h-2 rounded-full"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Hobbies */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-white/5 border border-white/10 rounded-2xl p-6"
            >
              <h2 className="text-white font-bold text-lg mb-4">
                Hobbies<span className="text-crimson">.</span>
              </h2>
              <div className="flex flex-wrap gap-3">
                {member.hobbies?.map((hobby) => (
                  <span
                    key={hobby}
                    className="bg-white/5 border border-white/10 text-white/60 text-sm px-4 py-2 rounded-full hover:border-crimson/40 hover:text-white transition-all duration-200"
                  >
                    {hobby}
                  </span>
                ))}
              </div>
            </motion.div>

{/* Genshin Section */}
{member.genshinUID && (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: 0.4 }}
  >
    <GenshinCard uid={member.genshinUID} akashaURL={member.akashaURL} />
  </motion.div>
)}

          </div>
        </div>
      </div>
    </div>
  );
}