"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { loginSchema } from "@/lib/validations";

export function LoginForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate input
      const result = loginSchema.safeParse({ email, password });
      if (!result.success) {
        toast.error(result.error.errors[0].message);
        setIsLoading(false);
        return;
      }

      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast.error("Email o contraseña incorrectos");
        setIsLoading(false);
        return;
      }

      toast.success("¡Bienvenido de vuelta!");
      router.push("/dashboard");
      router.refresh();
    } catch {
      toast.error("Algo salió mal. Inténtalo de nuevo.");
      setIsLoading(false);
    }
  }

  return (
    <Card>
      <form onSubmit={onSubmit}>
        <CardContent className="pt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-4">
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Entrando...
              </>
            ) : (
              "Entrar"
            )}
          </Button>

          <p className="text-sm text-center text-muted-foreground">
            ¿No tienes cuenta?{" "}
            <Link
              href="/register"
              className="text-primary font-medium hover:underline"
            >
              Crear cuenta
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
