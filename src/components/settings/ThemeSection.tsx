import { Button } from '@/components/ui/Button'
import type { Theme } from '@/types/settings'
import { THEME_OPTIONS } from '@/types/settings'

interface ThemeSectionProps {
  currentTheme: Theme
  onThemeChange: (theme: Theme) => Promise<void>
  isLoading?: boolean
}

export function ThemeSection({ currentTheme, onThemeChange, isLoading }: ThemeSectionProps) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <h3 className="text-lg font-semibold text-gray-900">外观设置</h3>
      <p className="mt-1 text-sm text-gray-500">
        选择您喜欢的主题风格
      </p>
      <div className="mt-4 flex gap-3">
        {THEME_OPTIONS.map((option) => (
          <Button
            key={option.value}
            variant={currentTheme === option.value ? 'primary' : 'outline'}
            onClick={() => onThemeChange(option.value)}
            disabled={isLoading}
            className="min-w-[100px]"
          >
            {option.label}
          </Button>
        ))}
      </div>
    </div>
  )
}
