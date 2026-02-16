"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ImageUploader } from "@/components/dashboard/image-uploader";
import { ThemePicker } from "@/components/dashboard/theme-picker";
import { useProfile } from "@/hooks/use-profile";
import type { ThemeKey } from "@/lib/types";

export default function SettingsPage() {
  const router = useRouter();
  const { profile, isLoading, updateProfile } = useProfile();

  const [isSaving, setIsSaving] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [theme, setTheme] = useState<ThemeKey>("clean");

  // Initialize form with profile data
  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name);
      setBio(profile.bio || "");
      setAvatarUrl(profile.avatar_url || "");
      setTheme(profile.theme);
    }
  }, [profile]);

  const handleSave = async () => {
    setIsSaving(true);

    const result = await updateProfile({
      display_name: displayName,
      bio,
      avatar_url: avatarUrl,
      theme,
    });

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Perfil actualizado");
    }

    setIsSaving(false);
  };

  const hasChanges =
    profile &&
    (displayName !== profile.display_name ||
      bio !== (profile.bio || "") ||
      avatarUrl !== (profile.avatar_url || "") ||
      theme !== profile.theme);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-[#FF6B35]" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Configuración</h1>
          <p className="text-muted-foreground">
            Personaliza tu perfil y mosaico
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Profile Card */}
        <Card>
          <CardHeader>
            <CardTitle>Perfil</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Avatar */}
            <div className="flex items-start gap-6">
              <ImageUploader
                value={avatarUrl}
                onChange={setAvatarUrl}
                type="avatar"
              />
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium">Foto de perfil</p>
                <p className="text-xs text-muted-foreground">
                  Se mostrará en la cabecera de tu mosaico
                </p>
              </div>
            </div>

            <Separator />

            {/* Display Name */}
            <div className="space-y-2">
              <Label htmlFor="displayName">Nombre visible</Label>
              <Input
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Tu nombre o marca"
                maxLength={50}
              />
              <p className="text-xs text-muted-foreground">
                {displayName.length}/50 caracteres
              </p>
            </div>

            {/* Bio */}
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Input
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Una breve descripción sobre ti"
                maxLength={160}
              />
              <p className="text-xs text-muted-foreground">
                {bio.length}/160 caracteres
              </p>
            </div>

            {/* Username (read-only) */}
            <div className="space-y-2">
              <Label>Username</Label>
              <div className="flex items-center gap-2">
                <Input
                  value={profile?.username || ""}
                  disabled
                  className="bg-gray-50 font-mono"
                />
                <span className="text-sm text-muted-foreground whitespace-nowrap">
                  mosai.link/{profile?.username}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                El username no se puede cambiar
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Theme Card */}
        <Card>
          <CardHeader>
            <CardTitle>Apariencia</CardTitle>
          </CardHeader>
          <CardContent>
            <ThemePicker value={theme} onChange={setTheme} />
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end gap-3">
          <Link href="/dashboard">
            <Button variant="outline">Cancelar</Button>
          </Link>
          <Button
            onClick={handleSave}
            disabled={isSaving || !hasChanges}
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              "Guardar cambios"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
