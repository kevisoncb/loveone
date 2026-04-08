import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Star, Check, ChevronDown, ChevronUp, Music, Camera, Clock, Link2, QrCode, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { useLocation } from "wouter";

function LiveCounter() {
  const [time, setTime] = useState({ years: 2, months: 7, days: 14, hours: 8, minutes: 32, seconds: 0 });
  useEffect(() => {
    const interval = setInterval(() => {
      setTime(prev => {
        let { years, months, days, hours, minutes, seconds } = prev;
        seconds++;
        if (seconds >= 60) { seconds = 0; minutes++; }
        if (minutes >= 60) { minutes = 0; hours++; }
        if (hours >= 24) { hours = 0; days++; }
        return { years, months, days, hours, minutes, seconds };
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);
  return (
    <div className="grid grid-cols-3 gap-1.5 w-full">
      {[
        { label: "Anos", value: time.years },
        { label: "Meses", value: time.months },
        { label: "Dias", value: time.days },
        { label: "Horas", value: time.hours },
        { label: "Min", value: time.minutes },
        { label: "Seg", value: time.seconds },
      ].map(({ label, value }) => (
        <div key={label} className="flex flex-col items-center bg-white/20 rounded-lg py-1.5 px-1">
          <span className="text-white font-bold text-base leading-none">{String(value).padStart(2, "0")}</span>
          <span className="text-white/70 text-[9px] mt-0.5 font-medium uppercase tracking-wide">{label}</span>
        </div>
      ))}
    </div>
  );
}

function PhoneMockup() {
  const [currentPhoto, setCurrentPhoto] = useState(0);
  const photos = [
    "https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=300&q=80",
    "https://images.unsplash.com/photo-1529634597503-139d3726fed5?w=300&q=80",
    "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=300&q=80",
  ];
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPhoto(p => (p + 1) % photos.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);
  return (
    <div className="relative mx-auto" style={{ width: 220, height: 440 }}>
      <div className="absolute inset-0 rounded-[36px] bg-gradient-to-b from-gray-800 to-gray-900 shadow-2xl" />
      <div className="absolute inset-[3px] rounded-[33px] bg-black" />
      <div className="absolute top-[10px] left-1/2 -translate-x-1/2 w-20 h-5 bg-gray-900 rounded-full z-20" />
      <div className="absolute -right-[3px] top-24 w-[3px] h-10 bg-gray-700 rounded-r-sm" />
      <div className="absolute -left-[3px] top-20 w-[3px] h-8 bg-gray-700 rounded-l-sm" />
      <div className="absolute -left-[3px] top-32 w-[3px] h-8 bg-gray-700 rounded-l-sm" />
      <div className="absolute inset-[6px] rounded-[30px] overflow-hidden bg-gradient-to-b from-rose-900 to-pink-950">
        <AnimatePresence mode="wait">
          <motion.img
            key={currentPhoto}
            src={photos[currentPhoto]}
            alt="Casal"
            className="absolute inset-0 w-full h-full object-cover opacity-60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
          />
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/70" />
        <div className="absolute inset-0 flex flex-col items-center justify-between p-4 pt-8">
          <div className="flex items-center gap-1">
            <Heart className="w-3 h-3 text-rose-300 fill-rose-300" />
            <span className="text-white/90 text-[10px] font-medium tracking-widest uppercase">Love365</span>
            <Heart className="w-3 h-3 text-rose-300 fill-rose-300" />
          </div>
          <div className="text-center">
            <p className="text-white text-sm font-light italic opacity-90">Ana & Pedro</p>
            <p className="text-white/60 text-[9px] mt-0.5">Juntos desde 14/08/2022</p>
          </div>
          <div className="w-full">
            <p className="text-white/70 text-[9px] text-center mb-2 uppercase tracking-widest">Nosso tempo juntos</p>
            <LiveCounter />
          </div>
          <div className="w-full bg-white/10 rounded-lg p-2 flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-rose-500 flex items-center justify-center flex-shrink-0">
              <Music className="w-2.5 h-2.5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-[8px] truncate">Perfect - Ed Sheeran</p>
              <div className="w-full h-0.5 bg-white/20 rounded-full mt-1">
                <div className="w-2/3 h-full bg-rose-400 rounded-full" />
              </div>
            </div>
          </div>
        </div>
        {[...Array(4)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-rose-400"
            style={{ left: `${15 + i * 22}%`, bottom: "20%" }}
            animate={{ y: [-10, -40, -80], opacity: [0, 1, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.7, ease: "easeOut" }}
          >
            <Heart className="w-3 h-3 fill-rose-400" />
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <button
        className="w-full flex items-center justify-between p-5 text-left hover:bg-accent/50 transition-colors"
        onClick={() => setOpen(!open)}
      >
        <span className="font-medium text-foreground pr-4" style={{ fontFamily: "Inter, sans-serif" }}>{question}</span>
        {open ? <ChevronUp className="w-5 h-5 text-primary flex-shrink-0" /> : <ChevronDown className="w-5 h-5 text-muted-foreground flex-shrink-0" />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <p className="px-5 pb-5 text-muted-foreground leading-relaxed" style={{ fontFamily: "Inter, sans-serif", fontSize: "0.9rem" }}>
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const faqs = [
  { question: "O Plano Premium realmente é vitalício?", answer: "Sim! O Plano Premium é um pagamento único de R$ 49,90 e sua página ficará ativa para sempre, sem mensalidades ou renovações. Você paga uma vez e aproveita eternamente." },
  { question: "Quanto tempo dura o Plano Essencial?", answer: "O Plano Essencial dura exatamente 1 ano (365 dias) a partir da data de ativação. Após esse período, você pode renovar para continuar com sua página ativa." },
  { question: "Como funciona o link único e o QR Code?", answer: "Ao criar sua página, o sistema gera automaticamente um link único (ex: love365.com/p/abc123) e um QR Code que você pode baixar e compartilhar com quem quiser. Basta escanear o QR Code para abrir a página de homenagem." },
  { question: "Posso adicionar qualquer música do YouTube?", answer: "Sim! Basta colar o link de qualquer vídeo do YouTube na sua página. No Plano Essencial você terá um player simples, e no Premium o player terá visual estilo Spotify com controles elegantes." },
  { question: "Quantas fotos posso adicionar?", answer: "No Plano Essencial você pode adicionar até 3 fotos no slideshow. No Plano Premium, até 5 fotos. As fotos são armazenadas com segurança em nossos servidores." },
  { question: "O que é a chuva de corações?", answer: "É um efeito visual animado exclusivo do Plano Premium onde corações flutuam pela tela da página de homenagem, criando uma atmosfera ainda mais romântica e encantadora." },
  { question: "Posso editar minha página depois de criada?", answer: "Sim! Você pode editar os nomes, a data do relacionamento, as fotos e a música a qualquer momento pelo seu painel de controle." },
];

export default function Home() {
  const { isAuthenticated } = useAuth();
  const [, navigate] = useLocation();

  const handleCTA = () => {
    if (isAuthenticated) {
      navigate("/dashboard");
    } else {
      const loginUrl = getLoginUrl();
      sessionStorage.setItem("returnPath", "/dashboard");
      window.location.href = loginUrl;
    }
  };

  const handlePlanCTA = (plan: "essential" | "premium") => {
    if (isAuthenticated) {
      navigate(`/create?plan=${plan}`);
    } else {
      const loginUrl = getLoginUrl();
      sessionStorage.setItem("returnPath", `/create?plan=${plan}`);
      window.location.href = loginUrl;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/30">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <Heart className="w-6 h-6 text-primary fill-primary" />
            <span className="text-xl font-bold text-gradient-rose" style={{ fontFamily: "Cormorant Garamond, serif" }}>Love365</span>
          </div>
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <Button onClick={() => navigate("/dashboard")} className="bg-primary hover:bg-primary/90 text-white rounded-full px-5" style={{ fontFamily: "Inter, sans-serif" }}>Meu Painel</Button>
            ) : (
              <>
                <Button variant="ghost" onClick={() => window.location.href = getLoginUrl()} className="text-foreground hover:text-primary" style={{ fontFamily: "Inter, sans-serif" }}>Entrar</Button>
                <Button onClick={handleCTA} className="bg-primary hover:bg-primary/90 text-white rounded-full px-5" style={{ fontFamily: "Inter, sans-serif" }}>Começar</Button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="gradient-hero pt-32 pb-20 overflow-hidden">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7 }} className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-1.5 text-sm mb-6" style={{ fontFamily: "Inter, sans-serif" }}>
                <Sparkles className="w-4 h-4" />
                <span>Eternize o amor de vocês</span>
              </div>
              <h1 className="text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight mb-6" style={{ fontFamily: "Cormorant Garamond, serif" }}>
                Uma página só{" "}
                <span className="text-gradient-rose italic">para vocês dois</span>
              </h1>
              <p className="text-lg text-muted-foreground mb-8 max-w-lg mx-auto lg:mx-0 leading-relaxed" style={{ fontFamily: "Inter, sans-serif" }}>
                Crie uma página de homenagem personalizada para o seu relacionamento, com contador em tempo real, slideshow de fotos e música de fundo. Compartilhe com um link único.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button onClick={handleCTA} size="lg" className="bg-primary hover:bg-primary/90 text-white rounded-full px-8 py-6 text-lg shadow-lg hover:shadow-xl transition-all pulse-glow" style={{ fontFamily: "Inter, sans-serif" }}>
                  <Heart className="w-5 h-5 mr-2 fill-white" />
                  Criar minha página
                </Button>
                <Button variant="outline" size="lg" onClick={() => document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" })} className="rounded-full px-8 py-6 text-lg border-primary/30 text-primary hover:bg-primary/5" style={{ fontFamily: "Inter, sans-serif" }}>
                  Ver planos
                </Button>
              </div>
              <div className="flex items-center gap-6 mt-10 justify-center lg:justify-start">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gradient-rose">1.200+</p>
                  <p className="text-xs text-muted-foreground mt-0.5" style={{ fontFamily: "Inter, sans-serif" }}>Casais felizes</p>
                </div>
                <div className="w-px h-10 bg-border" />
                <div className="text-center">
                  <p className="text-2xl font-bold text-gradient-rose">4.9★</p>
                  <p className="text-xs text-muted-foreground mt-0.5" style={{ fontFamily: "Inter, sans-serif" }}>Avaliação média</p>
                </div>
                <div className="w-px h-10 bg-border" />
                <div className="text-center">
                  <p className="text-2xl font-bold text-gradient-rose">100%</p>
                  <p className="text-xs text-muted-foreground mt-0.5" style={{ fontFamily: "Inter, sans-serif" }}>Personalizado</p>
                </div>
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }} className="flex justify-center relative">
              <div className="absolute -top-10 -left-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl" />
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-pink-300/20 rounded-full blur-3xl" />
              {[...Array(6)].map((_, i) => (
                <motion.div key={i} className="absolute text-primary/40"
                  style={{ top: `${10 + (i % 3) * 30}%`, left: i < 3 ? `${-5 + i * 5}%` : `${75 + (i - 3) * 8}%` }}
                  animate={{ y: [0, -15, 0], rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 3 + i * 0.5, repeat: Infinity, delay: i * 0.4 }}>
                  <Heart className={`fill-primary/30 ${i % 2 === 0 ? "w-5 h-5" : "w-3 h-3"}`} />
                </motion.div>
              ))}
              <PhoneMockup />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-bold mb-4" style={{ fontFamily: "Cormorant Garamond, serif" }}>Tudo que o amor merece</h2>
            <p className="text-muted-foreground max-w-xl mx-auto" style={{ fontFamily: "Inter, sans-serif" }}>Cada detalhe pensado para tornar a página de vocês única e inesquecível.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Clock, title: "Contador em Tempo Real", desc: "Veja cada segundo do relacionamento de vocês contado ao vivo, com anos, meses, dias, horas, minutos e segundos." },
              { icon: Camera, title: "Slideshow de Fotos", desc: "Adicione até 5 fotos que representam a história de vocês em um slideshow animado e elegante." },
              { icon: Music, title: "Música de Fundo", desc: "Escolha a música que é de vocês no YouTube e deixe ela tocar suavemente na página de homenagem." },
              { icon: Link2, title: "Link Único", desc: "Receba um link personalizado para compartilhar com quem quiser. Simples, bonito e fácil de lembrar." },
              { icon: QrCode, title: "QR Code", desc: "Baixe o QR Code da página e use em convites, molduras, presentes ou onde quiser." },
              { icon: Sparkles, title: "Chuva de Corações", desc: "Efeito visual exclusivo Premium: corações animados flutuam pela página criando uma atmosfera mágica." },
            ].map(({ icon: Icon, title, desc }) => (
              <motion.div key={title} whileHover={{ y: -4 }} className="p-6 rounded-2xl border border-border bg-card hover:shadow-lg transition-all group">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2 text-foreground" style={{ fontFamily: "Cormorant Garamond, serif" }}>{title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed" style={{ fontFamily: "Inter, sans-serif" }}>{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 gradient-rose">
        <div className="container">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-bold mb-4" style={{ fontFamily: "Cormorant Garamond, serif" }}>Escolha o plano de vocês</h2>
            <p className="text-muted-foreground max-w-xl mx-auto" style={{ fontFamily: "Inter, sans-serif" }}>Sem mensalidades escondidas. Preço justo para eternizar o amor de vocês.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            <motion.div whileHover={{ y: -6 }} className="bg-white rounded-3xl p-8 shadow-md border border-border relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="mb-6">
                <p className="text-sm font-medium text-muted-foreground mb-1" style={{ fontFamily: "Inter, sans-serif" }}>Plano</p>
                <h3 className="text-3xl font-bold text-foreground" style={{ fontFamily: "Cormorant Garamond, serif" }}>Essencial</h3>
                <div className="flex items-baseline gap-1 mt-4">
                  <span className="text-4xl font-bold text-primary">R$ 29,90</span>
                  <span className="text-muted-foreground text-sm" style={{ fontFamily: "Inter, sans-serif" }}>/ano</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1" style={{ fontFamily: "Inter, sans-serif" }}>Válido por 365 dias</p>
              </div>
              <ul className="space-y-3 mb-8">
                {["3 fotos no slideshow", "Contador em tempo real", "Player de música simples", "Link único para compartilhar", "QR Code para download", "Design clean e elegante"].map(f => (
                  <li key={f} className="flex items-center gap-3 text-sm text-foreground" style={{ fontFamily: "Inter, sans-serif" }}>
                    <Check className="w-4 h-4 text-primary flex-shrink-0" />{f}
                  </li>
                ))}
              </ul>
              <Button onClick={() => handlePlanCTA("essential")} className="w-full rounded-full bg-primary hover:bg-primary/90 text-white py-6" style={{ fontFamily: "Inter, sans-serif" }}>
                Começar com Essencial
              </Button>
            </motion.div>
            <motion.div whileHover={{ y: -6 }} className="gradient-premium rounded-3xl p-8 shadow-xl relative overflow-hidden">
              <div className="absolute top-5 right-5 bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1" style={{ fontFamily: "Inter, sans-serif" }}>
                <Star className="w-3 h-3 fill-yellow-900" />Mais popular
              </div>
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="mb-6">
                <p className="text-sm font-medium text-white/70 mb-1" style={{ fontFamily: "Inter, sans-serif" }}>Plano</p>
                <h3 className="text-3xl font-bold text-white" style={{ fontFamily: "Cormorant Garamond, serif" }}>Premium</h3>
                <div className="flex items-baseline gap-1 mt-4">
                  <span className="text-4xl font-bold text-white">R$ 49,90</span>
                  <span className="text-white/70 text-sm" style={{ fontFamily: "Inter, sans-serif" }}>/vitalício</span>
                </div>
                <p className="text-xs text-white/60 mt-1" style={{ fontFamily: "Inter, sans-serif" }}>Pagamento único — para sempre</p>
              </div>
              <ul className="space-y-3 mb-8">
                {["5 fotos no slideshow", "Contador em tempo real", "Player estilo Spotify", "Chuva de corações animada", "Link único para compartilhar", "QR Code para download", "Acesso vitalício"].map(f => (
                  <li key={f} className="flex items-center gap-3 text-sm text-white" style={{ fontFamily: "Inter, sans-serif" }}>
                    <Check className="w-4 h-4 text-white/80 flex-shrink-0" />{f}
                  </li>
                ))}
              </ul>
              <Button onClick={() => handlePlanCTA("premium")} className="w-full rounded-full bg-white text-primary hover:bg-white/90 py-6 font-semibold shadow-lg" style={{ fontFamily: "Inter, sans-serif" }}>
                <Heart className="w-4 h-4 mr-2 fill-primary" />Começar com Premium
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white">
        <div className="container max-w-3xl">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-bold mb-4" style={{ fontFamily: "Cormorant Garamond, serif" }}>Perguntas frequentes</h2>
            <p className="text-muted-foreground" style={{ fontFamily: "Inter, sans-serif" }}>Tudo que você precisa saber antes de criar a página de vocês.</p>
          </div>
          <div className="space-y-3">
            {faqs.map(faq => <FAQItem key={faq.question} question={faq.question} answer={faq.answer} />)}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 gradient-hero">
        <div className="container text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <Heart className="w-12 h-12 text-primary fill-primary mx-auto mb-6" />
            <h2 className="text-4xl lg:text-5xl font-bold mb-6" style={{ fontFamily: "Cormorant Garamond, serif" }}>
              Eternize o amor de vocês{" "}
              <span className="text-gradient-rose italic">hoje</span>
            </h2>
            <p className="text-muted-foreground text-lg mb-8 max-w-lg mx-auto" style={{ fontFamily: "Inter, sans-serif" }}>
              Crie a página de homenagem do casal em menos de 5 minutos e compartilhe com quem você ama.
            </p>
            <Button onClick={handleCTA} size="lg" className="bg-primary hover:bg-primary/90 text-white rounded-full px-10 py-7 text-lg shadow-lg hover:shadow-xl transition-all" style={{ fontFamily: "Inter, sans-serif" }}>
              <Heart className="w-5 h-5 mr-2 fill-white" />
              Criar minha página agora
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-foreground text-background py-12">
        <div className="container">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <Heart className="w-6 h-6 text-primary fill-primary" />
              <span className="text-xl font-bold" style={{ fontFamily: "Cormorant Garamond, serif" }}>Love365</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-background/60" style={{ fontFamily: "Inter, sans-serif" }}>
              <a href="/terms" className="hover:text-background transition-colors">Termos de Uso</a>
              <a href="/privacy" className="hover:text-background transition-colors">Privacidade</a>
              <a href="mailto:contato@love365.com.br" className="hover:text-background transition-colors">Contato</a>
            </div>
            <p className="text-sm text-background/40" style={{ fontFamily: "Inter, sans-serif" }}>
              © {new Date().getFullYear()} Love365. Feito com amor ♥
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
