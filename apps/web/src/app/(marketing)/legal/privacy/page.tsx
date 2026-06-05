import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { LegalDocumentNotice } from '@/components/app/legal-document-notice';
import { JsonLd, breadcrumbSchema } from '@/components/app/schema';

export const metadata: Metadata = {
  title: 'Política de Privacidade',
  description: 'Saiba como a Go Lev coleta, utiliza e protege seus dados.',
  alternates: {
    canonical: '/legal/privacy',
  },
};

export default function PrivacyPage() {
  return (
    <section className="mx-auto max-w-3xl px-6 py-24">
      <JsonLd
        data={breadcrumbSchema([
          { name: 'Início', url: '/' },
          { name: 'Política de Privacidade', url: '/legal/privacy' },
        ])}
      />
      <nav aria-label="Trilha" className="mb-8 flex items-center gap-1.5 text-sm text-ink-3">
        <Link href="/" className="transition-colors hover:text-foreground">
          Início
        </Link>
        <ChevronRight className="h-3.5 w-3.5" aria-hidden />
        <span className="text-ink-2">Política de Privacidade</span>
      </nav>
      <LegalDocumentNotice />
      <h1 className="text-4xl font-bold tracking-tight">Política de Privacidade</h1>
      <p className="mt-4 text-muted-foreground">
        Última atualização: {new Date().toLocaleDateString('pt-BR')}
      </p>

      <div className="mt-12 space-y-8 text-muted-foreground leading-relaxed">
        <div>
          <h2 className="text-xl font-semibold text-foreground">1. Dados Coletados</h2>
          <p className="mt-3">
            Coletamos dados pessoais fornecidos durante o cadastro (nome, email) e dados de uso
            da plataforma para melhorar nossos serviços.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-foreground">2. Uso dos Dados</h2>
          <p className="mt-3">
            Seus dados são utilizados para: fornecer e manter o serviço, comunicar atualizações,
            enviar informações sobre o plano contratado e melhorar a experiência do usuário.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-foreground">3. Compartilhamento</h2>
          <p className="mt-3">
            Não vendemos dados pessoais. Podemos compartilhar dados com provedores de serviço
            essenciais (processamento de pagamento, hospedagem) sob contratos de confidencialidade.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-foreground">4. Segurança</h2>
          <p className="mt-3">
            Utilizamos criptografia em trânsito (TLS) e em repouso, hashing seguro de senhas
            (argon2) e controles de acesso baseados em roles.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-foreground">5. Retenção</h2>
          <p className="mt-3">
            Mantemos seus dados enquanto sua conta estiver ativa. Após cancelamento, os dados
            são retidos por 30 dias para possível recuperação, depois removidos permanentemente.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-foreground">6. Seus Direitos</h2>
          <p className="mt-3">
            Conforme a LGPD, você tem direito a acessar, corrigir, excluir e portar seus dados
            pessoais. Entre em contato para exercer esses direitos.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-foreground">7. Contato</h2>
          <p className="mt-3">
            Para questões sobre privacidade, entre em contato pelo email: privacidade@seudominio.com
          </p>
        </div>
      </div>
    </section>
  );
}
