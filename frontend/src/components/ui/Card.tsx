import React, { ReactNode } from 'react';

interface CardProps {
    children: ReactNode;
    className?: string;
    hover?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, className = '', hover = false }) => {
    return (
        <div
            className={`
        glass-morphism rounded-xl p-6 
        ${hover ? 'hover:shadow-2xl hover:scale-105 transition-all duration-300' : ''}
        ${className}
      `}
        >
            {children}
        </div>
    );
};
