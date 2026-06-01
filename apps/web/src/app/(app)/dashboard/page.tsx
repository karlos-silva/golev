'use client';

import { useAuth } from '@/stores/auth';
import { useLogout } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, Users, CreditCard, Settings, LogOut } from 'lucide-react';

export default function DashboardPage() {
  const { accessToken } = useAuth();
  const logout = useLogout();

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Visão geral do seu produto SaaS.
          </p>
        </div>
        <Button variant="outline" onClick={() => logout.mutate()} disabled={logout.isPending}>
          <LogOut className="mr-2 h-4 w-4" />
          Sair
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Atividade recente</CardTitle>
            <CardDescription>
              Placeholder para gráfico de atividade.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex h-48 items-center justify-center rounded-lg border border-dashed">
              <p className="text-sm text-muted-foreground">
                Gráfico de atividade aqui
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Membros do time</CardTitle>
            <CardDescription>
              Placeholder para lista de membros.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex h-48 items-center justify-center rounded-lg border border-dashed">
              <p className="text-sm text-muted-foreground">
                Lista de membros aqui
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {!accessToken && (
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-900/20">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            Você não está autenticado. <a href="/login" className="font-medium underline">Faça login</a> para acessar dados reais.
          </p>
        </div>
      )}
    </div>
  );
}

const stats = [
  {
    title: 'Total de usuários',
    value: '0',
    description: 'Usuários ativos na plataforma',
    icon: Users,
  },
  {
    title: 'Receita (MRR)',
    value: 'R$ 0',
    description: 'Monthly Recurring Revenue',
    icon: CreditCard,
  },
  {
    title: 'Conversão',
    value: '0%',
    description: 'Trial → Paid',
    icon: BarChart3,
  },
  {
    title: 'Churn',
    value: '0%',
    description: 'Taxa de cancelamento',
    icon: Settings,
  },
];
