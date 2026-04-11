
import { Heart, Music, Pause, Play, Volume2, VolumeX } from "lucide-react";
import { motion } from "framer-motion";

// A simplified, static version of the live page for preview purposes

// Fake Counter component for preview
function StaticCounter() {
  return (
    <div className="grid grid-cols-3 gap-3 w-full max-w-md mx-auto">
      {[
        { label: "Anos", value: "00" },
        { label: "Meses", value: "00" },
        { label: "Dias", value: "00" },
        { label: "Horas", value: "00" },
        { label: "Min", value: "00" },
        { label: "Seg", value: "00" },
      ].map(({ label, value }) => (
        <div key={label} className="flex flex-col items-center glass rounded-2xl py-4 px-2">
          <span className="text-white font-bold text-3xl md:text-4xl leading-none">{value}</span>
          <span className="text-white/70 text-xs mt-2 font-medium uppercase tracking-widest">{label}</span>
        </div>
      ))}
    </div>
  );
}

// Static photo slideshow for preview
function StaticPhotoSlideshow({ photos }: { photos: string[] }) {
  return (
    <div className="relative w-full h-full">
      {photos.length > 0 ? (
        <img src={photos[0]} alt="Preview" className="absolute inset-0 w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full bg-gradient-to-b from-rose-900 to-pink-950" />
      )}
    </div>
  );
}

// Static music player for preview
function StaticPlayer({ isPremium }: { isPremium: boolean }) {
  return (
    <div className={`glass ${isPremium ? 'rounded-3xl p-6' : 'rounded-2xl p-4'} w-full max-w-md mx-auto`}>
       <div className="flex items-center gap-4">
          <div className={`flex-shrink-0 ${isPremium ? 'w-16 h-16 rounded-xl bg-gradient-to-br from-rose-500 to-pink-700 shadow-lg' : ''} flex items-center justify-center`}>
            <Music className={`text-white ${isPremium ? 'w-8 h-8' : 'w-6 h-6'}`} />
          </div>
          <div className="flex-1 min-w-0">
            <p className={`text-white font-semibold ${isPremium ? 'text-base' : 'text-sm'}`}>Nossa música</p>
            <p className="text-white/60 text-xs">Love365 ♥</p>
          </div>
       </div>
       {isPremium && <div className="w-full h-1 bg-white/20 rounded-full my-5" />}
       <div className="flex items-center justify-between mt-4">
        <VolumeX className="w-4 h-4 text-white/70" />
        <div className="w-14 h-14 rounded-full bg-white text-primary flex items-center justify-center"><Play className="w-6 h-6 ml-0.5" /></div>
        <div className="w-4" />
       </div>
    </div>
  );
}

// The main preview component
export function TributePreview({ partner1Name, partner2Name, relationshipDate, photos, music, plan }) {
  const isPremium = plan === "premium";

  return (
     <div className="w-full h-[700px] bg-gradient-to-b from-rose-900 to-pink-950 relative overflow-hidden rounded-2xl shadow-lg">
        {/* Background Photo */}
        <div className="absolute inset-0 z-0">
          <StaticPhotoSlideshow photos={photos} />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/70" />
        </div>

        {isPremium && <div className="fixed inset-0 pointer-events-none z-10">...</div>} {/* Hearts placeholder */}

        {/* Content */}
        <div className="relative z-20 flex flex-col items-center justify-center h-full p-6 text-center">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-5xl font-bold text-white leading-tight">
              {partner1Name || "Nome 1"}
              <span className="text-rose-300 mx-3">&</span>
              {partner2Name || "Nome 2"}
            </h1>
            <p className="text-white/70 text-sm mt-2">
              {relationshipDate ? `Juntos desde ${new Date(relationshipDate).toLocaleDateString("pt-BR")}` : "Data do início"}
            </p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="my-10 w-full">
             <StaticCounter />
          </motion.div>

          {music && (
             <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full">
                <StaticPlayer isPremium={isPremium} />
             </motion.div>
          )}
        </div>
     </div>
  );
}
