'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { redirect } from 'next/navigation';
import { GradientBackground } from '@/components/shared/gradient-background';
import CreditPackages from './credit-packages';
import { Suspense } from 'react';
import { useEffect, useState } from 'react';
import { BaseLayout } from '@/components/layouts/base-layout';

export default function CreditsPageClient({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient();

  useEffect(() => {
    async function getUser() {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) {
        redirect('/auth?mode=signin');
      }
      setUser(user);
      setLoading(false);
    }
    getUser();
  }, [supabase]);

  // Handle success/canceled states from Stripe
  const success = searchParams?.success === 'true';
  const canceled = searchParams?.canceled === 'true';

  if (loading) {
    return (
      <BaseLayout title="Credits">
        <main className="min-h-screen bg-black/95">
          <GradientBackground />
          <div className="relative z-10 flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-amber-500"></div>
          </div>
        </main>
      </BaseLayout>
    );
  }

  if (!user) {
    redirect('/auth?mode=signin');
  }

  return (
    <BaseLayout title="Credits">
      <main className="min-h-screen bg-black/95">
        <GradientBackground />
        <div className="relative z-10">
          <div className="max-w-5xl mx-auto pt-24 pb-16 px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-5xl font-thin text-amber-200 mb-6">
              Credit Packages
            </h1>
            <p className="text-xl text-amber-100/70 max-w-2xl mx-auto">
              Power up your meditation journey with credits. Choose the package that best fits your needs.
            </p>
            {success && (
              <div className="mt-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400">
                Thanks for your purchase! Your credits have been added to your account.
              </div>
            )}
            {canceled && (
              <div className="mt-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-400">
                Purchase canceled. No charges were made.
              </div>
            )}
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
            <Suspense fallback={
              <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-amber-500"></div>
              </div>
            }>
              <CreditPackages userId={user.id} />
            </Suspense>
          </div>
        </div>
      </main>
    </BaseLayout>
  );
}
