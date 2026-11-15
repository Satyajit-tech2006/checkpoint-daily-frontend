import React from 'react';
import AuthForm from './AuthForm';
import { signInOperative, signUpOperative } from '../../lib/communityService';

interface LiveAuthBridgeProps {
  mode: 'login' | 'register';
}

export default function LiveAuthBridge({ mode }: LiveAuthBridgeProps) {
  return (
    <AuthForm
      mode={mode}
      onSubmitAuth={async ({ mode: authMode, email, password, username }) => {
        if (authMode === 'register') {
          await signUpOperative(email, password, username || 'operative');
        } else {
          await signInOperative(email, password);
        }
      }}
    />
  );
}