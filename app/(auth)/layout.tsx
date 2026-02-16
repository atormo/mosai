export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAFAF8] px-4">
      {/* Logo */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-[#FF6B35]">🟧 MOSAI</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Tu link in bio, pero bonito
        </p>
      </div>

      {/* Auth Card */}
      <div className="w-full max-w-sm">{children}</div>

      {/* Footer */}
      <p className="mt-8 text-xs text-muted-foreground">
        © {new Date().getFullYear()} MOSAI. Todos los derechos reservados.
      </p>
    </div>
  );
}
