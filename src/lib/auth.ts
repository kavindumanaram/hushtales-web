// Central auth utility. All Cognito/Amplify access flows through here —
// components and hooks must never import 'aws-amplify/auth' directly.

import {
  signIn,
  signOut as amplifySignOut,
  signUp,
  confirmSignUp,
  resendSignUpCode,
  fetchAuthSession,
  getCurrentUser as amplifyGetCurrentUser,
  type AuthUser,
} from 'aws-amplify/auth';

/** Returns the Cognito ID token JWT, or null if not authenticated. */
export async function getIdToken(): Promise<string | null> {
  try {
    const session = await fetchAuthSession();
    return session.tokens?.idToken?.toString() ?? null;
  } catch {
    return null;
  }
}

export interface SignInResult {
  isSignedIn: boolean;
  // 'DONE' | 'CONFIRM_SIGN_UP' | 'CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED' | ...
  nextStep: string;
}

type AuthFlow = 'USER_SRP_AUTH' | 'USER_PASSWORD_AUTH';

async function attemptSignIn(
  email: string,
  password: string,
  authFlowType?: AuthFlow
): Promise<SignInResult> {
  const res = await signIn({
    username: email,
    password,
    options: authFlowType ? { authFlowType } : undefined,
  });
  return { isSignedIn: res.isSignedIn, nextStep: res.nextStep.signInStep };
}

/**
 * Native username/password sign-in (no Hosted UI redirect).
 * Tries the default SRP flow, then falls back to USER_PASSWORD_AUTH —
 * whichever the Cognito app client has enabled.
 */
export async function signInWithPassword(
  email: string,
  password: string
): Promise<SignInResult> {
  try {
    return await attemptSignIn(email, password);
  } catch (e) {
    // A lingering session blocks a fresh sign-in — clear it and retry once.
    if (e instanceof Error && e.name === 'UserAlreadyAuthenticatedException') {
      await amplifySignOut();
      return attemptSignIn(email, password);
    }
    // Wrong credentials / unconfirmed user — surface as-is, don't retry.
    if (
      e instanceof Error &&
      (e.name === 'NotAuthorizedException' ||
        e.name === 'UserNotConfirmedException' ||
        e.name === 'UserNotFoundException')
    ) {
      throw e;
    }
    // Otherwise the SRP flow is likely not enabled on the client — fall back.
    return attemptSignIn(email, password, 'USER_PASSWORD_AUTH');
  }
}

export async function registerWithPassword(email: string, password: string) {
  const res = await signUp({
    username: email,
    password,
    options: { userAttributes: { email } },
  });
  return { isComplete: res.isSignUpComplete, nextStep: res.nextStep.signUpStep };
}

export async function confirmRegistration(email: string, code: string) {
  const res = await confirmSignUp({ username: email, confirmationCode: code });
  return { isComplete: res.isSignUpComplete };
}

export async function resendConfirmationCode(email: string) {
  await resendSignUpCode({ username: email });
}

export async function signOut(): Promise<void> {
  await amplifySignOut();
}

/** Returns the current Cognito user, or null if not signed in. */
export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    return await amplifyGetCurrentUser();
  } catch {
    return null;
  }
}

export async function isAuthenticated(): Promise<boolean> {
  return (await getCurrentUser()) !== null;
}
