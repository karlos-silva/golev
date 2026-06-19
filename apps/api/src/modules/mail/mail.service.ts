import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

/* ============================================================================
   Envio de e-mails transacionais (Resend). Tom acolhedor da Go Lev.
   - Sem RESEND_API_KEY → não envia, apenas loga (modo dev).
   - Em dev, loga o LINK para testar o fluxo sem depender de entrega real.
   - FROM em EMAIL_FROM (precisa de domínio verificado no Resend p/ produção;
     'onboarding@resend.dev' só entrega para o dono da conta Resend).
   ========================================================================== */

const BRAND = {
  primaryStrong: '#1F3B4C',
  primary: '#3F6076',
  accentStrong: '#BC6B43',
  paper: '#F8F8F5',
  surface: '#FFFFFF',
  ink: '#1E2426',
  ink2: '#525A5C',
  line: '#E7E4DD',
};

function layout(opts: {
  heading: string;
  intro: string;
  cta: { label: string; url: string };
  note: string;
  logoUrl: string;
}): string {
  return `<!doctype html>
<html lang="pt-BR"><body style="margin:0;background:${BRAND.paper};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:${BRAND.ink};">
  <div style="max-width:520px;margin:0 auto;padding:32px 20px;">
    <img src="${opts.logoUrl}" alt="Go Lev" width="104" height="37" style="height:37px;width:auto;display:block;margin-bottom:24px;border:0;outline:none;text-decoration:none;" />

    <div style="background:${BRAND.surface};border:1px solid ${BRAND.line};border-radius:16px;padding:32px;">
      <h1 style="margin:0 0 12px;font-size:22px;line-height:1.3;color:${BRAND.ink};">${opts.heading}</h1>
      <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:${BRAND.ink2};">${opts.intro}</p>
      <a href="${opts.cta.url}" style="display:inline-block;background:${BRAND.primary};color:${BRAND.paper};text-decoration:none;font-weight:600;font-size:15px;padding:12px 24px;border-radius:10px;">${opts.cta.label}</a>
      <p style="margin:24px 0 0;font-size:13px;line-height:1.6;color:#8A9295;">${opts.note}</p>
      <p style="margin:12px 0 0;font-size:12px;line-height:1.6;color:#8A9295;word-break:break-all;">Ou copie e cole este link:<br>${opts.cta.url}</p>
    </div>
    <p style="margin:20px 0 0;text-align:center;font-size:12px;color:#8A9295;">Go Lev · cuidado que eleva quem decide mudar</p>
  </div>
</body></html>`;
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly resend: Resend | null;
  private readonly from: string;
  private readonly appUrl: string;

  constructor(private readonly config: ConfigService) {
    const key = this.config.get<string>('RESEND_API_KEY')?.trim();
    this.resend = key ? new Resend(key) : null;
    this.from =
      this.config.get<string>('EMAIL_FROM')?.trim() ||
      'Go Lev <onboarding@resend.dev>';
    this.appUrl = (
      this.config.get<string>('APP_URL') ||
      this.config.get<string>('NEXT_PUBLIC_SITE_URL') ||
      'http://localhost:3000'
    ).replace(/\/$/, '');
    if (!this.resend) {
      this.logger.warn(
        'RESEND_API_KEY ausente — e-mails serão apenas logados (modo dev).',
      );
    }
  }

  private async send(to: string, subject: string, html: string): Promise<void> {
    if (!this.resend) {
      this.logger.warn(`[e-mail desabilitado] "${subject}" → ${to}`);
      return;
    }
    try {
      const { error } = await this.resend.emails.send({
        from: this.from,
        to,
        subject,
        html,
      });
      if (error) {
        this.logger.error(
          `Resend recusou "${subject}" → ${to}: ${JSON.stringify(error)}`,
        );
      }
    } catch (e) {
      this.logger.error(`Falha ao enviar "${subject}" → ${to}: ${String(e)}`);
    }
  }

  private resetLink(token: string): string {
    return `${this.appUrl}/redefinir-senha?token=${encodeURIComponent(token)}`;
  }

  async sendPasswordReset(input: {
    to: string;
    name: string;
    token: string;
  }): Promise<void> {
    const url = this.resetLink(input.token);
    if (process.env.NODE_ENV !== 'production') {
      this.logger.log(`🔗 Reset de senha p/ ${input.to}: ${url}`);
    }
    const first = input.name?.split(' ')[0] ?? 'Olá';
    const html = layout({
      heading: `Redefinir sua senha`,
      intro: `Oi, ${first}. Recebemos um pedido para redefinir a senha da sua conta Go Lev. É só clicar no botão abaixo — o link vale por 1 hora.`,
      cta: { label: 'Criar nova senha', url },
      note: 'Se você não pediu isso, pode ignorar este e-mail com tranquilidade — sua senha continua a mesma.',
      logoUrl: `${this.appUrl}/email/logo-golev.png`,
    });
    await this.send(input.to, 'Redefinir sua senha — Go Lev', html);
  }

  async sendWelcome(input: {
    to: string;
    name: string;
    token: string;
  }): Promise<void> {
    const url = this.resetLink(input.token);
    if (process.env.NODE_ENV !== 'production') {
      this.logger.log(`🔗 Boas-vindas p/ ${input.to}: ${url}`);
    }
    const first = input.name?.split(' ')[0] ?? 'Olá';
    const html = layout({
      heading: `Bem-vindo(a) à Go Lev`,
      intro: `Oi, ${first}. Sua conta está pronta — a partir daqui a gente caminha junto, no seu ritmo. Crie sua senha para acessar o seu acompanhamento.`,
      cta: { label: 'Criar minha senha', url },
      note: 'Por segurança, este link expira em alguns dias. Se precisar de um novo, é só usar a opção "Esqueci a senha" na tela de entrada.',
      logoUrl: `${this.appUrl}/email/logo-golev.png`,
    });
    await this.send(input.to, 'Bem-vindo(a) à Go Lev — crie sua senha', html);
  }
}
