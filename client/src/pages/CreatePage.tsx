
import { useState, useEffect } from "react";
import { ArrowLeft, Heart, Loader2, CreditCard, Banknote, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { TributePreview } from "@/components/TributePreview"; // Import the new preview component

const PRODUCTS = {
  essential: { basePrice: 29.90, features: { maxPhotos: 3 } },
  premium: { basePrice: 49.90, features: { maxPhotos: 5 } },
} as const;

export default function CreatePage() {
  // --- STATES --- 
  const { isAuthenticated, loading } = useAuth();
  const [, navigate] = useLocation();
  
  // Form States
  const [selectedPlan, setSelectedPlan] = useState<"essential" | "premium">("essential");
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'pix'>('card');
  const [partner1Name, setPartner1Name] = useState("");
  const [partner2Name, setPartner2Name] = useState("");
  const [relationshipDate, setRelationshipDate] = useState("");
  const [musicUrl, setMusicUrl] = useState("");
  const [photos, setPhotos] = useState<string[]>([]); // URLs for preview
  const [photoFiles, setPhotoFiles] = useState<File[]>([]); // Files for upload

  // UI States
  const [uploading, setUploading] = useState(false);
  
  // --- TRPC MUTATIONS --- 
  const createPageMutation = trpc.tribute.create.useMutation();
  const checkoutMutation = trpc.payment.createCheckoutSession.useMutation();

  // --- EFFECTS --- 
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const plan = params.get("plan");
    if (plan === "premium" || plan === "essential") setSelectedPlan(plan);
  }, []);

  // --- AUTHENTICATION --- 
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin" /></div>;
  }
  if (!isAuthenticated) {
    window.location.href = getLoginUrl();
    return null;
  }

  // --- DERIVED VALUES --- 
  const maxPhotos = PRODUCTS[selectedPlan].features.maxPhotos;
  const basePrice = PRODUCTS[selectedPlan].basePrice;
  const finalPrice = paymentMethod === 'pix' ? basePrice * 0.9 : basePrice;

  // --- HANDLERS --- 
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (photos.length + files.length > maxPhotos) {
      toast.error(`Limite de ${maxPhotos} fotos atingido.`);
      return;
    }
    setPhotoFiles(prev => [...prev, ...files]);
    const newPhotoUrls = files.map(file => URL.createObjectURL(file));
    setPhotos(prev => [...prev, ...newPhotoUrls]);
  };

  const handleSubmit = async () => {
    if (!partner1Name || !partner2Name || !relationshipDate) {
      return toast.error("Preencha os nomes e a data.");
    }

    try {
      // 1. Create the page entry in the database
      const page = await createPageMutation.mutateAsync({
        partner1Name,
        partner2Name,
        relationshipStartDate: relationshipDate,
        musicYoutubeUrl: musicUrl || undefined,
        planType: selectedPlan,
        photoKeys: [], // Will be updated after upload
      });

      // 2. Create a checkout session
      const session = await checkoutMutation.mutateAsync({
        plan: selectedPlan,
        tributeId: page.id,
        paymentMethod: paymentMethod,
      });

      // 3. Redirect to Stripe
      if (session.url) {
        window.location.href = session.url;
      } else {
        toast.error("Não foi possível iniciar o pagamento.");
      }
    } catch (error) {
      toast.error("Ocorreu um erro. Tente novamente.");
    }
  };

  // --- RENDER --- 
  return (
    <div className="min-h-screen bg-background">
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b">
        <div className="container flex items-center justify-between h-16">
            <Button variant="ghost" onClick={() => navigate("/dashboard")} className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" /> Voltar
            </Button>
            <h1 className="font-semibold text-lg">Crie sua Homenagem</h1>
            <div className="w-20" />
        </div>
      </nav>

      <div className="container py-10 grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* LEFT - FORM */}
        <div className="space-y-8">
          <div>
            <Label>Nomes do Casal</Label>
            <div className="grid grid-cols-2 gap-4 mt-2">
              <Input placeholder="Nome 1" value={partner1Name} onChange={e => setPartner1Name(e.target.value)} />
              <Input placeholder="Nome 2" value={partner2Name} onChange={e => setPartner2Name(e.target.value)} />
            </div>
          </div>
          <div>
            <Label>Data de Início do Relacionamento</Label>
            <Input type="date" value={relationshipDate} onChange={e => setRelationshipDate(e.target.value)} className="mt-2" />
          </div>
          <div>
             <Label>Fotos ({photos.length}/{maxPhotos})</Label>
             <Input type="file" accept="image/*" multiple onChange={handlePhotoChange} className="mt-2" />
          </div>
           <div>
            <Label>Música (Link do YouTube)</Label>
            <Input placeholder="https://youtube.com/watch?v=..." value={musicUrl} onChange={e => setMusicUrl(e.target.value)} className="mt-2" />
          </div>

          <hr className="my-8"/>

          {/* Payment Section */}
          <div>
             <h2 class="text-xl font-bold mb-4">Plano e Pagamento</h2>
             {/* Plan Selector */}
             <div className="grid grid-cols-2 gap-4 mb-4">
                 <Button onClick={() => setSelectedPlan("essential")} variant={selectedPlan === 'essential' ? 'default' : 'outline'}>Essencial</Button>
                 <Button onClick={() => setSelectedPlan("premium")} variant={selectedPlan === 'premium' ? 'default' : 'outline'}>Premium</Button>
             </div>
             {/* Payment Method Selector */}
             <div className="grid grid-cols-2 gap-4">
                 <Button onClick={() => setPaymentMethod('card')} variant={paymentMethod === 'card' ? 'secondary' : 'outline'} className="h-auto py-3">
                     <CreditCard className="w-5 h-5 mr-2"/>
                     <div>
                         <p>Cartão de Crédito</p>
                         <p className="text-xs text-muted-foreground">R$ {PRODUCTS[selectedPlan].basePrice.toFixed(2)}</p>
                     </div>
                 </Button>
                 <Button onClick={() => setPaymentMethod('pix')} variant={paymentMethod === 'pix' ? 'secondary' : 'outline'} className="h-auto py-3">
                     <Banknote className="w-5 h-5 mr-2"/>
                     <div>
                         <p>Pix <span className="text-green-500 font-bold">10% OFF</span></p>
                         <p className="text-xs text-muted-foreground">R$ {(PRODUCTS[selectedPlan].basePrice * 0.9).toFixed(2)}</p>
                     </div>
                 </Button>
             </div>
          </div>

          <Button onClick={handleSubmit} size="lg" className="w-full">
            <Heart className="w-4 h-4 mr-2"/>
            Criar e Pagar R$ {finalPrice.toFixed(2)}
          </Button>
        </div>

        {/* RIGHT - PREVIEW */}
        <div className="sticky top-24 h-[700px]">
           <TributePreview 
              partner1Name={partner1Name}
              partner2Name={partner2Name}
              relationshipDate={relationshipDate}
              photos={photos}
              music={musicUrl}
              plan={selectedPlan}
            />
        </div>
      </div>
    </div>
  );
}
