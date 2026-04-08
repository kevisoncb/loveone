import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Lock, Heart } from "lucide-react";
import { toast } from "sonner";

export default function AdminLogin() {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [, setLocation] = useLocation();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("adminToken", data.token);
        toast.success("Login realizado com sucesso!");
        setLocation("/admin/dashboard");
      } else {
        toast.error("Senha incorreta");
        setPassword("");
      }
    } catch (error) {
      toast.error("Erro ao fazer login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 shadow-lg">
        <div className="flex justify-center mb-6">
          <div className="flex items-center gap-2">
            <Heart className="w-8 h-8 text-rose-500 fill-rose-500" />
            <span className="text-2xl font-serif font-bold text-slate-900">Love365</span>
          </div>
        </div>

        <h1 className="text-2xl font-serif font-bold text-center text-slate-900 mb-2">
          Painel Administrativo
        </h1>
        <p className="text-center text-slate-600 mb-8">
          Acesso restrito apenas para administradores
        </p>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-medium text-slate-700">
              Senha de Administrador
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
              <Input
                id="password"
                type="password"
                placeholder="Digite a senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10"
                disabled={loading}
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-rose-500 hover:bg-rose-600 text-white"
            disabled={loading || !password}
          >
            {loading ? "Entrando..." : "Entrar no Painel"}
          </Button>
        </form>

        <div className="mt-8 pt-8 border-t border-slate-200">
          <p className="text-center text-sm text-slate-600">
            <a href="/" className="text-rose-500 hover:text-rose-600 font-medium">
              Voltar para Home
            </a>
          </p>
        </div>
      </Card>
    </div>
  );
}
