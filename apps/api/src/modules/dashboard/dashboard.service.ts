import { Inject, Injectable } from '@nestjs/common';
import { and, count, desc, eq, gte } from 'drizzle-orm';
import { DATABASE, type Database } from '../../database/database.module';
import { anamneseSubmissions, patients } from '../../../drizzle/schema';

@Injectable()
export class DashboardService {
  constructor(@Inject(DATABASE) private db: Database) {}

  async stats() {
    const now = new Date();
    const monthStart = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1),
    );

    const [
      activeClientsRow,
      totalClientsRow,
      anamnesesMonthRow,
      eligibleTotalRow,
      convertedTotalRow,
      awaitingContactRow,
      recentAnamneses,
      awaitingContactList,
    ] = await Promise.all([
      this.db.select({ value: count() }).from(patients).where(eq(patients.status, 'active')),
      this.db.select({ value: count() }).from(patients),
      this.db.select({ value: count() }).from(anamneseSubmissions).where(gte(anamneseSubmissions.createdAt, monthStart)),
      this.db.select({ value: count() }).from(anamneseSubmissions).where(eq(anamneseSubmissions.eligible, true)),
      this.db.select({ value: count() }).from(anamneseSubmissions).where(eq(anamneseSubmissions.leadStatus, 'convertido')),
      this.db.select({ value: count() }).from(anamneseSubmissions).where(and(eq(anamneseSubmissions.eligible, true), eq(anamneseSubmissions.leadStatus, 'novo'))),
      this.db.query.anamneseSubmissions.findMany({
        orderBy: [desc(anamneseSubmissions.createdAt)],
        limit: 5,
        columns: { id: true, nome: true, imc: true, eligible: true, leadStatus: true, createdAt: true },
      }),
      this.db.query.anamneseSubmissions.findMany({
        where: and(eq(anamneseSubmissions.eligible, true), eq(anamneseSubmissions.leadStatus, 'novo')),
        orderBy: [desc(anamneseSubmissions.createdAt)],
        limit: 5,
        columns: { id: true, nome: true, imc: true, whatsapp: true, createdAt: true },
      }),
    ]);

    const activeClients = activeClientsRow[0]?.value ?? 0;
    const totalClients = totalClientsRow[0]?.value ?? 0;
    const eligibleTotal = eligibleTotalRow[0]?.value ?? 0;
    const convertedTotal = convertedTotalRow[0]?.value ?? 0;

    return {
      activeClients,
      totalClients,
      anamnesesThisMonth: anamnesesMonthRow[0]?.value ?? 0,
      awaitingContact: awaitingContactRow[0]?.value ?? 0,
      // Conversão: leads elegíveis que viraram paciente.
      conversionRate: eligibleTotal > 0 ? Math.round((convertedTotal / eligibleTotal) * 100) : 0,
      // Retenção: pacientes ativos / total de pacientes.
      retentionRate: totalClients > 0 ? Math.round((activeClients / totalClients) * 100) : 0,
      recentAnamneses,
      awaitingContactList,
    };
  }
}
