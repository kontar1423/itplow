'use client';

import { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';
import Card, { CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Avatar from '@/components/ui/Avatar';
import { getCurrentUser, updateCurrentUser, UpdateUserDto, UserResponseDto } from '@/lib/api/client';

export default function ProfilePage() {
  const [userRole, setUserRole] = useState<'scientist' | 'volunteer'>('volunteer');
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState<UserResponseDto | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    nickname: '',
    description: '',
  });

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      setIsLoading(true);
      const userData = await getCurrentUser();
      setUser(userData);
      setUserRole(userData.role === 'admin' ? 'scientist' : 'volunteer');
      setFormData({
        name: `${userData.first_name} ${userData.last_name}`.trim() || userData.email,
        email: userData.email,
        nickname: userData.email.split('@')[0],
        description: userData.description || '',
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки профиля');
    } finally {
      setIsLoading(false);
    }
  };

  const isScientist = userRole === 'scientist';


  const handleSave = async () => {
    if (!user) return;
    
    try {
      const nameParts = formData.name.trim().split(' ');
      const updateData: UpdateUserDto = {
        first_name: nameParts[0] || '',
        last_name: nameParts.slice(1).join(' ') || '',
        description: formData.description,
      };
      
      await updateCurrentUser(updateData);
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка сохранения');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container-custom py-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-foreground mb-2">Профиль</h1>
            <p className="text-muted-foreground">
              Управление личными данными
            </p>
          </div>

          <Card variant="outlined">
            <CardHeader>
              <div className="flex items-center gap-4">
                <Avatar fallback={formData.name} size="xl" />
                <div>
                  <CardTitle>{formData.name}</CardTitle>
                  <CardDescription>@{formData.nickname}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Input
                  label="Имя"
                  name="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  disabled={!isEditing}
                />
                <Input
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  disabled={!isEditing}
                />
                <Input
                  label="Никнейм"
                  name="nickname"
                  value={formData.nickname}
                  onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
                  disabled={!isEditing}
                />
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">О себе</label>
                  <textarea
                    className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>
                <div className="flex items-center gap-2 p-3 rounded-lg bg-muted">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground">
                    <path d="M10 2v7.31"/>
                    <path d="M14 9.3V1.99"/>
                    <path d="M8.5 2h7"/>
                    <path d="M14 9.3a6.5 6.5 0 1 1-4 0"/>
                    <path d="M5.52 16h12.96"/>
                  </svg>
                  <span className="text-sm text-muted-foreground">
                    Роль: {isScientist ? 'Учёный' : 'Волонтёр'}
                  </span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-3">
              {isEditing ? (
                <>
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
                    Отмена
                  </Button>
                  <Button onClick={handleSave}>
                    Сохранить
                  </Button>
                </>
              ) : (
                <Button onClick={() => setIsEditing(true)}>
                  Редактировать
                </Button>
              )}
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
