import { redirect } from 'next/navigation';

/* ---------------------------------------------------------------------------
   Preço fora da landing por enquanto: atendimento e custos são tratados via
   WhatsApp (a avaliação em /avaliacao captura o contato). Esta rota redireciona
   para a home para não expor planos/valores.
   Para reativar a página de planos no futuro, restaure o conteúdo anterior
   (disponível no histórico do git) com o modelo real da Go Lev.
   --------------------------------------------------------------------------- */
export default function PricingPage() {
  redirect('/');
}
