"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { env } from '@/config/env';

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    const isLoggedIn = localStorage.getItem(env.auth.tokenKey);
    if (isLoggedIn) {
      router.push('/dashboard');
    } else {
      router.push('/login');
    }
  }, [router]);

  return null;
}
