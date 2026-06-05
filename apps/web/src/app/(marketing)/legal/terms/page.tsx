import type { Metadata } from 'next';
import { LegalDocumentNotice } from '@/components/app/legal-document-notice';

export const metadata: Metadata = {
  title: 'Termos de Uso',
  description: 'Termos e condições de uso da plataforma Go Lev.',
  alternates: {
    canonical: '/legal/terms',
  },
};

export default function TermsPage() {
  return (
    <section className="mx-auto max-w-3xl px-6 py-24">
      <LegalDocumentNotice />
      <h1 className="text-4xl font-bold tracking-tight">Termos de Uso</h1>
      <p className="mt-4 text-muted-foreground">
        Última atualização: {new Date().toLocaleDateString('pt-BR')}
      </p>

      <div className="mt-12 space-y-8 text-muted-foreground leading-relaxed">
        <div>
          <h2 className="text-xl font-semibold text-foreground">1. Aceitação dos Termos</h2>
          <p className="mt-3">
            Ao acessar e utilizar a plataforma Go Lev, você concorda com estes termos e
            condições. Se não concordar, não utilize o serviço.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-foreground">2. Descrição do Serviço</h2>
          <p className="mt-3">
            A Go Lev fornece uma plataforma SaaS para gestão empresarial. Os recursos disponíveis
            dependem do plano contratado.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-foreground">3. Conta do Usuário</h2>
          <p className="mt-3">
            Você é responsável por manter a confidencialidade das credenciais de acesso da sua
            conta e por todas as atividades realizadas com ela.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-foreground">4. Uso Aceitável</h2>
          <p className="mt-3">
            O uso do serviço deve seguir as leis aplicáveis. É proibido utilizar a plataforma para
            atividades ilícitas, spam ou violação de direitos de terceiros.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-foreground">5. Pagamento e Cancelamento</h2>
          <p className="mt-3">
            Os planos são cobrados conforme o ciclo escolhido. O cancelamento pode ser feito a
            qualquer momento, com acesso até o final do período pago.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-foreground">6. Alterações nos Termos</h2>
          <p className="mt-3">
            Reservamo-nos o direito de alterar estes termos. Mudanças significativas serão
            comunicadas por email ou notificação na plataforma.
          </p>
        </div>
      </div>
    </section>
  );
}
