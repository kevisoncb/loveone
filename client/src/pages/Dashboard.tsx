import { useState } from "react";
import { motion } from "framer-motion";
import { Heart, Plus, ExternalLink, Trash2, Edit, QrCode, Copy, Check, Crown, Calendar, AlertCircle, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function Dashboard() {
  const { user, isAuthenticated, loading, logout } = useAuth();
  const [, navigate] = useLocation();
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  const { data: pages, isLoading, refetch } = trpc.tribute.myPages.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const deleteMutation = trpc.tribute.delete.useMutation({
    onSuccess: () => {
      toast.success("Página excluída com sucesso");
      refetch();
    },
    onError: () => toast.error("Erro ao excluir página"),
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Heart className="w-8 h-8 text-primary fill-primary animate-pulse" />
          <p className="text-muted-foreground" style={{ fontFamily: "Inter, sans-serif" }}>Carregando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    window.location.href = getLoginUrl();
    return null;
  }

  const copyLink = async (slug: string) => {
    const url = `${window.location.origin}/p/${slug}`;
    await navigator.clipboard.writeText(url);
    setCopiedSlug(slug);
    toast.success("Link copiado!");
    setTimeout(() => setCopiedSlug(null), 2000);
  };

  const handleDelete = (id: number) => {
    if (confirm("Tem certeza que deseja excluir esta página? Esta ação não pode ser desfeita.")) {
      deleteMutation.mutate({ id });
    }
  };

  const isPlanActive = (page: any) => {
    if (page.planType === "premium") return true;
    if (!page.planExpiresAt) return true;
    return new Date() < new Date(page.planExpiresAt);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 glass border-b border-white/30">
        <div className="container flex items-center justify-between h-16">
          <button onClick={() => navigate("/")} className="flex items-center gap-2">
            <Heart className="w-6 h-6 text-primary fill-primary" />
            <span className="text-xl font-bold text-gradient-rose" style={{ fontFamily: "Cormorant Garamond, serif" }}>Love365</span>
          </button>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground hidden sm:block" style={{ fontFamily: "Inter, sans-serif" }}>
              Olá, {user?.name?.split(" ")[0] || "amor"} ♥
            </span>
            <Button variant="ghost" size="sm" onClick={logout} className="text-muted-foreground hover:text-foreground" style={{ fontFamily: "Inter, sans-serif" }}>
              <LogOut className="w-4 h-4 mr-1" />
              Sair
            </Button>
          </div>
        </div>
      </nav>

      <div className="container py-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-bold text-foreground" style={{ fontFamily: "Cormorant Garamond, serif" }}>
              Minhas Páginas
            </h1>
            <p className="text-muted-foreground mt-1" style={{ fontFamily: "Inter, sans-serif" }}>
              Gerencie as páginas de homenagem que você criou
            </p>
          </div>
          <Button
            onClick={() => navigate("/create")}
            className="bg-primary hover:bg-primary/90 text-white rounded-full px-6"
            style={{ fontFamily: "Inter, sans-serif" }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Nova Página
          </Button>
        </div>

        {/* Pages Grid */}
        {isLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-64 rounded-2xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : pages && pages.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {pages.map((page, i) => {
              const active = isPlanActive(page);
              const photos = JSON.parse(page.photoUrls || "[]") as string[];
              return (
                <motion.div
                  key={page.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-card rounded-2xl border border-border overflow-hidden hover:shadow-lg transition-all group"
                >
                  {/* Cover Photo */}
                  <div className="relative h-40 bg-gradient-to-br from-rose-100 to-pink-100 overflow-hidden">
                    {photos[0] ? (
                      <img src={photos[0]} alt="Capa" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Heart className="w-12 h-12 text-primary/30 fill-primary/20" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    {/* Plan Badge */}
                    <div className={`absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${page.planType === "premium" ? "bg-yellow-400 text-yellow-900" : "bg-white/90 text-foreground"}`} style={{ fontFamily: "Inter, sans-serif" }}>
                      {page.planType === "premium" ? <Crown className="w-3 h-3" /> : null}
                      {page.planType === "premium" ? "Premium" : "Essencial"}
                    </div>
                    {/* Expired badge */}
                    {!active && (
                      <div className="absolute top-3 left-3 flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-500 text-white" style={{ fontFamily: "Inter, sans-serif" }}>
                        <AlertCircle className="w-3 h-3" />Expirado
                      </div>
                    )}
                    {/* Names */}
                    <div className="absolute bottom-3 left-3">
                      <p className="text-white font-semibold text-sm" style={{ fontFamily: "Cormorant Garamond, serif" }}>
                        {page.partner1Name} & {page.partner2Name}
                      </p>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-4">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3" style={{ fontFamily: "Inter, sans-serif" }}>
                      <Calendar className="w-3 h-3" />
                      <span>Desde {format(new Date(page.relationshipStartDate), "dd/MM/yyyy", { locale: ptBR })}</span>
                    </div>
                    {page.planType === "essential" && page.planExpiresAt && (
                      <p className="text-xs text-muted-foreground mb-3" style={{ fontFamily: "Inter, sans-serif" }}>
                        Expira em: {format(new Date(page.planExpiresAt), "dd/MM/yyyy", { locale: ptBR })}
                      </p>
                    )}
                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(`/p/${page.uniqueSlug}`, "_blank")}
                        className="flex-1 rounded-full text-xs border-primary/30 text-primary hover:bg-primary/5"
                        style={{ fontFamily: "Inter, sans-serif" }}
                      >
                        <ExternalLink className="w-3 h-3 mr-1" />
                        Ver
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyLink(page.uniqueSlug)}
                        className="flex-1 rounded-full text-xs"
                        style={{ fontFamily: "Inter, sans-serif" }}
                      >
                        {copiedSlug === page.uniqueSlug ? <Check className="w-3 h-3 mr-1 text-green-500" /> : <Copy className="w-3 h-3 mr-1" />}
                        Copiar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => navigate(`/edit/${page.id}`)}
                        className="rounded-full text-xs"
                        style={{ fontFamily: "Inter, sans-serif" }}
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => navigate(`/qr/${page.uniqueSlug}`)}
                        className="rounded-full text-xs"
                        style={{ fontFamily: "Inter, sans-serif" }}
                      >
                        <QrCode className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(page.id)}
                        className="rounded-full text-xs text-red-400 hover:text-red-600 hover:bg-red-50"
                        style={{ fontFamily: "Inter, sans-serif" }}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <Heart className="w-12 h-12 text-primary/40" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-3" style={{ fontFamily: "Cormorant Garamond, serif" }}>
              Nenhuma página criada ainda
            </h2>
            <p className="text-muted-foreground mb-8 max-w-sm mx-auto" style={{ fontFamily: "Inter, sans-serif" }}>
              Crie a primeira página de homenagem do seu relacionamento e eternize esse amor.
            </p>
            <Button
              onClick={() => navigate("/create")}
              className="bg-primary hover:bg-primary/90 text-white rounded-full px-8 py-6 text-lg"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              <Heart className="w-5 h-5 mr-2 fill-white" />
              Criar minha primeira página
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
