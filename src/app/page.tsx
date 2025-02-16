'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Redirige al login o donde necesites
    router.push('/login');
  }, [router]);

  return <div>Redirigiendo...</div>;
}