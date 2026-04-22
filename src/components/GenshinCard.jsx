import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ExternalLink, Swords, Shield, Zap, X, Heart, Wind, Crosshair } from "lucide-react";

let charMapCache = null;

async function getCharMap() {
  if (charMapCache) return charMapCache;
  const res = await fetch(
    "https://raw.githubusercontent.com/EnkaNetwork/API-docs/master/store/characters.json"
  );
  const json = await res.json();
  const map = {};
  for (const [id, data] of Object.entries(json)) {
    const side = data.SideIconName || "";
    const name = side.replace("UI_AvatarIcon_Side_", "");
    if (name) map[parseInt(id)] = { name, icon: data.SideIconName };
  }
  charMapCache = map;
  return map;
}

// Get icon URL directly from avatar data (works even for unknown chars)
function getAvatarIconUrl(avatar, charMap) {
  const charId = avatar.avatarId;
  // Try charMap first
  if (charMap[charId]?.name) {
    return `https://enka.network/ui/UI_AvatarIcon_${charMap[charId].name}.png`;
  }
  // Fallback: use the icon from costume or flat data
  const costume = avatar.costumeId;
  if (costume) {
    return `https://enka.network/ui/UI_AvatarIcon_${costume}.png`;
  }
  return null;
}

function getCharName(avatar, charMap) {
  const charId = avatar.avatarId;
  if (charMap[charId]?.name) return charMap[charId].name;
  return `Unknown`;
}

// fightPropMap keys
const PROPS = {
  HP:        { key: "2000", label: "HP",           icon: "❤️" },
  ATK:       { key: "2001", label: "ATK",          icon: "⚔️" },
  DEF:       { key: "2002", label: "DEF",          icon: "🛡️" },
  EM:        { key: "28",   label: "Elem. Mastery", icon: "🌿" },
  CRIT_RATE: { key: "20",   label: "Crit Rate",    icon: "🎯" },
  CRIT_DMG:  { key: "22",   label: "Crit DMG",     icon: "💥" },
  ER:        { key: "23",   label: "Energy Recharge", icon: "⚡" },
};

function StatRow({ icon, label, value }) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-white/5">
      <span className="text-white/40 text-xs flex items-center gap-1.5">
        <span>{icon}</span>{label}
      </span>
      <span className="text-white text-xs font-semibold">{value}</span>
    </div>
  );
}

function CharModal({ avatar, charMap, onClose }) {
  const charName = getCharName(avatar, charMap);
  const iconUrl = getAvatarIconUrl(avatar, charMap);
  const level = avatar.propMap?.["4001"]?.val || "?";
  const constellation = avatar.talentIdList?.length || 0;
  const friendshipLevel = avatar.fetterInfo?.expLevel || 0;
  const props = avatar.fightPropMap || {};

  const weapon = avatar.equipList?.find(e => e.flat?.itemType === "ITEM_WEAPON");
  const artifacts = avatar.equipList?.filter(e => e.flat?.itemType === "ITEM_RELIQUARY") || [];

  const artifactSlots = {
    EQUIP_BRACER:   "Flower",
    EQUIP_NECKLACE: "Plume",
    EQUIP_SHOES:    "Sands",
    EQUIP_RING:     "Goblet",
    EQUIP_DRESS:    "Circlet",
  };

  const fmt = (v, pct = false) => {
    if (!v && v !== 0) return "—";
    return pct ? `${(v * 100).toFixed(1)}%` : Math.round(v).toLocaleString();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.75)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.92, opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="bg-[#141414] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="relative bg-crimson/10 border-b border-white/10 p-5 flex items-center gap-4">
          <div className="w-16 h-16 rounded-xl overflow-hidden bg-crimson/20 border border-crimson/30 flex-shrink-0">
            {iconUrl ? (
              <img src={iconUrl} alt={charName} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-crimson font-bold text-lg">?</div>
            )}
          </div>
          <div>
            <h3 className="text-white font-extrabold text-xl">{charName}</h3>
            <p className="text-white/40 text-sm mt-0.5">
              Lv.{level} · C{constellation} · F{friendshipLevel}
            </p>
          </div>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/30 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Stats */}
          <div>
            <p className="text-white/30 text-xs uppercase tracking-widest mb-3">Stats</p>
            <div className="bg-white/5 rounded-xl p-3">
              <StatRow icon="❤️" label="HP"              value={fmt(props["2000"])} />
              <StatRow icon="⚔️" label="ATK"             value={fmt(props["2001"])} />
              <StatRow icon="🛡️" label="DEF"             value={fmt(props["2002"])} />
              <StatRow icon="🌿" label="Elem. Mastery"   value={fmt(props["28"])} />
              <StatRow icon="🎯" label="Crit Rate"       value={fmt(props["20"], true)} />
              <StatRow icon="💥" label="Crit DMG"        value={fmt(props["22"], true)} />
              <StatRow icon="⚡" label="Energy Recharge" value={fmt(props["23"], true)} />
            </div>

            {/* Weapon */}
            {weapon && (
              <>
                <p className="text-white/30 text-xs uppercase tracking-widest mt-4 mb-3">Weapon</p>
                <div className="bg-white/5 rounded-xl p-3 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg overflow-hidden bg-crimson/10 border border-crimson/20 flex-shrink-0">
                    <img
                      src={`https://enka.network/ui/${weapon.flat?.icon}.png`}
                      alt="weapon"
                      className="w-full h-full object-cover"
                      onError={e => { e.target.style.display = "none"; }}
                    />
                  </div>
                  <div>
                    <p className="text-white text-sm font-semibold">
                      {weapon.flat?.nameTextMapHash ? "Weapon" : "Unknown Weapon"}
                    </p>
                    <p className="text-white/40 text-xs">
                      Lv.{weapon.weapon?.level} ·
                      R{weapon.weapon?.affixMap ? Object.values(weapon.weapon.affixMap)[0] + 1 : 1}
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Artifacts */}
          <div>
            <p className="text-white/30 text-xs uppercase tracking-widest mb-3">Artifacts</p>
            <div className="flex flex-col gap-2">
              {artifacts.length === 0 && (
                <p className="text-white/20 text-sm">No artifacts data.</p>
              )}
              {artifacts.map((art, i) => {
                const slot = artifactSlots[art.flat?.equipType] || art.flat?.equipType || "—";
                const mainStat = art.flat?.reliquaryMainstat;
                return (
                  <div key={i} className="bg-white/5 rounded-xl p-3 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-crimson/10 border border-crimson/20 flex-shrink-0">
                      <img
                        src={`https://enka.network/ui/${art.flat?.icon}.png`}
                        alt={slot}
                        className="w-full h-full object-cover"
                        onError={e => { e.target.style.display = "none"; }}
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="text-white/60 text-xs">{slot}</p>
                      <p className="text-white text-xs font-semibold truncate">
                        +{art.reliquary?.level - 1 || 0}
                        {mainStat ? ` · ${mainStat.mainPropId?.replace(/_/g, " ")}` : ""}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function GenshinCard({ uid, akashaURL }) {
  const [data, setData] = useState(null);
  const [charMap, setCharMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState(null);

  useEffect(() => {
    if (!uid) return;
    setLoading(true);
    setError(false);
    setData(null);

    Promise.all([
      fetch(`/enka/api/uid/${uid}`).then(res => {
        if (!res.ok) throw new Error("Bad response");
        return res.json();
      }),
      getCharMap(),
    ])
      .then(([playerData, map]) => {
        setData(playerData);
        setCharMap(map);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, [uid]);

  if (!uid) return null;

  const profileAvatarId = data?.playerInfo?.profilePicture?.avatarId;
  const profileAvatarName = profileAvatarId ? charMap[profileAvatarId]?.name : null;
  const profileAvatarUrl = profileAvatarName
    ? `https://enka.network/ui/UI_AvatarIcon_${profileAvatarName}.png`
    : null;

  return (
    <>
      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">

        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4">
          <h2 className="text-white font-bold text-lg">
            Genshin Impact<span className="text-crimson">.</span>
          </h2>
          {akashaURL && (
            <a
              href={akashaURL}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest px-4 py-2 border border-crimson/40 text-crimson hover:bg-crimson hover:text-white rounded-full transition-all duration-300"
            >
              <ExternalLink size={12} />
              Akasha
            </a>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-crimson/20 border-t-crimson rounded-full animate-spin" />
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="text-center py-10 px-6">
            <p className="text-white/20 text-sm">
              Could not load data. Profile might be private or UID is incorrect.
            </p>
          </div>
        )}

        {/* Player Banner */}
        {data?.playerInfo && !loading && (
          <div className="mx-4 mb-4 rounded-xl overflow-hidden border border-crimson/20" style={{ background: "linear-gradient(135deg, rgba(230,57,70,0.12) 0%, rgba(230,57,70,0.04) 100%)" }}>
            <div className="flex items-center gap-4 p-4">
              {/* Avatar */}
              <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-crimson/40 flex-shrink-0 bg-crimson/20">
                {profileAvatarUrl ? (
                  <img
                    src={profileAvatarUrl}
                    alt="profile"
                    className="w-full h-full object-cover"
                    onError={e => { e.target.style.display = "none"; }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-crimson font-black text-xl">
                    {data.playerInfo.level}
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-white font-extrabold text-base truncate">
                  {data.playerInfo.nickname}
                </p>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className="text-xs bg-crimson/20 text-crimson px-2 py-0.5 rounded-full font-semibold">
                    AR {data.playerInfo.level}
                  </span>
                  <span className="text-xs bg-white/5 text-white/40 px-2 py-0.5 rounded-full">
                    WL {data.playerInfo.worldLevel}
                  </span>
                  <span className="text-xs bg-white/5 text-white/40 px-2 py-0.5 rounded-full">
                    UID {uid}
                  </span>
                </div>
                {data.playerInfo.signature && (
                  <p className="text-white/30 text-xs mt-1.5 italic truncate">
                    "{data.playerInfo.signature}"
                  </p>
                )}
              </div>

              {/* Achievements */}
              <div className="text-right flex-shrink-0">
                <p className="text-crimson font-extrabold text-lg">
                  {data.playerInfo.finishAchievementNum}
                </p>
                <p className="text-white/30 text-xs">Achievements</p>
              </div>
            </div>
          </div>
        )}

        {/* Character Showcase */}
        {data?.avatarInfoList && !loading && (
          <div className="px-4 pb-5">
            <p className="text-white/30 text-xs uppercase tracking-widest mb-3 px-1">
              Showcase Characters
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {data.avatarInfoList.map((avatar, i) => {
                const charName = getCharName(avatar, charMap);
                const iconUrl = getAvatarIconUrl(avatar, charMap);
                const level = avatar.propMap?.["4001"]?.val || "?";
                const constellation = avatar.talentIdList?.length || 0;
                const friendshipLevel = avatar.fetterInfo?.expLevel || 0;
                const weapon = avatar.equipList?.find(e => e.flat?.itemType === "ITEM_WEAPON");
                const weaponLevel = weapon?.weapon?.level || 0;

                return (
                  <motion.button
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.04 }}
                    onClick={() => setSelectedAvatar(avatar)}
                    className="bg-white/5 border border-white/10 rounded-xl p-3 hover:border-crimson/40 hover:bg-crimson/5 transition-all duration-200 text-left w-full group cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      {/* Icon */}
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-crimson/10 border border-crimson/20 flex-shrink-0 group-hover:border-crimson/40 transition-colors">
                        {iconUrl ? (
                          <img
                            src={iconUrl}
                            alt={charName}
                            className="w-full h-full object-cover"
                            onError={e => { e.target.style.display = "none"; }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-crimson/50 text-xs">?</div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-white font-semibold text-sm truncate">{charName}</p>
                          <span className="text-crimson text-xs font-bold ml-2">Lv.{level}</span>
                        </div>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="flex items-center gap-1 text-white/30 text-xs">
                            <Swords size={10} />C{constellation}
                          </span>
                          <span className="flex items-center gap-1 text-white/30 text-xs">
                            <Shield size={10} />F{friendshipLevel}
                          </span>
                          {weaponLevel > 0 && (
                            <span className="flex items-center gap-1 text-white/30 text-xs">
                              <Zap size={10} />W.Lv{weaponLevel}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Click hint */}
                      <span className="text-white/10 text-xs group-hover:text-crimson/40 transition-colors">›</span>
                    </div>
                  </motion.button>
                );
              })}
            </div>

            {data.avatarInfoList.length === 0 && (
              <div className="text-center py-8">
                <p className="text-white/20 text-sm">No characters in showcase. Add some in-game!</p>
              </div>
            )}
          </div>
        )}

        {/* No showcase */}
        {data?.playerInfo && !data?.avatarInfoList && !loading && (
          <div className="text-center py-8 mx-4 mb-4 border border-white/5 rounded-xl">
            <p className="text-white/20 text-sm">No character showcase set. Enable it in-game!</p>
          </div>
        )}
      </div>

      {/* Character Detail Modal */}
      <AnimatePresence>
        {selectedAvatar && (
          <CharModal
            avatar={selectedAvatar}
            charMap={charMap}
            onClose={() => setSelectedAvatar(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}