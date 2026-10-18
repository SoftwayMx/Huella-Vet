"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function LogoutButton() {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={async () => {
        await createClient().auth.signOut();
        router.push("/login");
        router.refresh();
      }}
      className="text-sm font-medium text-primary underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
    >
      Cerrar sesión
    </button>
  );
}
