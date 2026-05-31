"use client";

import React from "react";
import type { User } from "@supabase/supabase-js";
import dynamic from "next/dynamic";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const StudioOS = dynamic(() => import("@/components/StudioOS"), { ssr: false }) as React.ComponentType<any>;

export default function StudioClient({ user }: { user: User }) {
  return <StudioOS user={user} />;
}
