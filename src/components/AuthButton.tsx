"use client";

import { useState } from "react";
import { Button } from "@/components/ui";
import { LoginModal } from "./LoginModal";
import type { AuthHook } from "@/hooks/useAuth";

interface AuthButtonProps {
  auth: AuthHook;
}

export function AuthButton({ auth }: AuthButtonProps) {
  const [loginOpen, setLoginOpen] = useState(false);

  if (auth.isLoading) return null;

  if (auth.user) {
    return (
      <Button variant="ghost" color="subtle" size="sm" onClick={() => auth.signOut()}>
        Log out
      </Button>
    );
  }

  return (
    <>
      <Button variant="ghost" color="subtle" size="sm" onClick={() => setLoginOpen(true)}>
        Log in
      </Button>
      <LoginModal
        open={loginOpen}
        onClose={() => setLoginOpen(false)}
        onSignIn={auth.signIn}
      />
    </>
  );
}
