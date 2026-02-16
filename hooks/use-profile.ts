"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Profile, UpdateProfileInput } from "@/lib/types";

export function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  const fetchProfile = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError("No user found");
        setIsLoading(false);
        return;
      }

      const { data, error: fetchError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (fetchError) {
        setError(fetchError.message);
      } else {
        setProfile(data);
      }
    } catch (err) {
      setError("Failed to fetch profile");
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  const updateProfile = useCallback(
    async (updates: UpdateProfileInput) => {
      if (!profile) return { error: "No profile found" };

      const { data, error: updateError } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", profile.id)
        .select()
        .single();

      if (updateError) {
        return { error: updateError.message };
      }

      setProfile(data);
      return { data };
    },
    [profile, supabase]
  );

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return {
    profile,
    isLoading,
    error,
    refetch: fetchProfile,
    updateProfile,
  };
}
