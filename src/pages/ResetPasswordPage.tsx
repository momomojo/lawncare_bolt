import React from 'react';
import { AuthLayout } from '../components/auth/AuthLayout';
import { ResetPasswordForm } from '../components/auth/ResetPasswordForm';

export function ResetPasswordPage() {
  return (
    <AuthLayout
      title="Reset your password"
      subtitle="We'll send you instructions to reset your password"
    >
      <ResetPasswordForm />
    </AuthLayout>
  );
}