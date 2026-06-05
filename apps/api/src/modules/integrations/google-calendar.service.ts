import {
  Inject,
  Injectable,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { eq } from 'drizzle-orm';
import { DATABASE, type Database } from '../../database/database.module';
import { googleCalendarConnections } from '../../../drizzle/schema';
import { encryptSecret, decryptSecret } from '../../common/crypto.util';

interface TokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
}
interface UserInfo {
  email: string;
}
interface CalendarEvent {
  id: string;
}
interface EventListItem {
  status?: string;
  transparency?: string;
  start?: { dateTime?: string };
  end?: { dateTime?: string };
}
interface EventsListResponse {
  items?: EventListItem[];
}
export interface BusySlot {
  start: string;
  end: string;
}
export interface EventInput {
  summary: string;
  description?: string;
  startISO: string;
  endISO: string;
}

const OAUTH_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const USERINFO_URL = 'https://www.googleapis.com/oauth2/v3/userinfo';
const CALENDAR_URL = 'https://www.googleapis.com/calendar/v3/calendars/primary/events';
const SCOPES = 'https://www.googleapis.com/auth/calendar.events email';

@Injectable()
export class GoogleCalendarService {
  private readonly logger = new Logger(GoogleCalendarService.name);

  constructor(
    @Inject(DATABASE) private db: Database,
    private config: ConfigService,
    private jwt: JwtService,
  ) {}

  isConfigured(): boolean {
    return Boolean(
      this.config.get<string>('GOOGLE_CLIENT_ID') &&
        this.config.get<string>('GOOGLE_CLIENT_SECRET') &&
        this.config.get<string>('GOOGLE_OAUTH_REDIRECT_URI'),
    );
  }

  getAuthUrl(userId: string): string {
    if (!this.isConfigured()) {
      throw new BadRequestException('Integração Google não configurada');
    }
    const state = this.jwt.sign(
      { sub: userId, purpose: 'google_oauth' },
      { expiresIn: '10m' },
    );
    const params = new URLSearchParams({
      client_id: this.config.getOrThrow<string>('GOOGLE_CLIENT_ID'),
      redirect_uri: this.config.getOrThrow<string>('GOOGLE_OAUTH_REDIRECT_URI'),
      response_type: 'code',
      scope: SCOPES,
      access_type: 'offline',
      prompt: 'consent',
      state,
    });
    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }

  async handleCallback(code: string, state: string): Promise<void> {
    let userId: string;
    try {
      const payload = this.jwt.verify<{ sub: string; purpose: string }>(state);
      if (payload.purpose !== 'google_oauth') throw new Error('bad purpose');
      userId = payload.sub;
    } catch {
      throw new BadRequestException('State inválido ou expirado');
    }

    const tokenRes = await fetch(OAUTH_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: this.config.getOrThrow<string>('GOOGLE_CLIENT_ID'),
        client_secret: this.config.getOrThrow<string>('GOOGLE_CLIENT_SECRET'),
        redirect_uri: this.config.getOrThrow<string>('GOOGLE_OAUTH_REDIRECT_URI'),
        grant_type: 'authorization_code',
      }),
    });
    if (!tokenRes.ok) {
      this.logger.error(`Token exchange falhou: ${await tokenRes.text()}`);
      throw new BadRequestException('Falha ao conectar com o Google');
    }
    const tokens = (await tokenRes.json()) as TokenResponse;
    if (!tokens.refresh_token) {
      throw new BadRequestException(
        'Google não retornou refresh token. Remova o acesso em myaccount.google.com e tente novamente.',
      );
    }

    const infoRes = await fetch(USERINFO_URL, {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });
    const info = (await infoRes.json()) as UserInfo;

    const expiry = new Date(Date.now() + tokens.expires_in * 1000);
    const values = {
      userId,
      googleEmail: info.email,
      refreshTokenEnc: encryptSecret(tokens.refresh_token),
      accessTokenEnc: encryptSecret(tokens.access_token),
      tokenExpiry: expiry,
      updatedAt: new Date(),
    };

    await this.db
      .insert(googleCalendarConnections)
      .values(values)
      .onConflictDoUpdate({
        target: googleCalendarConnections.userId,
        set: {
          googleEmail: values.googleEmail,
          refreshTokenEnc: values.refreshTokenEnc,
          accessTokenEnc: values.accessTokenEnc,
          tokenExpiry: values.tokenExpiry,
          updatedAt: values.updatedAt,
        },
      });
  }

  async getStatus(userId: string): Promise<{ connected: boolean; email?: string }> {
    const conn = await this.db.query.googleCalendarConnections.findFirst({
      where: eq(googleCalendarConnections.userId, userId),
      columns: { googleEmail: true },
    });
    return conn ? { connected: true, email: conn.googleEmail } : { connected: false };
  }

  async disconnect(userId: string): Promise<void> {
    await this.db
      .delete(googleCalendarConnections)
      .where(eq(googleCalendarConnections.userId, userId));
  }

  /** Access token válido (refresca se expirado). Null se não conectado. */
  private async getAccessToken(userId: string): Promise<string | null> {
    const conn = await this.db.query.googleCalendarConnections.findFirst({
      where: eq(googleCalendarConnections.userId, userId),
    });
    if (!conn) return null;

    if (
      conn.accessTokenEnc &&
      conn.tokenExpiry &&
      conn.tokenExpiry.getTime() > Date.now() + 60_000
    ) {
      return decryptSecret(conn.accessTokenEnc);
    }

    const res = await fetch(OAUTH_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: this.config.getOrThrow<string>('GOOGLE_CLIENT_ID'),
        client_secret: this.config.getOrThrow<string>('GOOGLE_CLIENT_SECRET'),
        refresh_token: decryptSecret(conn.refreshTokenEnc),
        grant_type: 'refresh_token',
      }),
    });
    if (!res.ok) {
      this.logger.error(`Refresh falhou p/ user ${userId}: ${await res.text()}`);
      return null;
    }
    const t = (await res.json()) as TokenResponse;
    await this.db
      .update(googleCalendarConnections)
      .set({
        accessTokenEnc: encryptSecret(t.access_token),
        tokenExpiry: new Date(Date.now() + t.expires_in * 1000),
        updatedAt: new Date(),
      })
      .where(eq(googleCalendarConnections.userId, userId));
    return t.access_token;
  }

  /**
   * Horários ocupados da agenda do médico no intervalo. Lê via events.list
   * (escopo calendar.events que já temos) — a freeBusy.query exigiria escopo
   * adicional. Só início/fim saem daqui (títulos nunca são expostos).
   * `connected: false` se o médico não conectou o Google.
   */
  async freeBusy(
    userId: string,
    fromISO: string,
    toISO: string,
  ): Promise<{ connected: boolean; busy: BusySlot[] }> {
    const token = await this.getAccessToken(userId);
    if (!token) return { connected: false, busy: [] };
    try {
      const url = new URL(CALENDAR_URL);
      url.searchParams.set('timeMin', fromISO);
      url.searchParams.set('timeMax', toISO);
      url.searchParams.set('singleEvents', 'true');
      url.searchParams.set('orderBy', 'startTime');
      url.searchParams.set('maxResults', '250');

      const res = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        this.logger.error(`events.list falhou: ${await res.text()}`);
        return { connected: true, busy: [] };
      }
      const data = (await res.json()) as EventsListResponse;
      const busy = (data.items ?? [])
        .filter(
          (e) =>
            e.status !== 'cancelled' &&
            e.transparency !== 'transparent' && // 'transparent' = marcado como Livre
            e.start?.dateTime &&
            e.end?.dateTime,
        )
        .map((e) => ({ start: e.start!.dateTime!, end: e.end!.dateTime! }));
      return { connected: true, busy };
    } catch (e) {
      this.logger.error(`freeBusy erro: ${String(e)}`);
      return { connected: true, busy: [] };
    }
  }

  /** Cria evento na agenda do médico. Retorna eventId ou null (não conectado/erro). */
  async createEvent(userId: string, ev: EventInput): Promise<string | null> {
    const token = await this.getAccessToken(userId);
    if (!token) return null;
    try {
      const res = await fetch(CALENDAR_URL, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          summary: ev.summary,
          description: ev.description,
          start: { dateTime: ev.startISO },
          end: { dateTime: ev.endISO },
        }),
      });
      if (!res.ok) {
        this.logger.error(`createEvent falhou: ${await res.text()}`);
        return null;
      }
      return ((await res.json()) as CalendarEvent).id;
    } catch (e) {
      this.logger.error(`createEvent erro: ${String(e)}`);
      return null;
    }
  }

  async updateEvent(userId: string, eventId: string, ev: EventInput): Promise<void> {
    const token = await this.getAccessToken(userId);
    if (!token) return;
    try {
      await fetch(`${CALENDAR_URL}/${eventId}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          summary: ev.summary,
          description: ev.description,
          start: { dateTime: ev.startISO },
          end: { dateTime: ev.endISO },
        }),
      });
    } catch (e) {
      this.logger.error(`updateEvent erro: ${String(e)}`);
    }
  }

  async deleteEvent(userId: string, eventId: string): Promise<void> {
    const token = await this.getAccessToken(userId);
    if (!token) return;
    try {
      await fetch(`${CALENDAR_URL}/${eventId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (e) {
      this.logger.error(`deleteEvent erro: ${String(e)}`);
    }
  }
}
