import { Heart } from "lucide-react";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-900 to-pink-950 flex items-center justify-center text-center p-6">
      <div>
        <Heart className="w-16 h-16 text-white/30 fill-white/30 mx-auto mb-4" />
        <h1 className="text-4xl font-bold text-white mb-2" style={{ fontFamily: "Cormorant Garamond, serif" }}>404 - Página não encontrada</h1>
        <p className="text-white/60" style={{ fontFamily: "Inter, sans-serif" }}>A página que você está procurando não existe ou foi movida.</p>
      </div>
    </div>
  );
}
