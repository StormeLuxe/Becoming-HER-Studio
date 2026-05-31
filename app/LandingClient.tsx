"use client";

import { useRouter } from "next/navigation";
import StormeLanding from "@/components/StormeLanding";

export default function LandingClient() {
  const router = useRouter();

  function handleEnter(plan = "creator") {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("selected_plan", plan);
    }
    router.push(`/signup?plan=${encodeURIComponent(plan)}`);
  }

  return <StormeLanding onEnter={handleEnter} />;
}
