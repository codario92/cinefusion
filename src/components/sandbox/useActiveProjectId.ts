"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export function useActiveProjectId() {
  const params = useParams();
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);

  useEffect(() => {
    const id = params?.id;
    if (typeof id === "string" && id.length > 0) {
      setActiveProjectId(id);
      return;
    }
    setActiveProjectId(null);
  }, [params]);

  return activeProjectId;
}
