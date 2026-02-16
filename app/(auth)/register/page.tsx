import type { Metadata } from "next";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = {
  title: "Crear cuenta",
  description: "Crea tu MOSAI y empieza a compartir tu contenido",
};

export default function RegisterPage() {
  return <RegisterForm />;
}
