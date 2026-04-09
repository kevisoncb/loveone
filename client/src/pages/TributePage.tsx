import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Heart, Music, Pause, Play, Volume2, VolumeX, Share2 } from "lucide-react";
import { useRoute } from "wouter";
import { trpc } from "@/lib/trpc";
import ReactPlayer from "react-player";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Helmet } from "react-helmet-async";

interface TimeLeft {
  years: number;
  months: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function calculateTimeDiff(startDate: Date): TimeLeft {
  const now = new Date();
  let years = now.getFullYear() - startDate.getFullYear();
  let months = now.getMonth() - startDate.getMonth();
  let days = now.getDate() - startDate.getDate();
  if (days < 0) {
    months--;
    const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    days += prevMonth.getDate();
  }
  if (months < 0) { years--; months += 12; }
  const diffMs = now.getTime() - startDate.getTime();
  const totalSecs = Math.floor(diffMs / 1000);
  return {
    years,
    months,
    days,
    hours: Math.floor((totalSecs % 86400) / 3600),
    minutes: Math.floor((totalSecs % 3600) / 60),
    seconds: totalSecs % 60,
  };
}

function LiveCounter({ startDate }: { startDate: Date }) {
  const [time, setTime] = useState<TimeLeft>(() => calculateTimeDiff(startDate));
  useEffect(() => {
    const interval = setInterval(() => setTime(calculateTimeDiff(startDate)), 1000);
    return () => clearInterval(interval);
  }, [startDate]);
  return (
    <div className="grid grid-cols-3 gap-3 w-full max-w-md mx-auto">
      {[
        { label: "Anos", value: time.years },
        { label: "Meses", value: time.months },
        { label: "Dias", value: time.days },
        { label: "Horas", value: time.hours },
        { label: "Min", value: time.minutes },
        { label: "Seg", value: time.seconds },
      ].map(({ label, value }) => (
        <div key={label} className="flex flex-col items-center glass rounded-2xl py-4 px-2">
          <span className="text-white font-bold text-3xl md:text-4xl leading-none">{String(value).padStart(2, "0")}</span>
          <span className="text-white/70 text-xs mt-2 font-medium uppercase tracking-widest" style={{ fontFamily: "Inter, sans-serif" }}>{label}</span>
        </div>
      ))}
    </div>
  );
}

function PhotoSlideshow({ photos }: { photos: string[] }) {
  const [current, setCurrent] = useState(0);
  useEffect(() => {
    if (photos.length <= 1) return;
    const interval = setInterval(() => setCurrent((p) => (p + 1) % photos.length), 4000);
    return () => clearInterval(interval);
  }, [photos.length]);
  return (
    <div className="relative w-full h-full">
      {photos.map((url, i) => (
        <motion.img
          key={url}
          src={url}
          alt={`Foto ${i + 1}`}
          className="absolute inset-0 w-full h-full object-cover"
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: i === current ? 1 : 0, scale: i === current ? 1 : 1.05 }}
          transition={{ duration: 1.2 }}
        />
      ))}
      {photos.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {photos.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-2 rounded-full transition-all ${i === current ? "bg-white w-6" : "bg-white/50 w-2"}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function SimplePlayer({ url }: { url: string }) {
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  return (
    <div className="glass rounded-2xl p-4 flex items-center gap-4 w-full max-w-md mx-auto">
      <Button size="sm" onClick={() => setPlaying(!playing)} className="w-10 h-10 rounded-full bg-primary hover:bg-primary/90 text-white flex-shrink-0 p-0">
        {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
      </Button>
      <div className="flex-1 min-w-0">
        <p className="text-white text-sm font-medium truncate" style={{ fontFamily: "Inter, sans-serif" }}>Nossa música</p>
        <p className="text-white/60 text-xs" style={{ fontFamily: "Inter, sans-serif" }}>{playing ? "Tocando..." : "Pausado"}</p>
      </div>
      <Button size="sm" variant="ghost" onClick={() => setMuted(!muted)} className="w-8 h-8 rounded-full text-white hover:bg-white/10 p-0">
        {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
      </Button>
      <ReactPlayer src={url} playing={playing} muted={muted} width="0" height="0" />
    </div>
  );
}

function SpotifyPlayer({ url }: { url: string }) {
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    if (!playing) return;
    const interval = setInterval(() => setProgress((p) => (p >= 100 ? 0 : p + 0.3)), 200);
    return () => clearInterval(interval);
  }, [playing]);
  return (
    <div className="glass rounded-3xl p-6 w-full max-w-md mx-auto">
      <div className="flex items-center gap-4 mb-5">
        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-rose-500 to-pink-700 flex items-center justify-center flex-shrink-0 shadow-lg">
          <Music className="w-8 h-8 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white font-semibold text-base truncate" style={{ fontFamily: "Cormorant Garamond, serif" }}>Nossa música</p>
          <p className="text-white/60 text-sm" style={{ fontFamily: "Inter, sans-serif" }}>Love365 ♥</p>
        </div>
      </div>
      <div className="w-full h-1 bg-white/20 rounded-full mb-5 overflow-hidden cursor-pointer">
        <div className="h-full bg-white rounded-full transition-all duration-200" style={{ width: `${progress}%` }} />
      </div>
      <div className="flex items-center justify-between">
        <Button size="sm" variant="ghost" onClick={() => setMuted(!muted)} className="w-9 h-9 rounded-full text-white hover:bg-white/10 p-0">
          {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </Button>
        <Button onClick={() => setPlaying(!playing)} className="w-14 h-14 rounded-full bg-white text-primary hover:bg-white/90 shadow-lg p-0">
          {playing ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
        </Button>
        <div className="w-9" />
      </div>
      <ReactPlayer src={url} playing={playing} muted={muted} width="0" height="0" />
    </div>
  );
}

function HeartsRain() {
  const hearts = useMemo(() => Array.from({ length: 18 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 8,
    duration: 8 + Math.random() * 5,
    size: 10 + Math.random() * 14,
  })), []);
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-10">
      {hearts.map((h) => (
        <motion.div
          key={h.id}
          className="absolute"
          style={{ left: `${h.left}%`, top: "110%" }}
          animate={{ y: [0, -(window.innerHeight + 150)], rotate: [0, 360], scale: [0.5, 1, 0.7] }}
          transition={{ duration: h.duration, repeat: Infinity, delay: h.delay, ease: "linear" }}
        >
          <Heart className="fill-rose-400/50 text-rose-400/50" style={{ width: h.size, height: h.size }} />
        </motion.div>
      ))}
    </div>
  );
}

export default function TributePage() {
  const [, params] = useRoute("/p/:slug");
  const slug = params?.slug || "";
  const { data, isLoading } = trpc.tribute.getBySlug.useQuery({ slug }, { enabled: !!slug });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-rose-900 to-pink-950 flex items-center justify-center">
        <Helmet>
          <title>Carregando...</title>
        </Helmet>
        <Heart className="w-12 h-12 text-white/50 fill-white/50 animate-pulse" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-rose-900 to-pink-950 flex items-center justify-center text-center p-6">
        <Helmet>
          <title>Página não encontrada</title>
          <meta name="description" content="Esta página de homenagem não existe ou foi removida." />
        </Helmet>
        <div>
          <Heart className="w-16 h-16 text-white/30 fill-white/30 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: "Cormorant Garamond, serif" }}>Página não encontrada</h1>
          <p className="text-white/60" style={{ fontFamily: "Inter, sans-serif" }}>Esta página de homenagem não existe ou foi removida.</p>
        </div>
      </div>
    );
  }

  if (data.isExpired) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-rose-900 to-pink-950 flex items-center justify-center text-center p-6">
        <Helmet>
          <title>Página expirada</title>
          <meta name="description" content="Esta página de homenagem expirou. Entre em contato com o criador para renovação." />
        </Helmet>
        <div>
          <Heart className="w-16 h-16 text-white/30 fill-white/30 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: "Cormorant Garamond, serif" }}>Página expirada</h1>
          <p className="text-white/60" style={{ fontFamily: "Inter, sans-serif" }}>Esta página de homenagem expirou. Entre em contato com o criador para renovação.</p>
        </div>
      </div>
    );
  }

  const photos = JSON.parse(data.photoUrls || "[]") as string[];
  const isPremium = data.planType === "premium";
  const shareUrl = `${window.location.origin}/p/${slug}`;
  const title = `${data.partner1Name} & ${data.partner2Name} - Uma homenagem no Love365`;
  const description = `Uma página para celebrar o nosso amor. Juntos desde ${new Date(data.relationshipStartDate).toLocaleDateString("pt-BR")}.`;
  const imageUrl = photos[0] || "/default-og-image.png";

  const handleShare = async () => {
    if (navigator.share) {
      try { await navigator.share({ title, text: description, url: shareUrl }); }
      catch {}
    } else {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Link copiado!");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-900 via-pink-950 to-rose-900 relative overflow-hidden">
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content={imageUrl} />
        <meta property="og:url" content={shareUrl} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={imageUrl} />
      </Helmet>
      
      {/* Background */}
      <div className="fixed inset-0 z-0">
        {photos.length > 0 ? <PhotoSlideshow photos={photos} /> : <div className="w-full h-full bg-gradient-to-b from-rose-900 to-pink-950" />}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/50 to-black/70" />
      </div>

      {/* Hearts Rain (Premium) */}
      {isPremium && <HeartsRain />}

      {/* Content */}
      <div className="relative z-20 min-h-screen flex flex-col items-center justify-center p-6 py-20">
        {/* Logo */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 mb-10">
          <Heart className="w-4 h-4 text-rose-300 fill-rose-300" />
          <span className="text-white/80 text-xs font-medium tracking-widest uppercase" style={{ fontFamily: "Inter, sans-serif" }}>Love365</span>
          <Heart className="w-4 h-4 text-rose-300 fill-rose-300" />
        </motion.div>

        {/* Names */}
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} className="text-center mb-6">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-3 leading-tight" style={{ fontFamily: "Cormorant Garamond, serif" }}>
            {data.partner1Name}
            <span className="text-rose-300 mx-3">&</span>
            {data.partner2Name}
          </h1>
          <p className="text-white/70 text-sm md:text-base" style={{ fontFamily: "Inter, sans-serif" }}>
            Juntos desde {new Date(data.relationshipStartDate).toLocaleDateString("pt-BR")}
          </p>
        </motion.div>

        {/* Divider */}
        <motion.div initial={{ opacity: 0, scaleX: 0 }} animate={{ opacity: 1, scaleX: 1 }} transition={{ delay: 0.4 }} className="w-32 h-px bg-gradient-to-r from-transparent via-rose-300 to-transparent mb-10" />

        {/* Counter */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="mb-10 w-full">
          <p className="text-white/80 text-center mb-6 text-sm tracking-widest uppercase" style={{ fontFamily: "Inter, sans-serif" }}>Nosso tempo juntos</p>
          <LiveCounter startDate={new Date(data.relationshipStartDate)} />
        </motion.div>

        {/* Music Player */}
        {data.musicYoutubeUrl && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }} className="w-full mb-10">
            {isPremium ? <SpotifyPlayer url={data.musicYoutubeUrl} /> : <SimplePlayer url={data.musicYoutubeUrl} />}
          </motion.div>
        )}

        {/* Share */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}>
          <Button onClick={handleShare} variant="outline" className="rounded-full glass border-white/30 text-white hover:bg-white/10" style={{ fontFamily: "Inter, sans-serif" }}>
            <Share2 className="w-4 h-4 mr-2" />
            Compartilhar
          </Button>
        </motion.div>

        {/* Watermark */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }} className="mt-16">
          <a href="/" className="flex items-center gap-1.5 text-white/40 hover:text-white/70 transition-colors text-xs" style={{ fontFamily: "Inter, sans-serif" }}>
            Feito com <Heart className="w-3 h-3 fill-rose-300 text-rose-300" /> no Love365
          </a>
        </motion.div>
      </div>
    </div>
  );
}
