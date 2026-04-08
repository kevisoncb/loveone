import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart, LogOut, Users, ShoppingCart, Settings, FileText } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  const { data: allPages = [] } = trpc.tribute.myPages.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem("adminToken");
      if (!token) {
        setLocation("/admin");
        return;
      }

      try {
        const response = await fetch("/api/admin/verify", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          localStorage.removeItem("adminToken");
          setLocation("/admin");
          return;
        }

        setIsAuthenticated(true);
      } catch {
        localStorage.removeItem("adminToken");
        setLocation("/admin");
      } finally {
        setLoading(false);
      }
    };

    verifyToken();
  }, [setLocation]);

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    toast.success("Desconectado com sucesso");
    setLocation("/admin");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <Heart className="w-12 h-12 text-rose-500 fill-rose-500 mx-auto mb-4 animate-pulse" />
          <p className="text-slate-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="w-8 h-8 text-rose-500 fill-rose-500" />
            <span className="text-2xl font-serif font-bold text-slate-900">Love365</span>
            <span className="ml-4 px-3 py-1 bg-rose-100 text-rose-700 text-sm font-medium rounded-full">
              Admin
            </span>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Sair
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Total de Páginas</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">{allPages.length}</p>
              </div>
              <FileText className="w-12 h-12 text-rose-200" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Plano Essencial</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">
                  {allPages.filter((p) => p.planType === "essential").length}
                </p>
              </div>
              <Users className="w-12 h-12 text-blue-200" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Plano Premium</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">
                  {allPages.filter((p) => p.planType === "premium").length}
                </p>
              </div>
              <ShoppingCart className="w-12 h-12 text-purple-200" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Receita Estimada</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">
                  R$ {(allPages.filter((p) => p.planType === "essential").length * 29.9 + allPages.filter((p) => p.planType === "premium").length * 49.9).toFixed(2)}
                </p>
              </div>
              <Settings className="w-12 h-12 text-green-200" />
            </div>
          </Card>
        </div>

        <Tabs defaultValue="pages" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="pages">Páginas</TabsTrigger>
            <TabsTrigger value="plans">Planos</TabsTrigger>
            <TabsTrigger value="settings">Configurações</TabsTrigger>
          </TabsList>

          <TabsContent value="pages" className="space-y-4">
            <Card className="p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Todas as Páginas</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-3 px-4 font-semibold text-slate-700">Casal</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-700">Plano</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-700">Data</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-700">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allPages.map((page) => (
                      <tr key={page.id} className="border-b border-slate-100 hover:bg-rose-50">
                        <td className="py-3 px-4">
                          {page.partner1Name} & {page.partner2Name}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              page.planType === "premium"
                                ? "bg-purple-100 text-purple-700"
                                : "bg-blue-100 text-blue-700"
                            }`}
                          >
                            {page.planType === "premium" ? "Premium" : "Essencial"}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-600">
                          {new Date(page.createdAt).toLocaleDateString("pt-BR")}
                        </td>
                        <td className="py-3 px-4">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(`/p/${page.uniqueSlug}`, "_blank")}
                          >
                            Ver
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="plans" className="space-y-4">
            <Card className="p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Gerenciar Planos</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border border-slate-200 rounded-lg p-6">
                  <h3 className="text-lg font-bold text-slate-900 mb-4">Plano Essencial</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Preço (R$)</label>
                      <input type="number" defaultValue="29.90" className="w-full px-3 py-2 border border-slate-300 rounded-lg" disabled />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Duração</label>
                      <input type="text" defaultValue="1 ano (365 dias)" className="w-full px-3 py-2 border border-slate-300 rounded-lg" disabled />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Fotos</label>
                      <input type="number" defaultValue="3" className="w-full px-3 py-2 border border-slate-300 rounded-lg" disabled />
                    </div>
                  </div>
                </div>

                <div className="border border-slate-200 rounded-lg p-6">
                  <h3 className="text-lg font-bold text-slate-900 mb-4">Plano Premium</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Preço (R$)</label>
                      <input type="number" defaultValue="49.90" className="w-full px-3 py-2 border border-slate-300 rounded-lg" disabled />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Duração</label>
                      <input type="text" defaultValue="Vitalício" className="w-full px-3 py-2 border border-slate-300 rounded-lg" disabled />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Fotos</label>
                      <input type="number" defaultValue="5" className="w-full px-3 py-2 border border-slate-300 rounded-lg" disabled />
                    </div>
                  </div>
                </div>
              </div>
              <p className="text-sm text-slate-600 mt-6">Os preços estão bloqueados para manter a integridade do sistema.</p>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <Card className="p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Configurações do Sistema</h2>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h3 className="font-semibold text-blue-900 mb-2">Banco de Dados</h3>
                  <p className="text-sm text-blue-800">Todas as páginas estão armazenadas com segurança.</p>
                </div>
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h3 className="font-semibold text-green-900 mb-2">Stripe</h3>
                  <p className="text-sm text-green-800">Integração com Stripe ativa para pagamentos.</p>
                </div>
                <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                  <h3 className="font-semibold text-purple-900 mb-2">Notificações</h3>
                  <p className="text-sm text-purple-800">Você recebe notificações de novas páginas e pagamentos.</p>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
