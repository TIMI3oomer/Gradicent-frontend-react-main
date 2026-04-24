import { getInitials, generateAvatarColor } from '../../lib/formatters';
import { cn } from '../../lib/cn';

interface AvatarProps {
  src?: string | null;
  name: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizes = {
  xs: { container: 'avatar-xs', text: 'text-xs' },
  sm: { container: 'avatar-sm', text: 'text-xs' },
  md: { container: 'avatar-md', text: 'text-sm' },
  lg: { container: 'avatar-lg', text: 'text-lg' },
  xl: { container: 'avatar-xl', text: 'text-xl' },
};

export function Avatar({ src, name, size = 'md', className }: AvatarProps) {
  const sizeClasses = sizes[size];
  const initials = getInitials(name);
  const bgColor = generateAvatarColor(name);

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={cn('avatar', sizeClasses.container, className)}
      />
    );
  }

  return (
    <span
      className={cn('avatar avatar-initials', sizeClasses.container, sizeClasses.text, className)}
      style={{ backgroundColor: bgColor }}
      aria-label={name}
      title={name}
    >
      {initials}
    </span>
  );
}
