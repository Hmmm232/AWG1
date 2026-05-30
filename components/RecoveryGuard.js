import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/lib/AuthContext';

// A session created from a password-reset link is a back-door login: it
// authenticates the user before any new password has been set. We only allow
// it to exist on /update-password (where it's needed to call updateUser).
// If such a session surfaces on any other route — because the user navigated
// away or reloaded without completing the reset — sign it out immediately.
export default function RecoveryGuard() {
  const { isRecovery, signOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isRecovery) return;
    if (router.pathname === '/update-password') return;

    signOut().finally(() => {
      router.replace('/signin?reset=incomplete');
    });
  }, [isRecovery, router.pathname]);

  return null;
}
