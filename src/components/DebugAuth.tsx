"use client";

import { useEffect, useState } from "react";
import { getSupabaseBrowser } from "@/lib/supabase/client";

export default function DebugAuth() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const supabase = getSupabaseBrowser();
    supabase.auth.getSession().then(({ data, error }) => {
      setData({
        session: data?.session ?? null,
        error: error?.message ?? null,
      });
    });
  }, []);

  return (
    <pre style={{ whiteSpace: "pre-wrap" }}>
      {JSON.stringify(data, null, 2)}
    </pre>
  );
}
