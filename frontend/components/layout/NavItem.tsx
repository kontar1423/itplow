'use client';

interface NavItemProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  badge?: number;
}

export default function NavItem({ active, onClick, icon, label, badge }: NavItemProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-left transition-colors ${
        active 
          ? 'bg-primary-light text-primary-dark font-medium' 
          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
      }`}
    >
      <span className="flex items-center gap-3">
        <span className="w-5 h-5 flex items-center justify-center">{icon}</span>
        <span>{label}</span>
      </span>
      {badge && (
        <span className="bg-primary text-white text-xs px-2 py-0.5 rounded-full">
          {badge}
        </span>
      )}
    </button>
  );
}