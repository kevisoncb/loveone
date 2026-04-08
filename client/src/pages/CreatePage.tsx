import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Heart, Upload, X, Music, Calendar, Crown, Sparkles, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
const PRODUCTS = {
  essential: { features: { maxPhotos: 3 } },
  premium: { features: { maxPhotos: 5 } },
} as const;

export default function CreatePage() {
  const { isAuthenticated, loading } = useAuth();
  const [, navigate] = useLocation();
  const [step, setStep] = useState(1);
  const [selectedPlan, setSelectedPlan] = useState<"essential" | "premium">("essential");
  const [partner1Name, setPartner1Name] = useState("");
  const [partner2Name, setPartner2Name] = useState("");
  const [relationshipDate, setRelationshipDate] = useState("");
  const [musicUrl, setMusicUrl] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  const uploadMutation = trpc.tribute.uploadPhoto.useMutation();
  const createMutation = trpc.tribute.create.useMutation({
    onSuccess: (page) => {
      toast.success("Página criada com sucesso!");
      navigate(`/p/${page.uniqueSlug}`);
    },
    onError: () => toast.error("Erro ao criar página"),
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const plan = params.get("plan");
    if (plan === "premium" || plan === "essential") {
      setSelectedPlan(plan);
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Heart className="w-8 h-8 text-primary fill-primary animate-pulse" />
      </div>
    );
  }

  if (!isAuthenticated) {
    window.location.href = getLoginUrl();
    return null;
  }

  const maxPhotos = PRODUCTS[selectedPlan].features.maxPhotos;

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (photos.length + files.length > maxPhotos) {
      toast.error(`Você pode adicionar no máximo ${maxPhotos} fotos no plano ${selectedPlan === "premium" ? "Premium" : "Essencial"}`);
      return;
    }

    setUploading(true);
    try {
      const urls: string[] = [];
      for (const file of files) {
        const reader = new FileReader();
        const base64 = await new Promise<string>((resolve) => {
          reader.onload = () => resolve((reader.result as string).split(",")[1]);
          reader.readAsDataURL(file);
        });
        const result = await uploadMutation.mutateAsync({
          fileBase64: base64,
          fileName: file.name,
          mimeType: file.type,
        });
        urls.push(result.url);
      }
      setPhotos([...photos, ...urls]);
      toast.success(`${files.length} foto(s) enviada(s)`);
    } catch {
      toast.error("Erro ao enviar fotos");
    } finally {
      setUploading(false);
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (!partner1Name || !partner2Name || !relationshipDate) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }
    if (photos.length === 0) {
      toast.error("Adicione pelo menos 1 foto");
      return;
    }
    createMutation.mutate({
      partner1Name,
      partner2Name,
      relationshipStartDate: relationshipDate,
      photoUrls: photos,
      musicYoutubeUrl: musicUrl || undefined,
      planType: selectedPlan,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 glass border-b border-white/30">
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
      </nav>

      <div className="container max-w-2xl py-10">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-foreground mb-3" style={{ fontFamily: "Cormorant Garamond, serif" }}>
            Crie sua página de homenagem
          </h1>
          <p className="text-muted-foreground" style={{ fontFamily: "Inter, sans-serif" }}>
            Preencha os dados do casal e personalize sua página
          </p>
        </div>

        {/* Plan Selector */}
        <div className="mb-10">
          <Label className="text-sm font-medium mb-3 block" style={{ fontFamily: "Inter, sans-serif" }}>Escolha o plano</Label>
          <div className="grid sm:grid-cols-2 gap-4">
            <button
              onClick={() => setSelectedPlan("essential")}
              className={`p-5 rounded-2xl border-2 transition-all text-left ${selectedPlan === "essential" ? "border-primary bg-primary/5" : "border-border bg-card hover:border-primary/50"}`}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-lg" style={{ fontFamily: "Cormorant Garamond, serif" }}>Essencial</h3>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedPlan === "essential" ? "border-primary bg-primary" : "border-border"}`}>
                  {selectedPlan === "essential" && <div className="w-2.5 h-2.5 rounded-full bg-white" />}
                </div>
              </div>
              <p className="text-2xl font-bold text-primary mb-1">R$ 29,90<span className="text-sm font-normal text-muted-foreground">/ano</span></p>
              <p className="text-xs text-muted-foreground" style={{ fontFamily: "Inter, sans-serif" }}>3 fotos • Player simples</p>
            </button>
            <button
              onClick={() => setSelectedPlan("premium")}
              className={`p-5 rounded-2xl border-2 transition-all text-left relative overflow-hidden ${selectedPlan === "premium" ? "border-primary bg-primary/5" : "border-border bg-card hover:border-primary/50"}`}
            >
              <div className="absolute top-2 right-2 bg-yellow-400 text-yellow-900 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5">
                <Crown className="w-2.5 h-2.5" />Popular
              </div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-lg" style={{ fontFamily: "Cormorant Garamond, serif" }}>Premium</h3>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedPlan === "premium" ? "border-primary bg-primary" : "border-border"}`}>
                  {selectedPlan === "premium" && <div className="w-2.5 h-2.5 rounded-full bg-white" />}
                </div>
              </div>
              <p className="text-2xl font-bold text-primary mb-1">R$ 49,90<span className="text-sm font-normal text-muted-foreground">/vitalício</span></p>
              <p className="text-xs text-muted-foreground" style={{ fontFamily: "Inter, sans-serif" }}>5 fotos • Spotify • Corações</p>
            </button>
          </div>
        </div>

        {/* Form */}
        <div className="bg-card rounded-2xl border border-border p-8 space-y-6">
          {/* Names */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="partner1" style={{ fontFamily: "Inter, sans-serif" }}>Nome do primeiro parceiro</Label>
              <Input
                id="partner1"
                value={partner1Name}
                onChange={(e) => setPartner1Name(e.target.value)}
                placeholder="Ex: Ana"
                className="mt-1.5"
                style={{ fontFamily: "Inter, sans-serif" }}
              />
            </div>
            <div>
              <Label htmlFor="partner2" style={{ fontFamily: "Inter, sans-serif" }}>Nome do segundo parceiro</Label>
              <Input
                id="partner2"
                value={partner2Name}
                onChange={(e) => setPartner2Name(e.target.value)}
                placeholder="Ex: Pedro"
                className="mt-1.5"
                style={{ fontFamily: "Inter, sans-serif" }}
              />
            </div>
          </div>

          {/* Date */}
          <div>
            <Label htmlFor="date" className="flex items-center gap-2" style={{ fontFamily: "Inter, sans-serif" }}>
              <Calendar className="w-4 h-4 text-primary" />
              Data de início do relacionamento
            </Label>
            <Input
              id="date"
              type="date"
              value={relationshipDate}
              onChange={(e) => setRelationshipDate(e.target.value)}
              className="mt-1.5"
              style={{ fontFamily: "Inter, sans-serif" }}
            />
          </div>

          {/* Photos */}
          <div>
            <Label className="flex items-center gap-2 mb-3" style={{ fontFamily: "Inter, sans-serif" }}>
              <Upload className="w-4 h-4 text-primary" />
              Fotos do casal ({photos.length}/{maxPhotos})
            </Label>
            <div className="grid grid-cols-3 gap-3 mb-3">
              {photos.map((url, i) => (
                <div key={i} className="relative aspect-square rounded-xl overflow-hidden bg-muted group">
                  <img src={url} alt={`Foto ${i + 1}`} className="w-full h-full object-cover" />
                  <button
                    onClick={() => removePhoto(i)}
                    className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              {photos.length < maxPhotos && (
                <label className="aspect-square rounded-xl border-2 border-dashed border-border hover:border-primary bg-muted/50 hover:bg-primary/5 flex flex-col items-center justify-center cursor-pointer transition-all group">
                  <Upload className="w-6 h-6 text-muted-foreground group-hover:text-primary mb-1" />
                  <span className="text-xs text-muted-foreground group-hover:text-primary" style={{ fontFamily: "Inter, sans-serif" }}>Adicionar</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handlePhotoUpload}
                    className="hidden"
                    disabled={uploading}
                  />
                </label>
              )}
            </div>
            {uploading && (
              <p className="text-xs text-muted-foreground flex items-center gap-2" style={{ fontFamily: "Inter, sans-serif" }}>
                <Loader2 className="w-3 h-3 animate-spin" />
                Enviando fotos...
              </p>
            )}
          </div>

          {/* Music */}
          <div>
            <Label htmlFor="music" className="flex items-center gap-2" style={{ fontFamily: "Inter, sans-serif" }}>
              <Music className="w-4 h-4 text-primary" />
              Link da música no YouTube (opcional)
            </Label>
            <Input
              id="music"
              value={musicUrl}
              onChange={(e) => setMusicUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className="mt-1.5"
              style={{ fontFamily: "Inter, sans-serif" }}
            />
            <p className="text-xs text-muted-foreground mt-1.5" style={{ fontFamily: "Inter, sans-serif" }}>
              Cole o link de qualquer vídeo do YouTube
            </p>
          </div>

          {/* Plan Features Preview */}
          <div className="bg-accent/30 rounded-xl p-4 border border-primary/20">
            <p className="text-sm font-medium mb-2 flex items-center gap-2" style={{ fontFamily: "Inter, sans-serif" }}>
              {selectedPlan === "premium" ? <Crown className="w-4 h-4 text-primary" /> : <Sparkles className="w-4 h-4 text-primary" />}
              Recursos do Plano {selectedPlan === "premium" ? "Premium" : "Essencial"}
            </p>
            <ul className="space-y-1 text-xs text-muted-foreground" style={{ fontFamily: "Inter, sans-serif" }}>
              <li>✓ Até {maxPhotos} fotos no slideshow</li>
              <li>✓ Contador em tempo real</li>
              <li>✓ Player de música {selectedPlan === "premium" ? "estilo Spotify" : "simples"}</li>
              {selectedPlan === "premium" && <li>✓ Chuva de corações animada</li>}
              <li>✓ Link único e QR Code</li>
            </ul>
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => navigate("/dashboard")}
              className="flex-1 rounded-full"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={createMutation.isPending}
              className="flex-1 bg-primary hover:bg-primary/90 text-white rounded-full"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              {createMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Criando...
                </>
              ) : (
                <>
                  <Heart className="w-4 h-4 mr-2 fill-white" />
                  Criar Página
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Payment Notice */}
        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground mb-3" style={{ fontFamily: "Inter, sans-serif" }}>
            Após criar a página, você será direcionado ao pagamento
          </p>
          <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground">
            <span>🔒 Pagamento seguro via Stripe</span>
            <span>💳 Cartão de crédito</span>
          </div>
        </div>
      </div>
    </div>
  );
}
