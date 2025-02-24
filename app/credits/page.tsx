// Server Component
import { Suspense } from 'react';
import { GradientBackground } from '@/components/shared/gradient-background';
import CreditsPageClient from './page.client';

export default function CreditsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  return (
    <CreditsPageClient searchParams={searchParams} />
  );
}