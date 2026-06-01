import Link from 'next/link';
import Image from 'next/image';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/50 px-4">
      <Link href="/" className="mb-8 transition-opacity hover:opacity-80">
        <Image
          src="/logo.svg"
          alt="Trianox"
          width={56}
          height={56}
          className=""
        />
      </Link>
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
