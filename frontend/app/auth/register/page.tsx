'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card, { CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { registerUser, CreateUserDto } from '@/lib/api/client';

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const roleParam = searchParams.get('role');
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    role: roleParam === 'scientist' ? 'scientist' : roleParam === 'volunteer' ? 'volunteer' : 'volunteer',
  });
  
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    const formDataEl = new FormData(e.currentTarget);
    const name = formDataEl.get('name') as string;
    const email = formDataEl.get('email') as string;
    const password = formDataEl.get('password') as string;
    
    const nameParts = name.trim().split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';
    
    const userData: CreateUserDto = {
      email,
      password,
      first_name: firstName,
      last_name: lastName,
      role: formData.role === 'scientist' ? 'admin' : 'user',
    };
    
    try {
      const { token, user } = await registerUser(userData);
      
      localStorage.setItem('auth_token', token);
      localStorage.setItem('user_role', user.role === 'admin' ? 'scientist' : user.role);
      
      setIsLoading(false);
      window.location.reload();
    } catch (err) {
      setIsLoading(false);
      setError(err instanceof Error ? err.message : 'Ошибка регистрации');
    }
  };

  return (
    <div className="min-h-screen bg-[#f0fdf4] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <Card variant="elevated" className="w-full">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Создать аккаунт</CardTitle>
            <CardDescription>
              Присоединяйтесь к сообществу гражданской науки
            </CardDescription>
          </CardHeader>
          
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
                  {error}
                </div>
              )}
              
              {/* Выбор роли */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Я хочу участвовать как:</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, role: 'volunteer' })}
                    className={`p-4 rounded-lg border-2 transition-all text-left ${
                      formData.role === 'volunteer'
                        ? 'border-primary bg-primary-light'
                        : 'border-border hover:border-border-hover'
                    }`}
                  >
                    <div className="mb-1 flex justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>
                    </div>
                    <div className="font-medium text-foreground">Волонтёр</div>
                    <div className="text-xs text-muted-foreground">Участвовать в проектах</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, role: 'scientist' })}
                    className={`p-4 rounded-lg border-2 transition-all text-left ${
                      formData.role === 'scientist'
                        ? 'border-primary bg-primary-light'
                        : 'border-border hover:border-border-hover'
                    }`}
                  >
                    <div className="mb-1 flex justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 2v7.31"/><path d="M14 9.3V1.99"/><path d="M8.5 2h7"/><path d="M14 9.3a6.5 6.5 0 1 1-4 0"/><path d="M5.52 16h12.96"/></svg>
                    </div>
                    <div className="font-medium text-foreground">Учёный</div>
                    <div className="text-xs text-muted-foreground">Создавать проекты</div>
                  </button>
                </div>
              </div>
              
              <Input
                label="Имя"
                name="name"
                placeholder="Ваше имя"
                required
              />
              
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
                placeholder="Придумайте пароль"
                helperText="Минимум 8 символов"
                required
              />
              
              <Input
                label="Подтверждение пароля"
                name="confirmPassword"
                type="password"
                placeholder="Повторите пароль"
                required
              />
            </CardContent>
            
            <CardFooter className="flex-col gap-4">
              <Button type="submit" className="w-full" isLoading={isLoading}>
                Зарегистрироваться
              </Button>
              
              <div className="text-center text-sm text-muted-foreground">
                Уже есть аккаунт?{' '}
                <Link href="/auth/login" className="text-primary hover:underline font-medium">
                  Войти
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
