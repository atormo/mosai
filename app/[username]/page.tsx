import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cn } from "@/lib/utils";
import { themes } from "@/lib/themes";
import { createClient } from "@/lib/supabase/server";
import { MosaiHeader } from "@/components/public/mosai-header";
import { MosaiGrid } from "@/components/public/mosai-grid";
import { MosaiFooter } from "@/components/public/mosai-footer";
import type { Profile, Piece } from "@/lib/types";

interface PageProps {
  params: Promise<{ username: string }>;
}

async function getProfileAndPieces(username: string) {
  const supabase = await createClient();

  // Get profile
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", username)
    .single();

  if (profileError || !profile) {
    return null;
  }

  // Get active pieces
  const { data: pieces, error: piecesError } = await supabase
    .from("pieces")
    .select("*")
    .eq("user_id", profile.id)
    .eq("is_active", true)
    .order("position", { ascending: true });

  return {
    profile: profile as Profile,
    pieces: (pieces || []) as Piece[],
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { username } = await params;
  const data = await getProfileAndPieces(username);

  if (!data) {
    return {
      title: "Usuario no encontrado",
    };
  }

  const { profile } = data;

  return {
    title: `${profile.display_name} (@${profile.username})`,
    description: profile.bio || `Mira el mosaico de ${profile.display_name}`,
    openGraph: {
      title: `${profile.display_name} | MOSAI`,
      description: profile.bio || `Mira el mosaico de ${profile.display_name}`,
      type: "profile",
      images: profile.avatar_url
        ? [{ url: profile.avatar_url, width: 200, height: 200 }]
        : [],
    },
    twitter: {
      card: "summary",
      title: `${profile.display_name} | MOSAI`,
      description: profile.bio || `Mira el mosaico de ${profile.display_name}`,
    },
  };
}

export default async function PublicMosaiPage({ params }: PageProps) {
  const { username } = await params;
  const data = await getProfileAndPieces(username);

  if (!data) {
    notFound();
  }

  const { profile, pieces } = data;
  const theme = themes[profile.theme];

  return (
    <main
      className={cn(
        "min-h-screen flex flex-col",
        theme.container
      )}
    >
      <div className="flex-1 w-full max-w-md mx-auto">
        <MosaiHeader profile={profile} />
        <MosaiGrid pieces={pieces} themeKey={profile.theme} />
        <MosaiFooter themeKey={profile.theme} />
      </div>
    </main>
  );
}
