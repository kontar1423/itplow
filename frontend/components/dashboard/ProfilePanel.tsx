'use client';

import { useEffect, useState } from 'react';
import Card, { CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { getCurrentUser, updateCurrentUser, UpdateUserDto } from '@/lib/api/client';

interface ProfilePanelProps {
  className?: string;
}

export default function ProfilePanel({ className }: ProfilePanelProps) {
  const [user, setUser] = useState<{
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    description: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formFirstName, setFormFirstName] = useState('');
  const [formLastName, setFormLastName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const data = await getCurrentUser();
        setUser(data);
        setFormFirstName(data.first_name || '');
        setFormLastName(data.last_name || '');
        setFormPhone(data.phone || '');
        setFormDescription(data.description || '');
      } catch (error) {
        console.error('Ошибка загрузки пользователя:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updateData: UpdateUserDto = {
        first_name: formFirstName,
        last_name: formLastName,
        phone: formPhone,
        description: formDescription,
      };
      const updatedUser = await updateCurrentUser(updateData);
      setUser(updatedUser);
      if (updatedUser.first_name) localStorage.setItem('user_first_name', updatedUser.first_name);
      if (updatedUser.last_name) localStorage.setItem('user_last_name', updatedUser.last_name);
      setMessage({ type: 'success', text: 'Профиль успешно сохранён!' });
      setTimeout(() => window.location.reload(), 750);
    } catch (error) {
      console.error('Ошибка сохранения профиля:', error);
      setMessage({ type: 'error', text: 'Ошибка сохранения профиля' });
    } finally {
      setIsSaving(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  if (isLoading) {
    return (
      <Card variant="outlined">
        <CardHeader>
          <CardTitle>Редактирование профиля</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card variant="outlined" className={className}>
      <CardHeader>
        <CardTitle>Редактирование профиля</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium text-foreground mb-1.5 block">Имя</label>
          <input 
            type="text" 
            value={formFirstName}
            onChange={(e) => setFormFirstName(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg border border-border bg-white"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-foreground mb-1.5 block">Фамилия</label>
          <input
            type="text"
            value={formLastName}
            onChange={(e) => setFormLastName(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg border border-border bg-white"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-foreground mb-1.5 block">
            Контактная информация (будет видна пользователям с ваших проектов)
          </label>
          <input
            type="tel"
            value={formPhone}
            onChange={(e) => setFormPhone(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg border border-border bg-white"
            placeholder="Номер телефона"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-foreground mb-1.5 block">О себе</label>
          <textarea 
            value={formDescription}
            onChange={(e) => setFormDescription(e.target.value)}
            rows={3}
            className="w-full px-4 py-2.5 rounded-lg border border-border bg-white"
            placeholder="Расскажите о себе..."
          />
        </div>
        <div>
          <label className="text-sm font-medium text-foreground mb-1.5 block">Email (будет виден пользователям с ваших проектов)</label>
          <div className="w-full px-4 py-2.5 rounded-lg border border-border bg-muted text-muted-foreground">
            {user?.email || 'Загрузка...'}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col items-start gap-3">
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? 'Сохранение...' : 'Сохранить изменения'}
        </Button>
        {message && (
          <div className={`text-sm ${message.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
            {message.text}
          </div>
        )}
      </CardFooter>
    </Card>
  );
}