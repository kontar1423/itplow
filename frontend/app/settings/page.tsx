'use client';

import { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';
import Card, { CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import Input from '@/components/ui/Input';

export default function SettingsPage() {
  const [userRole, setUserRole] = useState<'scientist' | 'volunteer'>('volunteer');

  useEffect(() => {
    const savedRole = localStorage.getItem('user_role');
    if (savedRole === 'volunteer' || savedRole === 'scientist') {
      setUserRole(savedRole);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_role');
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container-custom py-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-foreground mb-2">Настройки</h1>
            <p className="text-muted-foreground">
              Управление настройками аккаунта
            </p>
          </div>

          <div className="space-y-6">
            <Card variant="outlined">
              <CardHeader>
                <CardTitle>Уведомления</CardTitle>
                <CardDescription>
                  Настройка уведомлений
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <label className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-foreground">Email-уведомления</div>
                    <div className="text-sm text-muted-foreground">Получать новости на email</div>
                  </div>
                  <input type="checkbox" defaultChecked className="toggle" />
                </label>
                <label className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-foreground">Напоминания о заданиях</div>
                    <div className="text-sm text-muted-foreground">Получать напоминания о незавершённых заданиях</div>
                  </div>
                  <input type="checkbox" defaultChecked className="toggle" />
                </label>
              </CardContent>
            </Card>

            <Card variant="outlined">
              <CardHeader>
                <CardTitle>Конфиденциальность</CardTitle>
                <CardDescription>
                  Настройки приватности
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <label className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-foreground">Показывать профиль</div>
                    <div className="text-sm text-muted-foreground">Разрешить другим участникам видеть ваш профиль</div>
                  </div>
                  <input type="checkbox" defaultChecked className="toggle" />
                </label>
                <label className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-foreground">Показывать статистику</div>
                    <div className="text-sm text-muted-foreground">Показывать вашу активность в проектах</div>
                  </div>
                  <input type="checkbox" defaultChecked className="toggle" />
                </label>
              </CardContent>
            </Card>

            <Card variant="outlined">
              <CardHeader>
                <CardTitle>Аккаунт</CardTitle>
                <CardDescription>
                  Управление аккаунтом
                </CardDescription>
              </CardHeader>
              <CardFooter className="flex-col gap-3">
                <Button variant="outline" className="w-full">
                  Изменить пароль
                </Button>
                <Button variant="danger" className="w-full" onClick={handleLogout}>
                  Выйти из аккаунта
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
