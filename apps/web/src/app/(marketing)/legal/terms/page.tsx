import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { JsonLd, breadcrumbSchema } from '@/components/app/schema';

export const metadata: Metadata = {
  title: 'Termos de Uso',
  description:
    'Termos e condições de uso do site e da avaliação de elegibilidade da Go Lev — saúde e emagrecimento com acompanhamento médico.',
  alternates: { canonical: '/legal/terms' },
};

const ATUALIZADO_EM = '5 de junho de 2026';

const SECTIONS: { h: string; body: ReactNode }[] = [
  {
    h: '1. Aceitação destes termos',
    body: (
      <p>
        Estes Termos de Uso regem o acesso ao site golev.app.br e o uso da avaliação de elegibilidade e
        demais funcionalidades da Go&nbsp;Lev. Ao navegar no site ou realizar a avaliação, você declara
        que leu, entendeu e concorda com estes Termos e com a nossa{' '}
        <Link href="/legal/privacy" className="font-medium text-brand underline-offset-4 hover:underline">
          Política de Privacidade
        </Link>
        . Se não concordar, não utilize o serviço.
      </p>
    ),
  },
  {
    h: '2. Quem somos e o que oferecemos',
    body: (
      <p>
        A Go&nbsp;Lev é um serviço de saúde voltado ao emagrecimento com acompanhamento médico humano.
        Oferecemos uma avaliação inicial gratuita de elegibilidade e, quando há indicação, um
        acompanhamento contínuo conduzido por profissionais de saúde — incluindo contato por canais
        digitais, como WhatsApp.
      </p>
    ),
  },
  {
    h: '3. A avaliação não substitui consulta médica',
    body: (
      <>
        <p>
          A avaliação de elegibilidade é uma <strong className="text-foreground">triagem inicial</strong>{' '}
          baseada nas informações que você fornece (como IMC e histórico de saúde). Ela{' '}
          <strong className="text-foreground">não é diagnóstico</strong>, não substitui uma consulta
          médica e, por si só, não estabelece relação médico-paciente.
        </p>
        <p>
          A Go&nbsp;Lev <strong className="text-foreground">não presta atendimento de urgência ou
          emergência</strong>. Em caso de emergência, ligue 192 (SAMU) ou procure o pronto-socorro mais
          próximo.
        </p>
      </>
    ),
  },
  {
    h: '4. Elegibilidade para uso',
    body: (
      <p>
        O serviço é destinado a pessoas com 18 anos ou mais. Ao usá-lo, você declara ter capacidade civil
        e fornecer informações verdadeiras, completas e atualizadas. Informações incorretas podem
        comprometer a triagem e o acompanhamento.
      </p>
    ),
  },
  {
    h: '5. Acompanhamento médico e medicamentos',
    body: (
      <>
        <p>
          O resultado da avaliação indica apenas se <em>pode</em> haver indicação para acompanhamento — a
          decisão clínica é sempre individual e cabe ao médico, a partir do seu histórico, exame e, quando
          necessário, exames complementares.
        </p>
        <p>
          Qualquer medicamento, inclusive análogos de GLP-1 (como os comercializados sob as marcas
          Mounjaro®, Ozempic® e Wegovy®), depende de <strong className="text-foreground">prescrição
          médica individual</strong> e de acompanhamento, conforme as normas da ANVISA e do Conselho
          Federal de Medicina (CFM). A Go&nbsp;Lev não vende medicamentos pelo site e não garante
          resultados — cada pessoa responde de forma diferente ao tratamento.
        </p>
      </>
    ),
  },
  {
    h: '6. Suas responsabilidades',
    body: (
      <ul className="ml-5 list-disc space-y-1.5">
        <li>Fornecer informações verdadeiras e preencher a avaliação pessoalmente, em seu próprio nome.</li>
        <li>Usar o site conforme a lei e estes Termos, sem prejudicar terceiros ou a própria Go&nbsp;Lev.</li>
        <li>Manter seus dados de contato corretos para receber os retornos do acompanhamento.</li>
      </ul>
    ),
  },
  {
    h: '7. Conteúdo informativo',
    body: (
      <p>
        Os textos do site e do blog têm caráter <strong className="text-foreground">educativo e
        informativo</strong>, baseados em fontes e evidências, e não constituem recomendação médica
        individual. Não tome decisões de saúde apenas com base neles — converse com um profissional.
      </p>
    ),
  },
  {
    h: '8. Propriedade intelectual',
    body: (
      <p>
        A marca Go&nbsp;Lev, o logotipo, os textos, o design e os demais elementos do site são protegidos
        e pertencem à Go&nbsp;Lev ou a seus licenciadores. É vedado copiar, reproduzir ou usar esses
        elementos sem autorização prévia e por escrito.
      </p>
    ),
  },
  {
    h: '9. Privacidade e proteção de dados',
    body: (
      <p>
        O tratamento dos seus dados, incluindo dados de saúde, é descrito na nossa{' '}
        <Link href="/legal/privacy" className="font-medium text-brand underline-offset-4 hover:underline">
          Política de Privacidade
        </Link>
        , parte integrante destes Termos e elaborada em conformidade com a LGPD.
      </p>
    ),
  },
  {
    h: '10. Limitação de responsabilidade',
    body: (
      <p>
        Na máxima extensão permitida pela lei, a Go&nbsp;Lev não se responsabiliza por decisões tomadas
        unicamente com base no conteúdo informativo do site, nem por indisponibilidades, falhas técnicas
        ou eventos fora do seu controle razoável. As responsabilidades clínicas seguem a relação
        estabelecida com o profissional de saúde durante o acompanhamento.
      </p>
    ),
  },
  {
    h: '11. Planos e pagamento',
    body: (
      <p>
        A avaliação inicial é gratuita. Caso o acompanhamento envolva planos ou cobranças, as condições,
        valores e formas de pagamento serão informados de maneira clara antes de qualquer contratação.
      </p>
    ),
  },
  {
    h: '12. Alterações nestes termos',
    body: (
      <p>
        Podemos atualizar estes Termos periodicamente. A data de “última atualização” no topo indica a
        versão vigente, e o uso continuado do site após mudanças significa concordância com a nova versão.
      </p>
    ),
  },
  {
    h: '13. Lei aplicável e foro',
    body: (
      <p>
        Estes Termos são regidos pela legislação brasileira. Fica eleito o foro da comarca de{' '}
        <strong className="text-foreground">[comarca a preencher]</strong> para dirimir eventuais
        controvérsias, salvo disposição legal que assegure foro diverso ao consumidor.
      </p>
    ),
  },
  {
    h: '14. Contato',
    body: (
      <p>
        Dúvidas sobre estes Termos? Fale com a gente em{' '}
        <strong className="text-foreground">contato@golev.app.br</strong>.
      </p>
    ),
  },
];

export default function TermsPage() {
  return (
    <section className="mx-auto max-w-3xl px-6 py-24">
      <JsonLd
        data={breadcrumbSchema([
          { name: 'Início', url: '/' },
          { name: 'Termos de Uso', url: '/legal/terms' },
        ])}
      />
      <nav aria-label="Trilha" className="mb-8 flex items-center gap-1.5 text-sm text-ink-3">
        <Link href="/" className="transition-colors hover:text-foreground">
          Início
        </Link>
        <ChevronRight className="h-3.5 w-3.5" aria-hidden />
        <span className="text-ink-2">Termos de Uso</span>
      </nav>

      <h1 className="text-4xl font-bold tracking-tight">Termos de Uso</h1>
      <p className="mt-4 text-muted-foreground">Última atualização: {ATUALIZADO_EM}</p>
      <p className="mt-6 leading-relaxed text-muted-foreground">
        Bem-vindo à Go&nbsp;Lev. Estes Termos explicam as regras para usar nosso site e a avaliação de
        elegibilidade. Leia com atenção — alguns pontos tratam de saúde e do papel do acompanhamento
        médico.
      </p>

      <div className="mt-12 space-y-8 leading-relaxed text-muted-foreground">
        {SECTIONS.map((s) => (
          <div key={s.h}>
            <h2 className="text-xl font-semibold text-foreground">{s.h}</h2>
            <div className="mt-3 space-y-3">{s.body}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
