import { useState, useEffect, useRef } from "react";
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
import { useAuth } from "../context/AuthContext";
import { CLOUDINARY } from "../config/cloudinary";
import { TEAM } from "../config/team";
import Navbar from "../components/Navbar";
import MotionBg from "../components/MotionBg";
import { Upload, X, Trash2 } from "lucide-react";

export default function Gallery() {
  const { user } = useAuth();
  const isAdmin = user?.email === TEAM.adminEmail;
  const isMember = !!user;
  const [photos, setPhotos] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [selected, setSelected] = useState(null);
  const [caption, setCaption] = useState("");
  const [tag, setTag] = useState("group");
  const [preview, setPreview] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [filter, setFilter] = useState("all");
  const fileRef = useRef();

  // Fetch photos
useEffect(() => {
    const q = query(collection(db, "gallery"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, 
      (snap) => {
        setPhotos(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      },
      (error) => {
        console.error("Gallery error:", error);
      }
    );
    return () => unsub();
  }, []);

  // Filter options
  const filterOptions = [
    { label: "All", value: "all" },
    { label: "Group", value: "group" },
    ...TEAM.members.map((m) => ({ label: m.name.split(" ")[0], value: m.id })),
  ];

  const filtered = filter === "all"
    ? photos
    : photos.filter((p) => p.tag === filter);

  const handleFile = (file) => {
    if (!file) return;
    setPreview({ file, url: URL.createObjectURL(file) });
  };

  const handleUpload = async () => {
    if (!preview?.file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", preview.file);
      formData.append("upload_preset", CLOUDINARY.uploadPreset);
      formData.append("folder", "squad-gallery");

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY.cloudName}/image/upload`,
        { method: "POST", body: formData }
      );
      const data = await res.json();

      await addDoc(collection(db, "gallery"), {
        url: data.secure_url,
        publicId: data.public_id,
        caption: caption || "",
        tag: tag,
        uploadedBy: user.email,
        createdAt: new Date().toISOString(),
      });

      setPreview(null);
      setCaption("");
      setTag("group");
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (photo) => {
    await deleteDoc(doc(db, "gallery", photo.id));
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white relative">
      <MotionBg />
      <Navbar />

      <div className="max-w-6xl mx-auto px-6 pt-32 pb-24">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <p className="text-crimson text-sm font-semibold uppercase tracking-widest mb-3">
            Our Moments
          </p>
          <h1 className="text-4xl md:text-5xl font-extrabold">
            Gallery<span className="text-crimson">.</span>
          </h1>
          <p className="text-white/50 mt-4 text-lg">
            Memories we made together.
          </p>
        </motion.div>

        {/* Upload Section — Members Only */}
        {isMember && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-10"
          >
            {!preview ? (
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOver(false);
                  handleFile(e.dataTransfer.files[0]);
                }}
                onClick={() => fileRef.current.click()}
                className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-300 ${
                  dragOver
                    ? "border-crimson bg-crimson/10"
                    : "border-white/10 hover:border-crimson/50 hover:bg-white/5"
                }`}
              >
                <Upload size={28} className="mx-auto mb-3 text-white/20" />
                <p className="text-white/40 text-sm">
                  Drag & drop or{" "}
                  <span className="text-crimson">click to browse</span>
                </p>
                <p className="text-white/20 text-xs mt-1">PNG, JPG, WEBP</p>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFile(e.target.files[0])}
                />
              </div>
            ) : (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <div className="flex flex-col sm:flex-row gap-6">
                  {/* Preview */}
                  <div className="w-full sm:w-56 h-44 rounded-xl overflow-hidden flex-shrink-0">
                    <img
                      src={preview.url}
                      alt="preview"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Form */}
                  <div className="flex-1 flex flex-col gap-4">

                    {/* Tag selector */}
                    <div>
                      <label className="text-white/40 text-xs uppercase tracking-wider mb-2 block">
                        Who is this photo of?
                      </label>
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => setTag("group")}
                          className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200 ${
                            tag === "group"
                              ? "bg-crimson border-crimson text-white"
                              : "bg-white/5 border-white/10 text-white/40 hover:border-crimson/50"
                          }`}
                        >
                          👥 Group
                        </button>
                        {TEAM.members.map((m) => (
                          <button
                            key={m.id}
                            onClick={() => setTag(m.id)}
                            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200 ${
                              tag === m.id
                                ? "bg-crimson border-crimson text-white"
                                : "bg-white/5 border-white/10 text-white/40 hover:border-crimson/50"
                            }`}
                          >
                            {m.name.split(" ")[0]}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Caption */}
                    <div>
                      <label className="text-white/40 text-xs uppercase tracking-wider mb-2 block">
                        Caption (optional)
                      </label>
                      <input
                        type="text"
                        value={caption}
                        onChange={(e) => setCaption(e.target.value)}
                        placeholder="Add a caption..."
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white text-sm outline-none focus:border-crimson transition-colors duration-200 placeholder:text-white/20"
                      />
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 mt-auto">
                      <button
                        onClick={handleUpload}
                        disabled={uploading}
                        className="flex-1 bg-crimson text-white py-3 rounded-xl font-semibold text-sm hover:bg-red-700 transition-colors duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {uploading ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Upload size={14} />
                            Upload
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => setPreview(null)}
                        className="px-4 rounded-xl border border-white/10 text-white/40 hover:text-white hover:border-white/30 transition-all duration-200"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Filter Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-wrap gap-2 mb-8"
        >
          {filterOptions.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider border transition-all duration-200 ${
                filter === f.value
                  ? "bg-crimson border-crimson text-white shadow-[0_0_15px_rgba(230,57,70,0.3)]"
                  : "bg-white/5 border-white/10 text-white/40 hover:border-crimson/50 hover:text-white"
              }`}
            >
              {f.label}
            </button>
          ))}
        </motion.div>

        {/* Photos Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-24 border border-dashed border-white/10 rounded-2xl">
            <p className="text-white/20 text-sm">
              No photos here yet.
            </p>
          </div>
        ) : (
          <div className="columns-2 sm:columns-3 lg:columns-4 gap-4 space-y-4">
            {filtered.map((photo, i) => (
              <motion.div
                key={photo.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="break-inside-avoid relative group rounded-xl overflow-hidden border border-white/10 hover:border-crimson/40 transition-all duration-300 cursor-pointer"
                onClick={() => setSelected(photo)}
              >
                <img
                  src={photo.url}
                  alt={photo.caption}
                  className="w-full object-cover"
                />

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
                  {photo.caption && (
                    <p className="text-white text-xs font-medium">
                      {photo.caption}
                    </p>
                  )}
                </div>

                {/* Admin delete */}
                {isAdmin && (
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(photo); }}
                    className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 backdrop-blur-sm opacity-0 group-hover:opacity-100 flex items-center justify-center hover:bg-crimson/60 transition-all duration-200"
                  >
                    <Trash2 size={12} className="text-white" />
                  </button>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox — click photo to zoom */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelected(null)}
            className="fixed inset-0 bg-black/95 backdrop-blur-sm z-50 flex items-center justify-center px-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85 }}
              transition={{ duration: 0.3 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-4xl w-full"
            >
              <img
                src={selected.url}
                alt={selected.caption}
                className="w-full max-h-[85vh] object-contain rounded-2xl"
              />
              {selected.caption && (
                <p className="text-white/50 text-sm text-center mt-4">
                  {selected.caption}
                </p>
              )}
              <button
                onClick={() => setSelected(null)}
                className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-crimson transition-all duration-200"
              >
                <X size={14} className="text-white" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <footer className="text-center py-8 text-white/30 text-sm border-t border-white/10">
        © {new Date().getFullYear()} {TEAM.name}. All rights reserved.
      </footer>
    </div>
  );
}