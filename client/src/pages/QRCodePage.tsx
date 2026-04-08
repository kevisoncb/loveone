import { useRoute } from "wouter";
import { Heart, Download, Copy, Check, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import QRCode from "qrcode";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useLocation } from "wouter";

export default function QRCodePage() {
  const [, params] = useRoute("/qr/:slug");
  const [, navigate] = useLocation();
  const slug = params?.slug || "";
  const [qrCode, setQrCode] = useState<string>("");
  const [copied, setCopied] = useState(false);

  const pageUrl = `${window.location.origin}/p/${slug}`;

  useEffect(() => {
    if (!slug) return;
    const opts = {
      errorCorrectionLevel: "H",
      width: 400,
      margin: 2,
      color: { dark: "#be123c", light: "#fff" },
    } as any;
    QRCode.toDataURL(pageUrl, opts, (err: any, url: string) => {
      if (!err) setQrCode(url);
    });
  }, [slug, pageUrl]);

  const handleDownload = () => {
    if (!qrCode) return;
    const link = document.createElement("a");
    link.href = qrCode;
    link.download = `love365-${slug}-qrcode.png`;
    link.click();
    toast.success("QR Code baixado!");
  };

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(pageUrl);
    setCopied(true);
    toast.success("Link copiado!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 to-pink-50">
      <div className="sticky top-0 z-50 glass border-b border-white/30">
        <div className="container flex items-center justify-between h-16">
          <button onClick={() => navigate("/dashboard")} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span style={{ fontFamily: "Inter, sans-serif" }}>Voltar</span>
          </button>
          <div className="flex items-center gap-2">
            <Heart className="w-6 h-6 text-primary fill-primary" />
            <span className="text-xl font-bold text-gradient-rose" style={{ fontFamily: "Cormorant Garamond, serif" }}>Love365</span>
          </div>
          <div className="w-20" />
        </div>
      </div>

      <div className="container max-w-2xl py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-3" style={{ fontFamily: "Cormorant Garamond, serif" }}>QR Code da sua página</h1>
          <p className="text-muted-foreground" style={{ fontFamily: "Inter, sans-serif" }}>Compartilhe sua página de homenagem de forma fácil e elegante</p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} className="flex flex-col items-center">
            <div className="bg-white rounded-3xl p-8 shadow-lg border border-border">
              {qrCode ? (
                <img src={qrCode} alt="QR Code" className="w-80 h-80 rounded-2xl" />
              ) : (
                <div className="w-80 h-80 rounded-2xl bg-muted animate-pulse" />
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-4 text-center" style={{ fontFamily: "Inter, sans-serif" }}>Escaneie com qualquer câmera de celular</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="flex flex-col justify-center gap-6">
            <div className="bg-card rounded-2xl border border-border p-6">
              <h3 className="font-semibold text-lg mb-3 text-foreground" style={{ fontFamily: "Cormorant Garamond, serif" }}>Link da página</h3>
              <div className="flex items-center gap-2 bg-muted rounded-xl p-3 mb-3">
                <input type="text" value={pageUrl} readOnly className="flex-1 bg-transparent text-sm text-foreground outline-none" style={{ fontFamily: "Inter, sans-serif" }} />
              </div>
              <Button onClick={handleCopyLink} className="w-full rounded-full bg-primary hover:bg-primary/90 text-white" style={{ fontFamily: "Inter, sans-serif" }}>
                {copied ? <Check className="w-4 h-4 mr-2 text-green-400" /> : <Copy className="w-4 h-4 mr-2" />}
                {copied ? "Copiado!" : "Copiar link"}
              </Button>
            </div>

            <Button onClick={handleDownload} disabled={!qrCode} className="w-full bg-primary hover:bg-primary/90 text-white rounded-full py-6 text-lg shadow-lg" style={{ fontFamily: "Inter, sans-serif" }}>
              <Download className="w-5 h-5 mr-2" />
              Baixar QR Code
            </Button>

            <div className="bg-accent/30 rounded-xl p-4 border border-primary/20">
              <p className="text-sm text-muted-foreground" style={{ fontFamily: "Inter, sans-serif" }}>✓ Use o QR Code em convites, molduras, presentes ou redes sociais</p>
              <p className="text-sm text-muted-foreground mt-2" style={{ fontFamily: "Inter, sans-serif" }}>✓ O link permanece ativo enquanto sua página estiver ativa</p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
