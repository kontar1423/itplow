'use client';

import Link from 'next/link';
import Button from '@/components/ui/Button';

interface CTAProps {
  isVisible?: boolean;
}

export default function CTA({ isVisible = true }: CTAProps) {
  if (!isVisible) return null;

  return (
    <div className="py-12">
      <div className="container-custom text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
          Готовы начать?
        </h2>
        <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
          Зарегистрируйтесь и примите участие в исследованиях вместе с тысячами волонтёров
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/auth/register">
            <Button size="lg">
              Зарегистрироваться
            </Button>
          </Link>
          <Link href="/projects">
            <Button size="lg" variant="outline">
              Смотреть все проекты
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}