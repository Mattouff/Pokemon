'use client';

import { Button } from '@/components/ui/button';

type PokemonHeaderProps = {
  title: string;
  buttons?: {
    label: string;
    href: string;
  }[];
};

export default function PokemonHeader({ title, buttons = [] }: PokemonHeaderProps) {
  return (
    <div className="container mx-auto px-4">
      <header className="pokemon-header" style={{ borderRadius: '12px' }}>
        <div className="px-4 py-6">
          <div className="flex justify-between items-center">
            <h1 className="pokemon-title text-2xl" style={{ marginLeft: '1rem' }}>
              {title}
            </h1>
            {buttons.length > 0 && (
              <div className="flex gap-4">
                {buttons.map((button, index) => (
                  <a key={index} href={button.href}>
                    <Button 
                      className="pokemon-button"
                      style={{ 
                        width: 'auto', 
                        padding: '0.75rem 1.5rem',
                        marginRight: index === buttons.length - 1 ? '1rem' : '0'
                      }}
                    >
                      <span className="pixel-text text-xs" style={{ color: '#000' }}>
                        {button.label}
                      </span>
                    </Button>
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </header>
      <div style={{ marginBottom: '1rem' }}></div>
    </div>
  );
}
