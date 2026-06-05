import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { JsonLd, breadcrumbSchema } from '@/components/app/schema';

export const metadata: Metadata = {
  title: 'Política de Privacidade',
  description:
    'Como a Go Lev coleta, usa e protege seus dados — incluindo dados de saúde — em conformidade com a LGPD.',
  alternates: { canonical: '/legal/privacy' },
};

const ATUALIZADO_EM = '5 de junho de 2026';

const SECTIONS: { h: string; body: ReactNode }[] = [
  {
    h: '1. Quem é o controlador dos seus dados',
    body: (
      <>
        <p>
          O controlador dos dados pessoais tratados por meio deste site é a Go&nbsp;Lev
          (razão social <strong className="text-foreground">[a preencher]</strong>, inscrita no CNPJ
          sob o nº <strong className="text-foreground">[a preencher]</strong>, com sede em{' '}
          <strong className="text-foreground">[endereço]</strong>).
        </p>
        <p>
          Para qualquer assunto relacionado à privacidade, você pode falar com a gente pelo e-mail{' '}
          <strong className="text-foreground">privacidade@golev.app.br</strong>.
        </p>
      </>
    ),
  },
  {
    h: '2. Definições',
    body: (
      <>
        <p>Para facilitar a leitura, usamos os termos da LGPD (Lei nº 13.709/2018):</p>
        <ul className="ml-5 list-disc space-y-1.5">
          <li><strong className="text-foreground">Dado pessoal:</strong> informação que identifica ou pode identificar você (nome, e-mail, telefone, IP).</li>
          <li><strong className="text-foreground">Dado pessoal sensível:</strong> dado sobre saúde, entre outros, com proteção reforçada.</li>
          <li><strong className="text-foreground">Titular:</strong> você, a quem os dados se referem.</li>
          <li><strong className="text-foreground">Controlador:</strong> a Go&nbsp;Lev, que decide como os dados são tratados.</li>
          <li><strong className="text-foreground">Operador:</strong> terceiro que trata dados em nome da Go&nbsp;Lev (ex.: hospedagem).</li>
          <li><strong className="text-foreground">Encarregado (DPO):</strong> pessoa que faz a ponte entre você, a Go&nbsp;Lev e a ANPD.</li>
        </ul>
      </>
    ),
  },
  {
    h: '3. Quais dados coletamos',
    body: (
      <>
        <p><strong className="text-foreground">a) Dados que você nos fornece na avaliação de elegibilidade:</strong></p>
        <ul className="ml-5 list-disc space-y-1.5">
          <li>Contato: nome, e-mail e número de WhatsApp.</li>
          <li>
            Dados de saúde (dados sensíveis): sexo biológico, idade, altura, peso, IMC, objetivos,
            histórico de tentativas de emagrecimento, comorbidades (ex.: diabetes, hipertensão, apneia
            do sono), situações de segurança/contraindicações (ex.: gravidez ou amamentação, histórico
            de pancreatite, câncer medular de tireoide, transtorno alimentar) e tratamentos ou
            medicações anteriores.
          </li>
        </ul>
        <p><strong className="text-foreground">b) Dados coletados automaticamente quando você navega:</strong></p>
        <ul className="ml-5 list-disc space-y-1.5">
          <li>Endereço IP, tipo de dispositivo e navegador, páginas visitadas e eventos de uso.</li>
          <li>Origem do acesso (parâmetros de campanha/UTM) e cookies (ver seção 7).</li>
        </ul>
      </>
    ),
  },
  {
    h: '4. Tratamento de dados de saúde',
    body: (
      <p>
        Os dados informados na avaliação são <strong className="text-foreground">dados pessoais
        sensíveis</strong> (art. 11 da LGPD) e recebem cuidado reforçado. Eles são usados para a triagem
        clínica inicial e para que a equipe de saúde da Go&nbsp;Lev avalie se há indicação de
        acompanhamento. Só registramos os dados de quem conclui a avaliação e concorda expressamente com
        este tratamento.
      </p>
    ),
  },
  {
    h: '5. Com que base legal tratamos seus dados',
    body: (
      <ul className="ml-5 list-disc space-y-1.5">
        <li><strong className="text-foreground">Consentimento</strong> (art. 7º, I e art. 11, I): você autoriza ao concluir a avaliação.</li>
        <li><strong className="text-foreground">Tutela da saúde</strong> (art. 11, II, “f”): tratamento por profissionais de saúde, para os dados sensíveis.</li>
        <li><strong className="text-foreground">Legítimo interesse</strong> (art. 7º, IX): segurança, prevenção de fraude e melhoria do serviço, com dados não sensíveis.</li>
        <li><strong className="text-foreground">Cumprimento de obrigação legal ou regulatória</strong> (art. 7º, II) e exercício de direitos (art. 7º, VI).</li>
      </ul>
    ),
  },
  {
    h: '6. Para que usamos seus dados',
    body: (
      <ul className="ml-5 list-disc space-y-1.5">
        <li>Calcular sua elegibilidade (com base no IMC e nas suas respostas) e fazer a triagem inicial.</li>
        <li>Permitir que a médica/equipe de saúde da Go&nbsp;Lev avalie o seu caso.</li>
        <li>Entrar em contato com você (por WhatsApp ou e-mail) sobre o acompanhamento.</li>
        <li>Prestar, manter, medir e melhorar o serviço e o site.</li>
        <li>Garantir segurança, prevenir fraudes e cumprir obrigações legais.</li>
      </ul>
    ),
  },
  {
    h: '7. Cookies e ferramentas de análise',
    body: (
      <p>
        Usamos cookies e ferramentas de análise (como o PostHog) para entender como o site é usado e
        melhorá-lo. Você pode bloquear ou apagar cookies nas configurações do seu navegador — algumas
        funções podem ser afetadas. Não usamos esses dados para decisões médicas.
      </p>
    ),
  },
  {
    h: '8. Compartilhamento de dados',
    body: (
      <>
        <p>
          <strong className="text-foreground">A Go&nbsp;Lev não vende seus dados.</strong> Compartilhamos
          o mínimo necessário com:
        </p>
        <ul className="ml-5 list-disc space-y-1.5">
          <li>A médica e a equipe de saúde da Go&nbsp;Lev, para avaliar e conduzir seu acompanhamento.</li>
          <li>Operadores que tratam dados em nome da Go&nbsp;Lev (hospedagem, e-mail, comunicação/WhatsApp e análise), sob obrigação de confidencialidade.</li>
          <li>Autoridades públicas, quando exigido por lei, ordem judicial ou para o exercício de direitos.</li>
        </ul>
      </>
    ),
  },
  {
    h: '9. Transferência internacional',
    body: (
      <p>
        Alguns operadores (por exemplo, hospedagem e ferramentas de análise) podem tratar dados em
        servidores fora do Brasil, inclusive nos Estados Unidos. Nesses casos, adotamos as salvaguardas
        exigidas pela LGPD (art. 33) para manter a proteção dos seus dados.
      </p>
    ),
  },
  {
    h: '10. Segurança',
    body: (
      <p>
        Adotamos medidas técnicas e organizacionais para proteger seus dados, como criptografia em
        trânsito (TLS), controle de acesso restrito a pessoas autorizadas e boas práticas de segurança.
        Nenhum sistema é 100% imune, mas trabalhamos continuamente para reduzir riscos.
      </p>
    ),
  },
  {
    h: '11. Por quanto tempo guardamos',
    body: (
      <p>
        Mantemos seus dados pelo tempo necessário às finalidades descritas e ao cumprimento de obrigações
        legais. Encerrada a necessidade, os dados são eliminados ou anonimizados. Você pode pedir a
        exclusão a qualquer momento (ver seção 12), ressalvadas as hipóteses de guarda obrigatória.
      </p>
    ),
  },
  {
    h: '12. Seus direitos como titular',
    body: (
      <>
        <p>Conforme o art. 18 da LGPD, você pode, a qualquer momento:</p>
        <ul className="ml-5 list-disc space-y-1.5">
          <li>Confirmar a existência de tratamento e acessar seus dados;</li>
          <li>Corrigir dados incompletos, inexatos ou desatualizados;</li>
          <li>Solicitar anonimização, bloqueio ou eliminação de dados desnecessários;</li>
          <li>Solicitar a portabilidade;</li>
          <li>Obter informação sobre com quem compartilhamos seus dados;</li>
          <li>Revogar o consentimento.</li>
        </ul>
        <p>
          Para exercer esses direitos, escreva para{' '}
          <strong className="text-foreground">privacidade@golev.app.br</strong>. Podemos pedir
          informações para confirmar sua identidade antes de atender ao pedido.
        </p>
      </>
    ),
  },
  {
    h: '13. Encarregado pelo tratamento de dados (DPO)',
    body: (
      <p>
        Encarregado(a): <strong className="text-foreground">[nome a preencher]</strong> — e-mail{' '}
        <strong className="text-foreground">privacidade@golev.app.br</strong>. Você também pode procurar a
        Autoridade Nacional de Proteção de Dados (ANPD).
      </p>
    ),
  },
  {
    h: '14. Crianças e adolescentes',
    body: (
      <p>
        O serviço é destinado a pessoas com 18 anos ou mais. Não coletamos intencionalmente dados de
        menores de 18 anos. Se identificarmos esse tipo de coleta, os dados serão eliminados.
      </p>
    ),
  },
  {
    h: '15. Alterações nesta política',
    body: (
      <p>
        Podemos atualizar esta Política periodicamente. A data de “última atualização” no topo indica a
        versão vigente. Mudanças relevantes serão comunicadas pelos canais disponíveis.
      </p>
    ),
  },
  {
    h: '16. Contato e legislação aplicável',
    body: (
      <p>
        Dúvidas sobre privacidade? Fale com a gente em{' '}
        <strong className="text-foreground">privacidade@golev.app.br</strong>. Esta Política é regida pela
        legislação brasileira, em especial a LGPD (Lei nº 13.709/2018). Veja também nossos{' '}
        <Link href="/legal/terms" className="font-medium text-brand underline-offset-4 hover:underline">
          Termos de Uso
        </Link>
        .
      </p>
    ),
  },
];

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

      <h1 className="text-4xl font-bold tracking-tight">Política de Privacidade</h1>
      <p className="mt-4 text-muted-foreground">Última atualização: {ATUALIZADO_EM}</p>
      <p className="mt-6 leading-relaxed text-muted-foreground">
        A sua privacidade é levada a sério na Go&nbsp;Lev. Esta Política explica como coletamos, usamos,
        compartilhamos e protegemos seus dados pessoais — incluindo <strong className="text-foreground">
        dados de saúde</strong> — quando você usa o site golev.app.br e faz a avaliação de elegibilidade,
        em conformidade com a Lei Geral de Proteção de Dados (LGPD).
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
