'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card, { CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { loginUser } from '@/lib/api/client';

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    
    try {
      const { token, user } = await loginUser(email, password);
      
      localStorage.setItem('auth_token', token);
      localStorage.setItem('user_role', user.role === 'admin' ? 'scientist' : user.role);
      
      setIsLoading(false);
      window.location.reload();
    } catch (err) {
      setIsLoading(false);
      setError(err instanceof Error ? err.message : 'Ошибка входа');
    }
  };

  return (
    <div className="min-h-screen bg-[#f0fdf4] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-white">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="24" 
                height="24" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
              </svg>
            </div>
            <span className="text-2xl font-bold text-foreground">
              Общее<span className="text-primary"> дело</span>
            </span>
          </Link>
        </div>
        
        <Card variant="elevated" className="w-full">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">С возвращением!</CardTitle>
            <CardDescription>
              Войдите в свой аккаунт для продолжения работы
            </CardDescription>
          </CardHeader>
          
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
                  {error}
                </div>
              )}
              
              <Input
                label="Email"
                name="email"
                type="email"
                placeholder="example@mail.ru"
                required
              />
              
              <Input
                label="Пароль"
                name="password"
                type="password"
                placeholder="Введите пароль"
                required
              />
              
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    name="remember"
                    className="rounded border-border text-primary focus:ring-primary"
                  />
                  <span className="text-sm text-muted-foreground">Запомнить меня</span>
                </label>
                <Link 
                  href="/auth/forgot-password" 
                  className="text-sm text-primary hover:underline"
                >
                  Забыли пароль?
                </Link>
              </div>
            </CardContent>
            
            <CardFooter className="flex-col gap-4">
              <Button type="submit" className="w-full" isLoading={isLoading}>
                Войти
              </Button>
            </CardFooter>
          </form>
        </Card>
        
        {/* Демо-аккаунты */}
        <Card variant="outlined" className="mt-6">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Демо-аккаунты</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <div className="flex justify-between">
              <span>Учёный:</span>
              <code className="bg-muted px-2 py-0.5 rounded">scientist@nauka.ru</code>
            </div>
            <div className="flex justify-between">
              <span>Волонтёр:</span>
              <code className="bg-muted px-2 py-0.5 rounded">volunteer@nauka.ru</code>
            </div>
            <div className="text-xs text-muted-foreground mt-2">
              Пароль для всех: demo123
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
