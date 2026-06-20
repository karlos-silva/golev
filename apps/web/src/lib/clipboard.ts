/**
 * Copia texto para a área de transferência com fallback — e NUNCA lança.
 *
 * `navigator.clipboard.writeText` pode rejeitar com `NotAllowedError` quando o
 * documento não está focado ou a permissão é negada. Sem tratamento isso vira
 * uma unhandled rejection (overlay de erro no dev). Aqui tentamos a Clipboard
 * API e, em falha, caímos para o método legado (textarea + execCommand).
 *
 * @returns `true` se copiou, `false` caso contrário.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* cai para o fallback abaixo */
  }

  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.top = '0';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}
