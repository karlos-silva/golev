import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { eq } from 'drizzle-orm';
import * as argon2 from 'argon2';
import * as schema from './schema';

config({ path: '../../.env' });

const DEMO_PASSWORD = 'changeme123';
const daysAgo = (d: number) => new Date(Date.now() - d * 86_400_000);
const daysFromNow = (d: number, hour = 10) => {
  const date = new Date(Date.now() + d * 86_400_000);
  date.setHours(hour, 0, 0, 0);
  return date;
};

type DB = ReturnType<typeof drizzle<typeof schema>>;

async function upsertUser(
  db: DB,
  input: {
    email: string;
    name: string;
    role: string;
    mustResetPassword?: boolean;
  },
): Promise<{ id: string; created: boolean }> {
  const existing = await db.query.users.findFirst({
    where: eq(schema.users.email, input.email),
    columns: { id: true },
  });
  if (existing) return { id: existing.id, created: false };

  const passwordHash = await argon2.hash(DEMO_PASSWORD);
  const [u] = await db
    .insert(schema.users)
    .values({
      email: input.email,
      name: input.name,
      role: input.role,
      passwordHash,
      mustResetPassword: input.mustResetPassword ?? false,
    })
    .returning({ id: schema.users.id });
  return { id: u!.id, created: true };
}

async function seed() {
  const client = postgres(process.env.DATABASE_URL!);
  const db = drizzle({ client, schema });

  console.log('Seeding database...');

  // Conta genérica legada (mantida).
  await upsertUser(db, {
    email: 'demo@golev.com.br',
    name: 'Demo Go Lev',
    role: 'member',
  });

  // Equipe.
  const admin = await upsertUser(db, {
    email: 'admin@golev.com.br',
    name: 'Equipe Go Lev',
    role: 'admin',
  });
  const doctor = await upsertUser(db, {
    email: 'dra.helena@golev.com.br',
    name: 'Dra. Helena Prado',
    role: 'doctor',
  });
  console.log(`Equipe: admin=${admin.id} doctor=${doctor.id}`);

  // Paciente de demonstração com jornada completa (idempotente: só cria se não existir).
  const pacienteEmail = 'paciente@golev.com.br';
  const existingPaciente = await db.query.users.findFirst({
    where: eq(schema.users.email, pacienteEmail),
    columns: { id: true },
  });

  if (existingPaciente) {
    console.log('Paciente demo já existe — pulando jornada.');
  } else {
    const passwordHash = await argon2.hash(DEMO_PASSWORD);
    const [pacienteUser] = await db
      .insert(schema.users)
      .values({
        email: pacienteEmail,
        name: 'Ana Martins',
        role: 'patient',
        passwordHash,
        mustResetPassword: false,
      })
      .returning({ id: schema.users.id });

    // Conta de 1º acesso (senha temporária) — paciente completo p/ testar o
    // fluxo ponta a ponta: login → definir senha → área do cliente.
    const [marcosUser] = await db
      .insert(schema.users)
      .values({
        email: 'primeiro-acesso@golev.com.br',
        name: 'Marcos Lima',
        role: 'patient',
        passwordHash,
        mustResetPassword: true,
      })
      .returning({ id: schema.users.id });

    const [marcosAnamnese] = await db
      .insert(schema.anamneseSubmissions)
      .values({
        userId: marcosUser!.id,
        objetivos: ['saude_geral'],
        sexo: 'masculino',
        idade: 45,
        birthDate: '1981-01-01',
        alturaCm: 178,
        pesoKg: '104.0',
        tentativas: 'muitas',
        comorbidades: ['hipertensao'],
        contraindicacoes: ['nenhuma'],
        gravidaOuAmamentando: false,
        tratamentoPrevio: 'nao',
        medicacoes: [],
        imc: '32.8',
        eligible: true,
        reasons: ['imc_suficiente'],
        nome: 'Marcos Lima',
        email: 'primeiro-acesso@golev.com.br',
        whatsapp: '11988887777',
        consentAt: daysAgo(3),
        consentText: 'Consentimento de demonstração (seed).',
        leadStatus: 'convertido',
      })
      .returning({ id: schema.anamneseSubmissions.id });

    const [marcosPatient] = await db
      .insert(schema.patients)
      .values({
        userId: marcosUser!.id,
        anamneseId: marcosAnamnese!.id,
        doctorId: doctor.id,
        status: 'active',
        startedAt: daysAgo(2),
        sex: 'masculino',
        birthDate: '1981-01-01',
        heightCm: 178,
        phone: '11988887777',
        goals: ['saude_geral'],
        comorbidities: ['hipertensao'],
        contraindications: ['nenhuma'],
      })
      .returning({ id: schema.patients.id });

    await db.insert(schema.weightLogs).values({
      patientId: marcosPatient!.id,
      weightKg: '104.0',
      measuredAt: daysAgo(3),
      source: 'anamnese',
    });

    const [anamnese] = await db
      .insert(schema.anamneseSubmissions)
      .values({
        userId: pacienteUser!.id,
        objetivos: ['saude_geral', 'energia'],
        sexo: 'feminino',
        idade: 38,
        birthDate: '1988-01-01',
        alturaCm: 168,
        pesoKg: '92.0',
        tentativas: 'algumas',
        comorbidades: ['pre_diabetes'],
        contraindicacoes: ['nenhuma'],
        gravidaOuAmamentando: false,
        tratamentoPrevio: 'nao',
        medicacoes: [],
        imc: '32.6',
        eligible: true,
        reasons: ['imc_suficiente'],
        nome: 'Ana Martins',
        email: pacienteEmail,
        whatsapp: '11999990000',
        consentAt: daysAgo(72),
        consentText: 'Consentimento de demonstração (seed).',
        leadStatus: 'convertido',
      })
      .returning({ id: schema.anamneseSubmissions.id });

    const [patient] = await db
      .insert(schema.patients)
      .values({
        userId: pacienteUser!.id,
        anamneseId: anamnese!.id,
        doctorId: doctor.id,
        status: 'active',
        startedAt: daysAgo(70),
        sex: 'feminino',
        birthDate: '1988-01-01',
        heightCm: 168,
        phone: '11999990000',
        goals: ['saude_geral', 'energia'],
        comorbidities: ['pre_diabetes'],
        contraindications: ['nenhuma'],
      })
      .returning({ id: schema.patients.id });

    await db.insert(schema.weightLogs).values([
      { patientId: patient!.id, weightKg: '92.0', measuredAt: daysAgo(72), source: 'anamnese' },
      { patientId: patient!.id, weightKg: '90.4', measuredAt: daysAgo(56), source: 'portal' },
      { patientId: patient!.id, weightKg: '89.1', measuredAt: daysAgo(42), source: 'portal' },
      { patientId: patient!.id, weightKg: '88.0', measuredAt: daysAgo(28), source: 'patient_app' },
      { patientId: patient!.id, weightKg: '86.7', measuredAt: daysAgo(14), source: 'patient_app' },
      { patientId: patient!.id, weightKg: '85.9', measuredAt: daysAgo(3), source: 'patient_app' },
    ]);

    await db.insert(schema.appointments).values([
      {
        patientId: patient!.id,
        doctorId: doctor.id,
        scheduledAt: daysAgo(68),
        durationMin: 40,
        type: 'primeira',
        status: 'realizada',
      },
      {
        patientId: patient!.id,
        doctorId: doctor.id,
        scheduledAt: daysFromNow(5, 10),
        durationMin: 30,
        type: 'retorno',
        status: 'agendada',
      },
    ]);

    await db.insert(schema.dietPlans).values({
      patientId: patient!.id,
      doctorId: doctor.id,
      title: 'Plano alimentar — primeiras semanas',
      content: [
        '## A gente caminha junto, no seu ritmo',
        '',
        'Este é um ponto de partida flexível — não uma regra rígida. O importante é a constância, não a perfeição.',
        '',
        '### Café da manhã',
        '- Uma fonte de proteína (ovos, iogurte natural ou queijo branco)',
        '- Uma fruta',
        '- Café ou chá sem açúcar',
        '',
        '### Almoço',
        '- Metade do prato com vegetais e folhas',
        '- Uma porção de proteína (palma da mão)',
        '- Um carboidrato integral (arroz, batata, mandioca)',
        '',
        '### Jantar',
        '- Leve e parecido com o almoço, em porção menor',
        '',
        '### Hidratação',
        '- Água ao longo do dia. Se sentir enjoo, prefira goles pequenos e frequentes.',
        '',
        '> Qualquer dúvida ou desconforto, fale com a gente. Recomeçar quando precisar também faz parte.',
      ].join('\n'),
      status: 'active',
    });

    console.log('Paciente demo "Ana Martins" criado com jornada completa.');
  }

  console.log('Seed completed.');
  await client.end();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
