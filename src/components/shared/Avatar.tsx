import { getInitials, generateAvatarColor } from '../../lib/formatters';
import { cn } from '../../lib/cn';

interface AvatarProps {
  src?: string | null;
  name?: string | null;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizes = {
  xs: { container: 'avatar-xs', fontSize: 9 },
  sm: { container: 'avatar-sm', fontSize: 11 },
  md: { container: 'avatar-md', fontSize: 13 },
  lg: { container: 'avatar-lg', fontSize: 17 },
  xl: { container: 'avatar-xl', fontSize: 26 },
};

export function Avatar({ src, name: rawName, size = 'md', className }: AvatarProps) {
  // API records can be missing a name; don't crash the whole page over it
  const name = rawName?.trim() || '';
  const sizeClasses = sizes[size];
  const initials = getInitials(name) || '?';
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
      className={cn('avatar avatar-initials', sizeClasses.container, className)}
      style={{ backgroundColor: bgColor, fontSize: sizeClasses.fontSize }}
      aria-label={name || undefined}
      title={name || undefined}
    >
      {initials}
    </span>
  );
}
