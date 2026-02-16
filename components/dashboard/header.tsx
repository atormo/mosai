"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Settings, LogOut, Copy, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/lib/types";

interface DashboardHeaderProps {
  profile: Profile | null;
}

export function DashboardHeader({ profile }: DashboardHeaderProps) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);

  const handleCopyLink = async () => {
    if (!profile) return;

    const url = `${window.location.origin}/${profile.username}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success("Link copiado al portapapeles");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const initials = profile?.display_name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "??";

  return (
    <header className="border-b bg-white">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="text-xl font-bold text-[#FF6B35]">🟧 MOSAI</span>
        </Link>

        {/* Center - Copy Link */}
        {profile && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyLink}
            className="hidden sm:flex items-center gap-2 font-mono text-sm"
          >
            mosai.link/{profile.username}
            {copied ? (
              <Check className="h-4 w-4 text-emerald-500" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        )}

        {/* Right - User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
              <Avatar className="h-10 w-10">
                <AvatarImage src={profile?.avatar_url} alt={profile?.display_name} />
                <AvatarFallback className="bg-[#FF6B35] text-white">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="px-2 py-1.5">
              <p className="text-sm font-medium">{profile?.display_name}</p>
              <p className="text-xs text-muted-foreground">@{profile?.username}</p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/dashboard/settings" className="cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                Configuración
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handleCopyLink}
              className="cursor-pointer sm:hidden"
            >
              <Copy className="mr-2 h-4 w-4" />
              Copiar link
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              className="cursor-pointer text-red-600"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Cerrar sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
