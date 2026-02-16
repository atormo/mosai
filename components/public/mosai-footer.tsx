import Link from "next/link";
import { cn } from "@/lib/utils";
import { themes } from "@/lib/themes";
import type { ThemeKey } from "@/lib/types";

interface MosaiFooterProps {
  themeKey: ThemeKey;
}

export function MosaiFooter({ themeKey }: MosaiFooterProps) {
  const theme = themes[themeKey];

  return (
    <footer className="py-8 text-center">
      <Link
        href="/"
        className={cn(
          "inline-flex items-center gap-1 text-sm transition-opacity hover:opacity-80",
          theme.text
        )}
      >
        Hecho con <span className="text-[#FF6B35] font-medium">MOSAI</span> 🟧
      </Link>
    </footer>
  );
}
