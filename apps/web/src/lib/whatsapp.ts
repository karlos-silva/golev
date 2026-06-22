/** WhatsApp da Go Lev (atendimento) — só dígitos, formato wa.me. */
export const GOLEV_WHATSAPP = '5500000000000';

/** Monta o link wa.me com uma mensagem pré-preenchida. */
export function whatsappUrl(message: string): string {
  return `https://wa.me/${GOLEV_WHATSAPP}?text=${encodeURIComponent(message)}`;
}
