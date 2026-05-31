"use client";

import { useRouter } from "next/navigation";
import StormeLanding from "@/components/StormeLanding";

export default function LandingClient() {
  const router = useRouter();
  return <StormeLanding onEnter={() => router.push("/login")} />;
}
