"use client";

import { useRouter } from 'next/navigation';

export default function Index() {
  
  const isLoggedIn = localStorage.getItem(env.auth.tokenKey)
  const router = useRouter();
  if (isLoggedIn) {
    return router.push('/dashboard')
  }

  return router.push('/login')

  return (<></>)

}
