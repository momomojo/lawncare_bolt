import React from 'react';
import { AuthLayout } from '../components/auth/AuthLayout';
import { SignupForm } from '../components/auth/SignupForm';

export function SignupPage() {
  return (
    <AuthLayout
      title="Create an account"
      subtitle="Start managing your lawn care services"
    >
      <SignupForm />
    </AuthLayout>
  );
}