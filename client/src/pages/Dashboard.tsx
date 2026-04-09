import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Heart, Plus, Eye, Share2, Trash, Crown, QrCode } from "lucide-react";
import { useLocation } from "wouter";
import { QRCode } from "@/components/ui/qrcode";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";
import { toast } from "sonner";


const TributeCardSkeleton = () => (
  <div className="bg-card rounded-2xl border border-border p-5 animate-pulse">
    <div className="h-32 bg-muted rounded-lg mb-4"></div>
    <div className="h-5 bg-muted rounded w-3/4 mb-2"></div>
    <div className="h-4 bg-muted rounded w-1/2 mb-4"></div>
    <div className="flex gap-2">
      <div className="h-8 bg-muted rounded-full flex-1"></div>
      <div className="h-8 bg-muted rounded-full flex-1"></div>
    </div>
  </div>
);

export default function Dashboard() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { data: pages, isLoading } = trpc.tribute.listByUser.useQuery();
  const [qrCodePage, setQrCodePage] = useState<any>(null);

  const handleShare = (slug: string) => {
    const url = `${window.location.origin}/p/${slug}`;
    navigator.clipboard.writeText(url);
    toast.success("Link copiado para a área de transferência!");
  };

  return (
    <div className="container py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold" style={{ fontFamily: "Cormorant Garamond, serif" }}>
            Meu Painel
          </h1>
          <p className="text-muted-foreground" style={{ fontFamily: "Inter, sans-serif" }}>
            Olá, {user?.displayName || "namorado(a)"}! gerencie suas páginas aqui.
          </p>
        </div>
        <Button onClick={() => navigate("/create")} className="bg-primary hover:bg-primary/90 text-white rounded-full">
          <Plus className="w-4 h-4 mr-2" />
          Nova Página
        </Button>
      </div>

      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <TributeCardSkeleton />
          <TributeCardSkeleton />
        </div>
      ) : pages && pages.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {pages.map((page) => {
            const photos = JSON.parse(page.photoUrls || "[]") as string[];
            return (
              <div key={page.id} className="dashboard-card">
                <div className="relative h-40 bg-muted overflow-hidden">
                  {photos.length > 0 && (
                    <img src={photos[0]} alt="Preview" className="w-full h-full object-cover" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  {page.planType === 'premium' &&
                    <div className="absolute top-3 right-3 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Crown className="w-3 h-3" />
                      Premium
                    </div>
                  }
                </div>
                <div className="p-5">
                  <h2 className="font-bold text-lg truncate" style={{ fontFamily: "Cormorant Garamond, serif" }}>
                    {page.partner1Name} & {page.partner2Name}
                  </h2>
                  <p className="text-sm text-muted-foreground mb-4" style={{ fontFamily: "Inter, sans-serif" }}>
                    Criado em {new Date(page.createdAt!).toLocaleDateString("pt-BR")}
                  </p>
                  <div className="flex gap-2 items-center">
                    <Button onClick={() => navigate(`/p/${page.uniqueSlug}`)} variant="outline" className="dashboard-card-action-btn">
                      <Eye className="w-3 h-3 mr-1.5" />
                      Ver
                    </Button>
                    <Button onClick={() => handleShare(page.uniqueSlug)} variant="secondary" className="dashboard-card-action-btn">
                      <Share2 className="w-3 h-3 mr-1.5" />
                      Copiar Link
                    </Button>
                    <Button onClick={() => setQrCodePage(page)} size="icon" variant="ghost" className="dashboard-card-icon-btn text-muted-foreground">
                      <QrCode className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20 bg-card border border-border rounded-2xl">
          <Heart className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
          <h2 className="text-xl font-bold" style={{ fontFamily: "Cormorant Garamond, serif" }}>
            Nenhuma página de homenagem ainda
          </h2>
          <p className="text-muted-foreground mb-6" style={{ fontFamily: "Inter, sans-serif" }}>
            Que tal criar a primeira agora mesmo?
          </p>
          <Button onClick={() => navigate("/create")} className="bg-primary hover:bg-primary/90 text-white rounded-full">
            <Heart className="w-4 h-4 mr-2 fill-white" />
            Criar página do amor
          </Button>
        </div>
      )}

      <Dialog open={!!qrCodePage} onOpenChange={(open) => !open && setQrCodePage(null)}>
        <DialogContent className="max-w-xs">
          <DialogHeader>
            <DialogTitle className="text-center">QR Code para sua Página</DialogTitle>
          </DialogHeader>
          <div className="p-4 flex items-center justify-center">
            {qrCodePage && (
              <QRCode
                value={`${window.location.origin}/p/${qrCodePage.uniqueSlug}`}
                size={200}
              />
            )}
          </div>
          <p className="text-center text-sm text-muted-foreground" style={{ fontFamily: "Inter, sans-serif" }}>
            Aponte a câmera do celular para o QR Code para abrir a página de homenagem.
          </p>
        </DialogContent>
      </Dialog>
    </div>
  );
}
