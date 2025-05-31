'use client';

import { useFormStatus } from 'react-dom';

interface SubmitButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  pendingText?: string;
  children: React.ReactNode;
}

export default function SubmitButton({ 
  children, 
  pendingText = "Guardando...", 
  className, 
  ...props 
}: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button 
      {...props}
      type="submit" 
      disabled={pending}
      className={className}
    >
      {pending ? pendingText : children}
    </button>
  );
}