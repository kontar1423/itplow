'use client';

import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="py-8 bg-primary-dark text-white">
      <div className="container-custom">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center font-bold text-white">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="18" 
                height="18" 
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
            <span className="text-lg font-bold text-white">Общее дело</span>
          </div>
          
          <div className="flex gap-6 text-sm text-white/60">
            <Link href="/projects" className="hover:text-white">Проекты</Link>
            <Link href="/about" className="hover:text-white">О платформе</Link>
            <Link href="/auth/login" className="hover:text-white">Вход</Link>
          </div>
          
          <div className="text-sm text-white/40">
            © 2026 Общее дело
          </div>
        </div>
      </div>
    </footer>
  );
}