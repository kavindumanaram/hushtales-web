import { Amplify } from 'aws-amplify';
import { cognitoUserPoolsTokenProvider } from 'aws-amplify/auth/cognito';
import { CookieStorage } from 'aws-amplify/utils';
import { COGNITO_CLIENT_ID, COGNITO_USER_POOL_ID } from './constants';

let configured = false;

// Idempotent — safe to call at module load and again on the client.
export function configureAmplify() {
  if (configured) return;
  configured = true;

  Amplify.configure({
    Auth: {
      Cognito: {
        userPoolId: COGNITO_USER_POOL_ID,
        userPoolClientId: COGNITO_CLIENT_ID,
      },
    },
  });

  // Store tokens in cookies (not localStorage) so middleware running in the
  // Edge runtime can detect an authenticated session.
  if (typeof window !== 'undefined') {
    cognitoUserPoolsTokenProvider.setKeyValueStorage(
      new CookieStorage({
        domain: window.location.hostname,
        secure: window.location.protocol === 'https:',
        sameSite: 'lax',
        expires: 365,
      })
    );
  }
}
