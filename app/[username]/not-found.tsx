import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-[#FAFAF8] px-4">
      <div className="text-center">
        <div className="text-6xl mb-4">🟧</div>
        <h1 className="text-2xl font-bold mb-2">Usuario no encontrado</h1>
        <p className="text-muted-foreground mb-6">
          Este mosaico no existe o ha sido eliminado.
        </p>
        <Link href="/register">
          <Button>Crear tu propio MOSAI</Button>
        </Link>
      </div>
    </main>
  );
}
