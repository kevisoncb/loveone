
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Heart, Upload, X, Music, Calendar, Crown, Sparkles, ArrowLeft, Loader2, CreditCard, Banknote } from "lucide-react"; // Added new icons
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { getPublicUrl } from "../../../server/storage";

const PRODUCTS = {
  essential: { basePrice: 29.90, features: { maxPhotos: 3 } },
  premium: { basePrice: 49.90, features: { maxPhotos: 5 } },
} as const;

export default function CreatePage() {
  const { isAuthenticated, loading } = useAuth();
  const [, navigate] = useLocation();
  const [step, setStep] = useState(1);
  const [selectedPlan, setSelectedPlan] = useState<"essential" | "premium">("essential");
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'pix'>('card'); // New state for payment method
  const [partner1Name, setPartner1Name] = useState("");
  const [partner2Name, setPartner2Name] = useState("");
  const [relationshipDate, setRelationshipDate] = useState("");
  const [musicUrl, setMusicUrl] = useState("");
  const [photoKeys, setPhotoKeys] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [showUpsellModal, setShowUpsellModal] = useState(false);

  const presignedUrlMutation = trpc.tribute.createPresignedUrl.useMutation();
  const createMutation = trpc.tribute.create.useMutation({
    onSuccess: (page) => {
      toast.success("Página criada com sucesso! Redirecionando para o pagamento...");
      // Now, redirect to payment
      handlePaymentRedirect(page.id);
    },
    onError: () => toast.error("Erro ao criar página"),
  });

  // New mutation for creating checkout session
  const checkoutMutation = trpc.payment.createCheckoutSession.useMutation({
    onSuccess: (session) => {
      if (session.url) {
        window.location.href = session.url;
      }
    },
    onError: () => toast.error("Erro ao criar sessão de pagamento."),
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
  const basePrice = PRODUCTS[selectedPlan].basePrice;
  const finalPrice = paymentMethod === 'pix' ? basePrice * 0.9 : basePrice;

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (photoKeys.length + files.length > maxPhotos) {
      if (selectedPlan === "essential") {
        setShowUpsellModal(true);
      } else {
        toast.error(`Você pode adicionar no máximo ${maxPhotos} fotos no plano Premium.`);
      }
      return;
    }

    setUploading(true);
    try {
      const newKeys: string[] = [];
      await Promise.all(files.map(async (file) => {
        const { uploadUrl, key } = await presignedUrlMutation.mutateAsync({ fileType: file.type });
        await fetch(uploadUrl, { method: 'PUT', body: file, headers: { 'Content-Type': file.type } });
        newKeys.push(key);
      }));
      setPhotoKeys([...photoKeys, ...newKeys]);
      toast.success(`${files.length} foto(s) enviada(s) com sucesso!`);
    } catch (error) {
      toast.error("Erro ao enviar fotos. Tente novamente.");
    } finally {
      setUploading(false);
    }
  };

  const handleUpgrade = () => {
    setSelectedPlan("premium");
    setShowUpsellModal(false);
    toast.success("Plano atualizado para Premium!");
  };

  const removePhoto = (index: number) => {
    setPhotoKeys(photoKeys.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (!partner1Name || !partner2Name || !relationshipDate) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }
    if (photoKeys.length === 0) {
      toast.error("Adicione pelo menos 1 foto");
      return;
    }
    createMutation.mutate({
      partner1Name,
      partner2Name,
      relationshipStartDate: relationshipDate,
      photoKeys: photoKeys,
      musicYoutubeUrl: musicUrl || undefined,
      planType: selectedPlan,
    });
  };

  const handlePaymentRedirect = (tributeId: number) => {
    checkoutMutation.mutate({
      plan: selectedPlan,
      tributeId: tributeId,
      paymentMethod: paymentMethod,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <nav className="sticky top-0 z-50 glass border-b border-white/30">
        <div className="container flex items-center justify-between h-16">
          <button onClick={() => navigate("/dashboard")} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span>Voltar</span>
          </button>
          <div className="flex items-center gap-2">
            <Heart className="w-6 h-6 text-primary fill-primary" />
            <span className="text-xl font-bold text-gradient-rose">Love365</span>
          </div>
          <div className="w-20" />
        </div>
      </nav>

      <div className="container max-w-2xl py-10">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-foreground">Crie sua página de homenagem</h1>
          <p className="text-muted-foreground">Preencha os dados e personalize sua página</p>
        </div>

        {/* Plan Selector */}
        <div className="mb-10">
          <Label className="text-sm font-medium mb-3 block">Escolha o plano</Label>
          <div className="grid sm:grid-cols-2 gap-4">
            <button
              onClick={() => setSelectedPlan("essential")}
              className={`p-5 rounded-2xl border-2 transition-all text-left ${selectedPlan === "essential" ? "border-primary bg-primary/5" : "border-border bg-card hover:border-primary/50"}`}>
              <h3>Essencial</h3>
              <p>R$ {PRODUCTS.essential.basePrice.toFixed(2).replace('.', ',')}<span className="text-sm font-normal text-muted-foreground">/ano</span></p>
              <p className="text-xs text-muted-foreground">3 fotos • Player simples</p>
            </button>
            <button
              onClick={() => setSelectedPlan("premium")}
              className={`p-5 rounded-2xl border-2 transition-all text-left relative overflow-hidden ${selectedPlan === "premium" ? "border-primary bg-primary/5" : "border-border bg-card hover:border-primary/50"}`}>
               <div className="absolute top-2 right-2 bg-yellow-400 text-yellow-900 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5">
                <Crown className="w-2.5 h-2.5" />Popular
              </div>
              <h3>Premium</h3>
              <p>R$ {PRODUCTS.premium.basePrice.toFixed(2).replace('.', ',')}<span className="text-sm font-normal text-muted-foreground">/vitalício</span></p>
              <p className="text-xs text-muted-foreground">5 fotos • Spotify • Corações</p>
            </button>
          </div>
        </div>

        {/* Payment Method Selector */}
        <div className="mb-10">
          <Label className="text-sm font-medium mb-3 block">Escolha o método de pagamento</Label>
          <div className="grid sm:grid-cols-2 gap-4">
              <button
                onClick={() => setPaymentMethod('card')}
                className={`p-5 rounded-2xl border-2 transition-all text-left flex items-center gap-4 ${paymentMethod === 'card' ? "border-primary bg-primary/5" : "border-border bg-card hover:border-primary/50"}`}>
                 <CreditCard className={`w-6 h-6 ${paymentMethod === 'card' ? 'text-primary' : 'text-muted-foreground'}`} />
                 <div>
                    <h3 className="font-bold">Cartão de Crédito</h3>
                    <p className="text-xs text-muted-foreground">Pagamento seguro</p>
                 </div>
              </button>
               <button
                onClick={() => setPaymentMethod('pix')}
                className={`p-5 rounded-2xl border-2 transition-all text-left flex items-center gap-4 relative ${paymentMethod === 'pix' ? "border-primary bg-primary/5" : "border-border bg-card hover:border-primary/50"}`}>
                <div className="absolute top-2 right-2 bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">10% OFF</div>
                <Banknote className={`w-6 h-6 ${paymentMethod === 'pix' ? 'text-primary' : 'text-muted-foreground'}`} />
                 <div>
                    <h3 className="font-bold">Pix</h3>
                    <p className="text-xs text-muted-foreground">Aprovação imediata</p>
                 </div>
              </button>
          </div>
        </div>

        {/* Form */}
        <div className="bg-card rounded-2xl border border-border p-8 space-y-6">
           {/* ... (rest of the form remains the same) ... */}
        </div>
        
        {/* Total Price and Submit */}
        <div className="mt-8 text-center">
           <p className="text-lg font-bold">Total: R$ {finalPrice.toFixed(2).replace('.', ',')}</p>
           <p className="text-sm text-muted-foreground mb-3">Você será direcionado para o pagamento após criar a página</p>
           <Button
              onClick={handleSubmit}
              disabled={createMutation.isPending || checkoutMutation.isPending}
              className="w-full max-w-sm mx-auto bg-primary hover:bg-primary/90 text-white rounded-full">
              {(createMutation.isPending || checkoutMutation.isPending) ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processando... </> 
              ) : (
                <><Heart className="w-4 h-4 mr-2 fill-white" /> Criar Página e Pagar</>
              )}
            </Button>
        </div>

        <Dialog open={showUpsellModal} onOpenChange={setShowUpsellModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Faça upgrade para o Premium!</DialogTitle>
              <DialogDescription>O plano Essencial permite até 3 fotos. Para adicionar mais fotos, faça o upgrade.</DialogDescription>
            </DialogHeader>
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setShowUpsellModal(false)}>Agora não</Button>
              <Button onClick={handleUpgrade}>Fazer Upgrade</Button>
            </div>
          </DialogContent>
        </Dialog>

      </div>
    </div>
  );
}
