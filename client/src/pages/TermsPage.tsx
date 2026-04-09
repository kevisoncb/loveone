
import { Page } from "../components/layout/Page";

export function TermsPage() {
  return (
    <Page>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-4">Termos de Uso</h1>
        <div className="prose">
          <p>Última atualização: [Data]</p>
          
          <p>
            Bem-vindo ao Love365! Estes Termos de Uso ("Termos") governam seu acesso e uso de nosso site e serviços. Ao usar o Love365, você concorda com estes Termos.
          </p>

          <h2>1. Contas</h2>
          <p>
            Ao criar uma conta, você é responsável por manter a confidencialidade de suas credenciais e por todas as atividades que ocorrem em sua conta.
          </p>

          <h2>2. Conteúdo do Usuário</h2>
          <p>
            Você concede ao Love365 uma licença não exclusiva para usar, reproduzir e exibir o conteúdo que você publica na plataforma, unicamente com o propósito de operar e fornecer os serviços.
          </p>

          <h2>3. Pagamentos</h2>
          <p>
            Os pagamentos são processados através do Stripe e estão sujeitos aos termos e condições do Stripe. Oferecemos diferentes planos com diferentes recursos e preços.
          </p>

          <h2>4. Rescisão</h2>
          <p>
            Podemos suspender ou encerrar sua conta se você violar estes Termos.
          </p>
          
          <p className="mt-6">
            <strong>Este é um documento de exemplo. Consulte um profissional para criar seus Termos de Uso.</strong>
          </p>
        </div>
      </div>
    </Page>
  );
}
