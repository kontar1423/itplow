'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Checkbox from '@/components/ui/Checkbox';
import Card, { CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { loginUser } from '@/lib/api/client';

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  
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
      localStorage.setItem('user_first_name', user.first_name || '');
      localStorage.setItem('user_last_name', user.last_name || '');
      
      setIsLoading(false);
      
      // Перенаправление на соответствующий dashboard
      const targetRole = user.role === 'admin' ? 'scientist' : user.role;
      router.push(`/dashboard/${targetRole}`);
    } catch (err) {
      setIsLoading(false);
      setError(err instanceof Error ? err.message : 'Ошибка входа');
    }
  };

  return (
    <div className="min-h-screen bg-[#f0fdf4] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        
        <Card variant="elevated" className="w-full">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">С возвращением!</CardTitle>
            <CardDescription>
              Войдите в свой аккаунт для продолжения работы
            </CardDescription>
          </CardHeader>
          
          <form onSubmit={handleSubmit} autoComplete="on">
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
                autoComplete="username"
                inputMode="email"
                required
              />
              
              <Input
                label="Пароль"
                name="password"
                type="password"
                placeholder="Введите пароль"
                autoComplete="current-password"
                required
              />
              
              <div className="flex items-center justify-between">
                <Checkbox
                  name="remember"
                  label="Запомнить меня"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="text-muted-foreground"
                />
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
      </div>
    </div>
  );
}
