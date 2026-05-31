import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import StudioClient from "./StudioClient";

export default async function StudioPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return <StudioClient user={user} />;
}
