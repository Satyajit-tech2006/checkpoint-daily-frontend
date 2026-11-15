import React, { useEffect, useState } from 'react';
import UserAvatarMenu from './UserAvatarMenu';
import { getCurrentUserProfile, signOutOperative } from '../../lib/communityService';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import type { UserSessionProfile } from '../../types';

export default function LiveHeaderAuth() {
  const [user, setUser] = useState<UserSessionProfile | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured) return;

    let mounted = true;
    getCurrentUserProfile().then((profile) => {
      if (mounted) setUser(profile);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async () => {
      const updated = await getCurrentUserProfile();
      if (mounted) setUser(updated);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    await signOutOperative();
    setUser(null);
    window.location.href = '/';
  };

  return <UserAvatarMenu user={user} onSignOut={handleSignOut} />;
}