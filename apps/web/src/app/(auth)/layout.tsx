import Link from 'next/link';
import { Logo } from '@/components/app/logo';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/50 px-4">
      <Link href="/" className="mb-8 transition-opacity hover:opacity-80">
        <Logo size="lg" />
      </Link>
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
