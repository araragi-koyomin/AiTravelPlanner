import { cn } from '@/utils/cn'

export interface LoadingProps {
  size?: 'sm' | 'md' | 'lg'
  text?: string
  className?: string
}

const sizeClasses = {
  sm: 'w-4 h-4 border-2',
  md: 'w-8 h-8 border-3',
  lg: 'w-12 h-12 border-4',
}

const Loading = ({ size = 'md', text, className }: LoadingProps) => {
  return (
    <div className={cn('flex flex-col items-center justify-center space-y-2', className)}>
      <div
        className={cn(
          'animate-spin rounded-full border-gray-200 border-t-primary-600',
          sizeClasses[size],
        )}
      />
      {text && <p className="text-sm text-gray-600">{text}</p>}
    </div>
  )
}

export { Loading }
