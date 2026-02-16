"use client";

import { useProfile } from "@/hooks/use-profile";
import { DashboardHeader } from "@/components/dashboard/header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { profile, isLoading } = useProfile();

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <DashboardHeader profile={profile} />
      <main className="container mx-auto px-4 py-6">{children}</main>
    </div>
  );
}
