'use client';
import { useState, useEffect } from 'react';
import { getSupabaseBrowser } from '../../lib/supabase/browser';

export default function ProfilePanel() {
  const supabase =  getSupabaseBrowser(); // ✅ this is now callable
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setProfile(null);
        setLoading(false);
        return;
      }
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      if (!error) setProfile(data);
      setLoading(false);
    }
    loadProfile();
  }, []);

  if (loading) return <p>Loading profile...</p>;
  if (!profile) return <p>No profile found.</p>;

  return (
    <section>
      <h2>{profile.full_name || 'Unnamed Creator'}</h2>
      <p>{profile.bio || 'No bio yet.'}</p>
    </section>
  );
}
