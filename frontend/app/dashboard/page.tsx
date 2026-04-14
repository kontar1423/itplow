'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '@/lib/api/client';

export default function DashboardPage() {
  const router = useRouter();
  
  useEffect(() => {
    const resolveDashboard = async () => {
      try {
        const user = await getCurrentUser();
        if (user.role === 'admin') {
          router.replace('/dashboard/scientist');
          return;
        }
        router.replace('/dashboard/volunteer');
      } catch {
        const savedRole = localStorage.getItem('user_role');
        if (savedRole === 'scientist') {
          router.replace('/dashboard/scientist');
        } else if (savedRole === 'volunteer') {
          router.replace('/dashboard/volunteer');
        } else {
          router.replace('/auth/login');
        }
      }
    };

    void resolveDashboard();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Загрузка...</p>
      </div>
    </div>
  );
}
