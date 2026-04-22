import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { db } from "../firebase/config";
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  deleteDoc,
  doc,
} from "firebase/firestore";
import emailjs from "@emailjs/browser";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import MotionBg from "../components/MotionBg";
import { TEAM } from "../config/team";
import { EMAILJS } from "../config/emailjs";

// Send notification to primary + specific member
const sendNotification = async (action, member, entry) => {
  const recipients = [
    { email: EMAILJS.primaryEmail, name: EMAILJS.primaryName },
  ];

  // Add the specific member if they have a different email
  if (member?.email && member.email !== EMAILJS.primaryEmail) {
    recipients.push({ email: member.email, name: member.name });
  }

  for (const recipient of recipients) {
    await emailjs.send(
      EMAILJS.serviceId,
      EMAILJS.templateId,
      {
        to_email: recipient.email,
        to_name: recipient.name,
        action: action,
        member_name: member?.name || "Unknown",
        amount: entry.amount,
        currency: TEAM.currency,
        date: entry.date,
        note: entry.note || "No note",
        admin_email: entry.addedBy || "Admin",
        team_name: TEAM.name,
      },
      EMAILJS.publicKey
    );
  }
};

export default function Dashboard() {
  const { user } = useAuth();
  const isAdmin = user?.email === TEAM.adminEmail;

  const [entries, setEntries] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ memberId: "", amount: "", note: "", date: "" });
  const [loading, setLoading] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);

  // Delete confirmation states
  const [deleteTarget, setDeleteTarget] = useState(null); // entry to delete
  const [deleteStep, setDeleteStep] = useState(0); // 0=none, 1=first confirm, 2=second confirm, 3=done

  // Fetch entries
  useEffect(() => {
    const q = query(collection(db, "savings"), orderBy("date", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setEntries(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  // Totals
  const totalSaved = entries.reduce((sum, e) => sum + Number(e.amount), 0);
  const goalPercent = Math.min((totalSaved / TEAM.tourGoal) * 100, 100).toFixed(1);

  const memberTotals = TEAM.members.map((m) => ({
    ...m,
    total: entries
      .filter((e) => e.memberId === m.id)
      .reduce((sum, e) => sum + Number(e.amount), 0),
    history: entries.filter((e) => e.memberId === m.id),
  }));

  // Add entry
  const handleAdd = async () => {
    if (!form.memberId || !form.amount || !form.date) return;
    setLoading(true);
    try {
      const newEntry = {
        memberId: form.memberId,
        amount: Number(form.amount),
        note: form.note,
        date: form.date,
        addedBy: user.email,
      };
      await addDoc(collection(db, "savings"), newEntry);

      // Send notification
      const member = TEAM.members.find((m) => m.id === form.memberId);
      await sendNotification("Added ✅", member, newEntry);

      setForm({ memberId: "", amount: "", note: "", date: "" });
      setShowForm(false);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Step 1 — first click delete
  const handleDeleteClick = (entry) => {
    setDeleteTarget(entry);
    setDeleteStep(1);
  };

  // Step 2 — confirmed step 1
  const handleDeleteStep2 = () => setDeleteStep(2);

  // Step 3 — confirmed step 2, actually delete
  const handleDeleteConfirmed = async () => {
    try {
      const member = TEAM.members.find((m) => m.id === deleteTarget.memberId);
      await deleteDoc(doc(db, "savings", deleteTarget.id));
      await sendNotification("Deleted ❌", member, deleteTarget);
      setDeleteStep(3);
    } catch (err) {
      console.error(err);
    }
  };

  // Close all delete modals
  const closeDelete = () => {
    setDeleteTarget(null);
    setDeleteStep(0);
  };

  const deleteMember = deleteTarget
    ? TEAM.members.find((m) => m.id === deleteTarget?.memberId)
    : null;

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white relative">
      <MotionBg />
      <Navbar />

      <div className="max-w-5xl mx-auto px-6 pt-32 pb-24">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <p className="text-crimson text-sm font-semibold uppercase tracking-widest mb-2">
            {isAdmin ? "Admin Access" : "Member View"}
          </p>
          <h1 className="text-4xl md:text-5xl font-extrabold">
            Squad Dashboard<span className="text-crimson">.</span>
          </h1>
          <p className="text-white/40 mt-2 text-sm">
            Signed in as {user?.email}
            {isAdmin && (
              <span className="ml-2 text-xs bg-crimson/20 text-crimson px-2 py-0.5 rounded-full font-semibold">
                Admin
              </span>
            )}
          </p>
        </motion.div>

        {/* Goal Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6"
        >
          <div className="flex justify-between items-end mb-3">
            <div>
              <p className="text-white/40 text-xs uppercase tracking-widest mb-1">Total Saved</p>
              <p className="text-3xl font-extrabold text-white">
                {TEAM.currency}{totalSaved.toLocaleString()}
                <span className="text-white/30 text-lg font-normal">
                  {" "}/ {TEAM.currency}{TEAM.tourGoal.toLocaleString()}
                </span>
              </p>
            </div>
            <p className="text-crimson text-2xl font-bold">{goalPercent}%</p>
          </div>
          <div className="w-full bg-white/10 rounded-full h-3">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${goalPercent}%` }}
              transition={{ duration: 1, delay: 0.3 }}
              className="bg-crimson h-3 rounded-full"
            />
          </div>
        </motion.div>

        {/* Member Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-10"
        >
          {memberTotals.map((m) => (
            <div
              key={m.id}
              onClick={() => setSelectedMember(m)}
              className="bg-white/5 border border-white/10 rounded-xl p-4 text-center hover:border-crimson/50 hover:scale-105 transition-all duration-200 cursor-pointer"
            >
              <div className="w-10 h-10 rounded-full overflow-hidden mx-auto mb-2 border border-crimson/40">
                <img
                  src={m.avatar}
                  alt={m.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(m.name)}&background=e63946&color=fff&size=64`;
                  }}
                />
              </div>
              <p className="text-white text-xs font-semibold truncate">{m.name}</p>
              <p className="text-crimson text-sm font-bold mt-1">
                {TEAM.currency}{m.total.toLocaleString()}
              </p>
              <p className="text-white/20 text-xs mt-1">{m.history.length} entries</p>
            </div>
          ))}
        </motion.div>

        {/* Add Entry */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">
            Activity Feed<span className="text-crimson">.</span>
          </h2>
          {isAdmin && (
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-crimson text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-red-700 transition-colors duration-200"
            >
              {showForm ? "Cancel" : "+ Add Entry"}
            </button>
          )}
        </div>

        {/* Add Form */}
        <AnimatePresence>
          {isAdmin && showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6 overflow-hidden"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-white/40 text-xs uppercase tracking-wider">Member</label>
                  <select
                    value={form.memberId}
                    onChange={(e) => setForm({ ...form, memberId: e.target.value })}
                    className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white text-sm outline-none focus:border-crimson transition-colors duration-200"
                  >
                    <option value="" className="bg-[#1a1a1a]">Select member</option>
                    {TEAM.members.map((m) => (
                      <option key={m.id} value={m.id} className="bg-[#1a1a1a]">{m.name}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-white/40 text-xs uppercase tracking-wider">
                    Amount ({TEAM.currency})
                  </label>
                  <input
                    type="number"
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                    placeholder="500"
                    className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white text-sm outline-none focus:border-crimson transition-colors duration-200 placeholder:text-white/20"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-white/40 text-xs uppercase tracking-wider">Date</label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white text-sm outline-none focus:border-crimson transition-colors duration-200"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-white/40 text-xs uppercase tracking-wider">Note (optional)</label>
                  <input
                    type="text"
                    value={form.note}
                    onChange={(e) => setForm({ ...form, note: e.target.value })}
                    placeholder="Monthly contribution"
                    className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white text-sm outline-none focus:border-crimson transition-colors duration-200 placeholder:text-white/20"
                  />
                </div>
              </div>

              <button
                onClick={handleAdd}
                disabled={loading}
                className="mt-4 bg-crimson text-white px-6 py-3 rounded-lg text-sm font-semibold hover:bg-red-700 transition-colors duration-200 disabled:opacity-50"
              >
                {loading ? "Saving & Notifying..." : "Save Entry"}
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Activity Feed */}
        <div className="flex flex-col gap-3">
          {entries.length === 0 && (
            <div className="text-center text-white/30 py-16 border border-white/10 rounded-2xl">
              No entries yet.
            </div>
          )}
          {entries.map((entry) => {
            const member = TEAM.members.find((m) => m.id === entry.memberId);
            return (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white/5 border border-white/10 rounded-xl px-5 py-4 flex items-center justify-between hover:border-white/20 transition-colors duration-200"
              >
                <div className="flex items-center gap-4">
                  <div className="w-9 h-9 rounded-full overflow-hidden border border-crimson/30">
                    <img
                      src={member?.avatar}
                      alt={member?.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(member?.name || "?")}&background=e63946&color=fff&size=64`;
                      }}
                    />
                  </div>
                  <div>
                    <p className="text-white text-sm font-semibold">
                      {member?.name}
                      <span className="text-crimson font-bold ml-2">
                        +{TEAM.currency}{Number(entry.amount).toLocaleString()}
                      </span>
                    </p>
                    <p className="text-white/30 text-xs mt-0.5">
                      {entry.date}{entry.note ? ` • ${entry.note}` : ""}
                    </p>
                  </div>
                </div>
                {isAdmin && (
                  <button
                    onClick={() => handleDeleteClick(entry)}
                    className="text-white/20 hover:text-crimson transition-colors duration-200 text-sm px-2 py-1 rounded-lg hover:bg-crimson/10"
                  >
                    ✕
                  </button>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Member Detail Modal */}
      <AnimatePresence>
        {selectedMember && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedMember(null)}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center px-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              transition={{ duration: 0.3 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#1a1a1a] border border-white/10 rounded-2xl overflow-hidden max-w-3xl w-full flex flex-col md:flex-row max-h-[85vh]"
            >
              <div className="md:w-2/5 flex flex-col">
                <div className="h-56 md:h-72 overflow-hidden">
                  <img
                    src={selectedMember.avatar}
                    alt={selectedMember.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedMember.name)}&background=e63946&color=fff&size=400`;
                    }}
                  />
                </div>
                <div className="p-6">
                  <p className="text-crimson text-xs font-semibold uppercase tracking-widest mb-1">{selectedMember.role}</p>
                  <h2 className="text-white text-2xl font-extrabold">{selectedMember.name}</h2>
                  <p className="text-white/40 text-sm mt-1">{selectedMember.statusDetail}</p>
                  <div className="mt-4 bg-crimson/10 border border-crimson/20 rounded-xl p-4 text-center">
                    <p className="text-white/40 text-xs uppercase tracking-wider mb-1">Total Saved</p>
                    <p className="text-crimson text-2xl font-extrabold">
                      {TEAM.currency}{selectedMember.total.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="md:w-3/5 p-6 overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-white font-bold text-lg">
                    Savings History<span className="text-crimson">.</span>
                  </h3>
                  <button onClick={() => setSelectedMember(null)} className="text-white/30 hover:text-white text-xl">✕</button>
                </div>

                {selectedMember.history.length === 0 ? (
                  <div className="text-center text-white/20 py-12">No entries yet.</div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {selectedMember.history.map((entry) => (
                      <div
                        key={entry.id}
                        className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 flex justify-between items-center"
                      >
                        <div>
                          <p className="text-white text-sm font-semibold">
                            +{TEAM.currency}{Number(entry.amount).toLocaleString()}
                          </p>
                          <p className="text-white/30 text-xs mt-0.5">
                            {entry.date}{entry.note ? ` • ${entry.note}` : ""}
                          </p>
                        </div>
                        {isAdmin && (
                          <button
                            onClick={() => handleDeleteClick(entry)}
                            className="text-white/20 hover:text-crimson transition-colors duration-200 text-sm px-2 py-1 rounded-lg hover:bg-crimson/10"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== DELETE CONFIRMATION MODALS ===== */}
      <AnimatePresence>

        {/* STEP 1 — First warning */}
        {deleteStep === 1 && deleteTarget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center px-4"
          >
            <motion.div
              initial={{ scale: 0.8, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8 }}
              className="bg-[#1a1a1a] border border-crimson/30 rounded-2xl p-8 max-w-md w-full text-center"
            >
              <div className="text-5xl mb-4">🤨</div>
              <h2 className="text-white font-extrabold text-xl mb-2">
                Bro... seriously?
              </h2>
              <p className="text-white/60 text-sm mb-6 leading-relaxed">
                You're about to delete{" "}
                <span className="text-crimson font-bold">{deleteMember?.name}</span>'s{" "}
                <span className="text-crimson font-bold">
                  {TEAM.currency}{Number(deleteTarget.amount).toLocaleString()}
                </span>{" "}
                taka?? That's like... their hard earned money bro 💀
                Are you SURE you wanna do this??
              </p>
              <div className="flex gap-3">
                <button
                  onClick={closeDelete}
                  className="flex-1 py-3 rounded-xl border border-white/10 text-white/50 hover:text-white hover:border-white/30 transition-all duration-200 font-semibold text-sm"
                >
                  No no no 😅
                </button>
                <button
                  onClick={handleDeleteStep2}
                  className="flex-1 py-3 rounded-xl bg-crimson/20 border border-crimson/40 text-crimson hover:bg-crimson hover:text-white transition-all duration-200 font-semibold text-sm"
                >
                  Yeah delete it 😈
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* STEP 2 — Bangla warning */}
        {deleteStep === 2 && deleteTarget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center px-4"
          >
            <motion.div
              initial={{ scale: 0.8, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8 }}
              className="bg-[#1a1a1a] border border-yellow-500/30 rounded-2xl p-8 max-w-md w-full text-center"
            >
              <div className="text-5xl mb-4">☠️</div>
              <h2 className="text-yellow-400 font-extrabold text-xl mb-2">
                ভাই থামো একটু!!
              </h2>
              <p className="text-white/60 text-sm mb-2 leading-relaxed">
                তুমি কি সত্যিই{" "}
                <span className="text-yellow-400 font-bold">{deleteMember?.name}</span> এর{" "}
                <span className="text-yellow-400 font-bold">
                  {TEAM.currency}{Number(deleteTarget.amount).toLocaleString()}
                </span>{" "}
                টাকা মুছে ফেলতে চাও?? 😭
              </p>
              <p className="text-white/40 text-xs mb-6 leading-relaxed">
                এই টাকা কিন্তু সে কষ্ট করে দিছে! তুমি কি নিশ্চিত?
                একবার মুছলে আর ফেরত আসবে না... 👀
              </p>
              <div className="flex gap-3">
                <button
                  onClick={closeDelete}
                  className="flex-1 py-3 rounded-xl border border-white/10 text-white/50 hover:text-white transition-all duration-200 font-semibold text-sm"
                >
                  না ভাই মাফ করো 🙏
                </button>
                <button
                  onClick={handleDeleteConfirmed}
                  className="flex-1 py-3 rounded-xl bg-red-900/40 border border-red-500/40 text-red-400 hover:bg-red-600 hover:text-white transition-all duration-200 font-semibold text-sm"
                >
                  হ্যাঁ মুছে দাও 💀
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* STEP 3 — After delete, funny final message */}
        {deleteStep === 3 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center px-4"
          >
            <motion.div
              initial={{ scale: 0.8, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8 }}
              className="bg-[#1a1a1a] border border-crimson/30 rounded-2xl p-8 max-w-md w-full text-center"
            >
              <div className="text-5xl mb-4">🕵️</div>
              <h2 className="text-crimson font-extrabold text-xl mb-3">
                Done. But guess what...
              </h2>
              <p className="text-white/70 text-sm leading-relaxed mb-3">
                Congratulations! You just committed financial crime in a friend group. 
                Your villain arc has officially started. 🦹
                The money is gone. Poof. Deleted. Into the void. 💨
              </p>
              <p className="text-white/50 text-xs leading-relaxed mb-4">
                Oh also... I already snitched on you.
                Master Kaizo got the notification before you even closed this popup. 
                He knows. He ALWAYS knows. 👁️
                <br /><br />
                <span className="text-yellow-400">
                  ভাই তুমি যা করলা সেটা Master Kaizo কে জানিয়ে দিলাম। 
                  এখন তুমি নিজেই সামলাও। আমার কাজ শেষ। 😇
                </span>
              </p>
              <button
                onClick={closeDelete}
                className="w-full py-3 rounded-xl bg-crimson text-white font-bold hover:bg-red-700 transition-all duration-200"
              >
                Okay okay I'm sorry 😭
              </button>
            </motion.div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}