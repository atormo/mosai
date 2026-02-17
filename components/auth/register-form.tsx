"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Loader2, Check, X } from "lucide-react";
import { useDebouncedCallback } from "use-debounce";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { registerSchema, usernameSchema } from "@/lib/validations";
import { cn } from "@/lib/utils";

export function RegisterForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");

  // Username validation state
  const [usernameStatus, setUsernameStatus] = useState<
    "idle" | "checking" | "available" | "taken" | "invalid"
  >("idle");
  const [usernameError, setUsernameError] = useState("");

  const checkUsername = useDebouncedCallback(async (value: string) => {
    if (!value || value.length < 3) {
      setUsernameStatus("idle");
      return;
    }

    // Validate format first
    const result = usernameSchema.safeParse(value);
    if (!result.success) {
      setUsernameStatus("invalid");
      setUsernameError(result.error.issues[0].message);
      return;
    }

    setUsernameStatus("checking");

    try {
      const supabase = createClient();
      const { data } = await supabase
        .from("profiles")
        .select("username")
        .eq("username", value)
        .single();

      if (data) {
        setUsernameStatus("taken");
        setUsernameError("Este username ya está en uso");
      } else {
        setUsernameStatus("available");
        setUsernameError("");
      }
    } catch {
      // No user found = available
      setUsernameStatus("available");
      setUsernameError("");
    }
  }, 300);

  const handleUsernameChange = (value: string) => {
    const normalized = value.toLowerCase().replace(/[^a-z0-9-]/g, "");
    setUsername(normalized);
    if (normalized.length >= 3) {
      checkUsername(normalized);
    } else {
      setUsernameStatus("idle");
    }
  };

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate input
      const result = registerSchema.safeParse({
        email,
        password,
        username,
        display_name: displayName,
      });

      if (!result.success) {
        toast.error(result.error.issues[0].message);
        setIsLoading(false);
        return;
      }

      if (usernameStatus !== "available") {
        toast.error("El username no está disponible");
        setIsLoading(false);
        return;
      }

      const supabase = createClient();

      // Sign up user - pass username & display_name in metadata
      // so the database trigger can create the profile automatically
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
            display_name: displayName,
          },
        },
      });

      if (authError) {
        toast.error(authError.message);
        setIsLoading(false);
        return;
      }

      // If email confirmation is required, user won't have a session yet
      if (authData.user && !authData.session) {
        toast.success(
          "¡Cuenta creada! Revisa tu email para confirmar tu cuenta."
        );
        router.push("/login");
        return;
      }

      toast.success("¡Cuenta creada! Bienvenido a MOSAI");
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
              placeholder="Mínimo 6 caracteres"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <div className="relative">
              <Input
                id="username"
                type="text"
                placeholder="Tu nombre de usuario"
                value={username}
                onChange={(e) => handleUsernameChange(e.target.value)}
                disabled={isLoading}
                className={cn(
                  "pr-10",
                  usernameStatus === "available" && "border-emerald-500",
                  (usernameStatus === "taken" || usernameStatus === "invalid") &&
                    "border-red-500"
                )}
                required
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {usernameStatus === "checking" && (
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                )}
                {usernameStatus === "available" && (
                  <Check className="h-4 w-4 text-emerald-500" />
                )}
                {(usernameStatus === "taken" || usernameStatus === "invalid") && (
                  <X className="h-4 w-4 text-red-500" />
                )}
              </div>
            </div>
            {usernameStatus === "available" && (
              <p className="text-xs text-emerald-600">
                ✓ mosai.link/{username} está disponible
              </p>
            )}
            {(usernameStatus === "taken" || usernameStatus === "invalid") && (
              <p className="text-xs text-red-500">{usernameError}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="displayName">Nombre visible</Label>
            <Input
              id="displayName"
              type="text"
              placeholder="Tu nombre o marca"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-4 pt-6">
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || usernameStatus !== "available"}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creando cuenta...
              </>
            ) : (
              "Crear mi MOSAI"
            )}
          </Button>

          <p className="text-sm text-center text-muted-foreground">
            ¿Ya tienes cuenta?{" "}
            <Link
              href="/login"
              className="text-primary font-medium hover:underline"
            >
              Entrar
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
