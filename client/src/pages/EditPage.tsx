import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Heart, Upload, X, Music, Calendar, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation, useRoute } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

const PRODUCTS = {
  essential: { features: { maxPhotos: 3 } },
  premium: { features: { maxPhotos: 5 } },
} as const;

export default function EditPage() {
  const { isAuthenticated, loading } = useAuth();
  const [, navigate] = useLocation();
  const [, params] = useRoute("/edit/:id");
  const pageId = params?.id ? parseInt(params.id) : null;

  const [partner1Name, setPartner1Name] = useState("");
  const [partner2Name, setPartner2Name] = useState("");
  const [relationshipDate, setRelationshipDate] = useState("");
  const [musicUrl, setMusicUrl] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [maxPhotos, setMaxPhotos] = useState(3);

  const { data: page, isLoading: pageLoading } = trpc.tribute.getById.useQuery({ id: pageId! }, { enabled: !!pageId });
  const uploadMutation = trpc.tribute.uploadPhoto.useMutation();
  const updateMutation = trpc.tribute.update.useMutation({
    onSuccess: () => {
      toast.success("Página atualizada com sucesso!");
      navigate("/dashboard");
    },
    onError: () => toast.error("Erro ao atualizar página"),
  });

  useEffect(() => {
    if (page) {
      setPartner1Name(page.partner1Name);
      setPartner2Name(page.partner2Name);
      setRelationshipDate(new Date(page.relationshipStartDate).toISOString().split("T")[0]);
      setMusicUrl(page.musicYoutubeUrl || "");
      setPhotos(JSON.parse(page.photoUrls || "[]"));
      setMaxPhotos(PRODUCTS[page.planType as keyof typeof PRODUCTS].features.maxPhotos);
    }
  }, [page]);

  if (loading || pageLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Heart className="w-8 h-8 text-primary fill-primary animate-pulse" />
      </div>
    );
  }

  if (!isAuthenticated) {
    navigate("/");
    return null;
  }

  if (!page) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Heart className="w-16 h-16 text-primary/30 fill-primary/30 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2" style={{ fontFamily: "Cormorant Garamond, serif" }}>
            Página não encontrada
          </h1>
        </div>
      </div>
    );
  }

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (photos.length + files.length > maxPhotos) {
      toast.error(`Máximo de ${maxPhotos} fotos permitidas`);
      return;
    }

    setUploading(true);
    try {
      for (const file of files) {
        const reader = new FileReader();
        reader.onload = async (ev) => {
          const base64 = (ev.target?.result as string).split(",")[1];
          const result = await uploadMutation.mutateAsync({
            fileBase64: base64,
            fileName: file.name,
            mimeType: file.type,
          });
          setPhotos((prev) => [...prev, result.url]);
        };
        reader.readAsDataURL(file);
      }
    } finally {
      setUploading(false);
    }
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!partner1Name || !partner2Name || !relationshipDate) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    updateMutation.mutate({
      id: page.id,
      partner1Name,
      partner2Name,
      relationshipStartDate: relationshipDate,
      photoUrls: photos,
      musicYoutubeUrl: musicUrl || null,
    });
  };

  return (
    <div className="min-h-screen bg-background">
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
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <h1 className="text-3xl font-bold text-foreground mb-2" style={{ fontFamily: "Cormorant Garamond, serif" }}>
            Editar Página
          </h1>
          <p className="text-muted-foreground" style={{ fontFamily: "Inter, sans-serif" }}>
            Atualize os dados da sua página de homenagem
          </p>
        </motion.div>

        <div className="space-y-8">
          {/* Nomes */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="bg-card rounded-2xl border border-border p-6">
            <Label className="text-lg font-semibold mb-4 block" style={{ fontFamily: "Cormorant Garamond, serif" }}>
              Os Nomes do Casal
            </Label>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Input
                  placeholder="Primeiro nome"
                  value={partner1Name}
                  onChange={(e) => setPartner1Name(e.target.value)}
                  className="rounded-xl"
                  style={{ fontFamily: "Inter, sans-serif" }}
                />
              </div>
              <div>
                <Input
                  placeholder="Segundo nome"
                  value={partner2Name}
                  onChange={(e) => setPartner2Name(e.target.value)}
                  className="rounded-xl"
                  style={{ fontFamily: "Inter, sans-serif" }}
                />
              </div>
            </div>
          </motion.div>

          {/* Data */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="bg-card rounded-2xl border border-border p-6">
            <Label className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ fontFamily: "Cormorant Garamond, serif" }}>
              <Calendar className="w-5 h-5 text-primary" />
              Data de Início
            </Label>
            <Input
              type="date"
              value={relationshipDate}
              onChange={(e) => setRelationshipDate(e.target.value)}
              className="rounded-xl"
              style={{ fontFamily: "Inter, sans-serif" }}
            />
          </motion.div>

          {/* Fotos */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="bg-card rounded-2xl border border-border p-6">
            <Label className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ fontFamily: "Cormorant Garamond, serif" }}>
              <Upload className="w-5 h-5 text-primary" />
              Fotos ({photos.length}/{maxPhotos})
            </Label>
            <div className="mb-6">
              <label className="flex items-center justify-center w-full p-6 border-2 border-dashed border-primary/30 rounded-xl cursor-pointer hover:border-primary/60 transition-colors">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  disabled={photos.length >= maxPhotos || uploading}
                  className="hidden"
                />
                <div className="text-center">
                  <Upload className="w-8 h-8 text-primary/50 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground" style={{ fontFamily: "Inter, sans-serif" }}>
                    Clique ou arraste fotos aqui
                  </p>
                </div>
              </label>
            </div>
            {uploading && <p className="text-sm text-muted-foreground flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Enviando...</p>}
            <div className="grid grid-cols-3 gap-4">
              {photos.map((url, i) => (
                <div key={i} className="relative group rounded-xl overflow-hidden">
                  <img src={url} alt={`Foto ${i + 1}`} className="w-full h-24 object-cover" />
                  <button
                    onClick={() => handleRemovePhoto(i)}
                    className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-5 h-5 text-white" />
                  </button>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Música */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="bg-card rounded-2xl border border-border p-6">
            <Label className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ fontFamily: "Cormorant Garamond, serif" }}>
              <Music className="w-5 h-5 text-primary" />
              Link do YouTube (Opcional)
            </Label>
            <Input
              placeholder="https://www.youtube.com/watch?v=..."
              value={musicUrl}
              onChange={(e) => setMusicUrl(e.target.value)}
              className="rounded-xl"
              style={{ fontFamily: "Inter, sans-serif" }}
            />
          </motion.div>

          {/* Submit */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="flex gap-4">
            <Button
              onClick={() => navigate("/dashboard")}
              variant="outline"
              className="flex-1 rounded-full py-6"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={updateMutation.isPending}
              className="flex-1 bg-primary hover:bg-primary/90 text-white rounded-full py-6"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              {updateMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Salvar Alterações
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
