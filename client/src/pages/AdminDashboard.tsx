import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart, LogOut, Users, ShoppingCart, Settings, FileText, Edit, Trash, Zap, PieChart as PieChartIcon } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { Bar, BarChart as RechartsBarChart, Pie, PieChart, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  const { data: allPages = [], refetch: refetchPages } = trpc.tribute.myPages.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const { data: allPayments = [], refetch: refetchPayments } = trpc.payment.all.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const { data: analytics } = trpc.payment.getDashboardAnalytics.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const refundMutation = trpc.payment.refund.useMutation({
    onSuccess: () => {
      toast.success("Pagamento reembolsado com sucesso!");
      refetchPayments();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const deletePageMutation = trpc.tribute.adminDelete.useMutation({
    onSuccess: () => {
      toast.success("Página excluída com sucesso!");
      refetchPages();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const promotePageMutation = trpc.tribute.adminPromote.useMutation({
    onSuccess: () => {
      toast.success("Página promovida para Premium com sucesso!");
      refetchPages();
    },
    onError: (error) => {
      toast.error(error.message);
    },
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

  const handleRefund = (paymentIntentId: string) => {
    refundMutation.mutate({ paymentIntentId });
  };

  const handleEdit = (id: number) => {
    setLocation(`/edit/${id}`);
  };

  const handleDelete = (id: number) => {
    if (window.confirm("Tem certeza de que deseja excluir esta página?")) {
      deletePageMutation.mutate({ id });
    }
  };

  const handlePromote = (id: number) => {
    promotePageMutation.mutate({ id });
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
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="pages">Páginas</TabsTrigger>
            <TabsTrigger value="payments">Pagamentos</TabsTrigger>
            <TabsTrigger value="settings">Configurações</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total de Páginas</CardTitle>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{allPages.length}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Plano Essencial</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{allPages.filter((p) => p.planType === "essential").length}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Plano Premium</CardTitle>
                    <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{allPages.filter((p) => p.planType === "premium").length}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
                    <Settings className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">R$ {allPayments.reduce((acc, p) => p.status === 'completed' ? acc + p.amount : acc, 0).toFixed(2)}</div>
                  </CardContent>
                </Card>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Receita Mensal</CardTitle>
                  <CardDescription>Receita de pagamentos concluídos por mês.</CardDescription>
                </CardHeader>
                <CardContent className="pl-2">
                  <ChartContainer className="h-[350px] w-full" config={{}}>
                    <ResponsiveContainer>
                      <RechartsBarChart data={analytics?.monthlyRevenue}>
                        <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `R$${value}`} />
                        <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                        <Bar dataKey="total" fill="#f43f5e" radius={4} />
                      </RechartsBarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Novos Clientes</CardTitle>
                  <CardDescription>Novas páginas criadas por mês, por plano.</CardDescription>
                </CardHeader>
                <CardContent className="pl-2">
                  <ChartContainer className="h-[350px] w-full" config={{}}>
                    <ResponsiveContainer>
                      <RechartsBarChart data={analytics?.newCustomers} layout="vertical">
                        <XAxis type="number" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis type="category" dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                        <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                        <Bar dataKey="essential" stackId="a" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                        <Bar dataKey="premium" stackId="a" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                      </RechartsBarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>
            <Card>
              <CardHeader className="items-center pb-0">
                <CardTitle>Status dos Pagamentos</CardTitle>
                <CardDescription>Distribuição de todos os pagamentos</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 pb-0">
                <ChartContainer
                  config={{
                    visitors: {
                      label: "Visitors",
                    },
                    Completed: {
                      label: "Completed",
                      color: "hsl(var(--chart-1))",
                    },
                    Pending: {
                      label: "Pending",
                      color: "hsl(var(--chart-2))",
                    },
                    Failed: {
                      label: "Failed",
                      color: "hsl(var(--chart-3))",
                    },
                    Refunded: {
                      label: "Refunded",
                      color: "hsl(var(--chart-4))",
                    },
                  }}
                  className="mx-auto aspect-square h-[250px]"
                >
                  <PieChart>
                    <ChartTooltip
                      cursor={false}
                      content={<ChartTooltipContent hideLabel />}
                    />
                    <Pie data={analytics?.paymentStatus} dataKey="value" nameKey="name" innerRadius={60} outerRadius={80} strokeWidth={5}>
                    </Pie>
                    <ChartLegend
                      content={<ChartLegendContent nameKey="name" />}
                      className="-translate-y-[2rem] flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center"
                    />
                  </PieChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </TabsContent>

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
                        <td className="py-3 px-4 space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(`/p/${page.uniqueSlug}`, "_blank")}
                          >
                            Ver
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(page.id)}
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Editar
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(page.id)}
                          >
                            <Trash className="w-4 h-4 mr-2" />
                            Excluir
                          </Button>
                          {page.planType === "essential" && (
                            <Button
                              size="sm"
                              variant="premium"
                              onClick={() => handlePromote(page.id)}
                            >
                              <Zap className="w-4 h-4 mr-2" />
                              Promover
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="payments" className="space-y-4">
            <Card className="p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Todos os Pagamentos</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-3 px-4 font-semibold text-slate-700">ID do Pagamento</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-700">Valor</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-700">Status</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-700">Data</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-700">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allPayments.map((payment) => (
                      <tr key={payment.id} className="border-b border-slate-100 hover:bg-rose-50">
                        <td className="py-3 px-4 font-mono text-xs">{payment.stripePaymentIntentId}</td>
                        <td className="py-3 px-4">R$ {payment.amount.toFixed(2)}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              payment.status === "completed"
                                ? "bg-green-100 text-green-700"
                                : payment.status === "refunded"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {payment.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-600">
                          {new Date(payment.createdAt).toLocaleDateString("pt-BR")}
                        </td>
                        <td className="py-3 px-4">
                          {payment.status === "completed" && (
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleRefund(payment.stripePaymentIntentId)}
                              disabled={refundMutation.isLoading}
                            >
                              Reembolsar
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
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
