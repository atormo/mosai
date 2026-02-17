"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Profile, UpdateProfileInput } from "@/lib/types";

export function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = useMemo(() => createClient(), []);

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

      let { data, error: fetchError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      // If profile doesn't exist, create it (fallback for missing trigger)
      if (fetchError && fetchError.code === "PGRST116") {
        const meta = user.user_metadata || {};
        const { data: newProfile, error: insertError } = await supabase
          .from("profiles")
          .insert({
            id: user.id,
            username: meta.username || `user-${user.id.slice(0, 8)}`,
            display_name: meta.display_name || "Usuario",
            bio: "",
            avatar_url: "",
            theme: "clean",
          })
          .select()
          .single();

        if (insertError) {
          setError(insertError.message);
        } else {
          data = newProfile;
        }
      } else if (fetchError) {
        setError(fetchError.message);
      }

      if (data) {
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
