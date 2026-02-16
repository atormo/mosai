import { redirect } from "next/navigation";

export default function Home() {
  // Middleware handles redirect based on auth state
  // This is a fallback
  redirect("/login");
}
