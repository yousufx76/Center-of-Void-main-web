export default function MotionBg() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Grid */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(#e63946 1px, transparent 1px), linear-gradient(90deg, #e63946 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Glow top left */}
      <div
        className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full opacity-20 blur-[120px]"
        style={{ background: "#e63946" }}
      />

      {/* Glow bottom right */}
      <div
        className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full opacity-10 blur-[120px]"
        style={{ background: "#e63946" }}
      />

      {/* Floating orbs */}
      <div
        className="absolute top-1/3 left-1/2 w-64 h-64 rounded-full opacity-5 blur-[80px] animate-pulse"
        style={{ background: "#e63946" }}
      />
      <div
        className="absolute top-2/3 left-1/4 w-48 h-48 rounded-full opacity-5 blur-[80px] animate-pulse"
        style={{ background: "#e63946", animationDelay: "1s" }}
      />
    </div>
  );
}