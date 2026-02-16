import Image from "next/image";
import { cn } from "@/lib/utils";
import { themes } from "@/lib/themes";
import type { Profile } from "@/lib/types";

interface MosaiHeaderProps {
  profile: Profile;
}

export function MosaiHeader({ profile }: MosaiHeaderProps) {
  const theme = themes[profile.theme];

  return (
    <header className="pt-12 pb-6 px-4 text-center">
      {/* Avatar */}
      {profile.avatar_url ? (
        <div className="relative w-20 h-20 mx-auto mb-4 rounded-full overflow-hidden ring-2 ring-white/20">
          <Image
            src={profile.avatar_url}
            alt={profile.display_name}
            fill
            className="object-cover"
            priority
          />
        </div>
      ) : (
        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-[#FF6B35] flex items-center justify-center text-white text-2xl font-bold ring-2 ring-white/20">
          {profile.display_name[0]?.toUpperCase()}
        </div>
      )}

      {/* Name */}
      <h1 className={cn("text-xl font-semibold", theme.header)}>
        {profile.display_name}
      </h1>

      {/* Bio */}
      {profile.bio && (
        <p className={cn("text-sm mt-2 max-w-xs mx-auto", theme.text)}>
          {profile.bio}
        </p>
      )}
    </header>
  );
}
