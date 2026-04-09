
import { Page } from "../components/layout/Page";

export function PrivacyPage() {
  return (
    <Page>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-4">Política de Privacidade</h1>
        <div className="prose">
          <p>Última atualização: [Data]</p>
          
          <p>
            A sua privacidade é importante para nós. Esta Política de Privacidade explica como o Love365 coleta, usa e protege suas informações pessoais.
          </p>

          <h2>1. Informações que Coletamos</h2>
          <p>
            Coletamos informações que você nos fornece diretamente, como seu nome, e-mail e as informações usadas para criar as páginas de homenagem. Também coletamos dados de uso e de transação.
          </p>

          <h2>2. Como Usamos as Informações</h2>
          <p>
            Usamos suas informações para operar e manter os serviços, processar pagamentos, e nos comunicarmos com você.
          </p>

          <h2>3. Compartilhamento de Informações</h2>
          <p>
            Não compartilhamos suas informações pessoais com terceiros, exceto conforme necessário para fornecer nossos serviços (por exemplo, com o Stripe para processamento de pagamentos) ou conforme exigido por lei.
          </p>

          <h2>4. Segurança</h2>
          <p>
            Empregamos medidas de segurança para proteger suas informações, mas nenhum método de transmissão pela Internet é 100% seguro.
          </p>
          
          <p className="mt-6">
            <strong>Este é um documento de exemplo. Consulte um profissional para criar sua Política de Privacidade.</strong>
          </p>
        </div>
      </div>
    </Page>
  );
}
