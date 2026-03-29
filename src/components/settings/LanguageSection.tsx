import { Button } from '@/components/ui/Button'
import type { Language } from '@/types/settings'
import { LANGUAGE_OPTIONS } from '@/types/settings'

interface LanguageSectionProps {
  currentLanguage: Language
  onLanguageChange: (language: Language) => Promise<void>
  isLoading?: boolean
}

export function LanguageSection({ currentLanguage, onLanguageChange, isLoading }: LanguageSectionProps) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <h3 className="text-lg font-semibold text-gray-900">语言设置</h3>
      <p className="mt-1 text-sm text-gray-500">
        选择应用显示语言
      </p>
      <div className="mt-4 flex gap-3">
        {LANGUAGE_OPTIONS.map((option) => (
          <Button
            key={option.value}
            variant={currentLanguage === option.value ? 'primary' : 'outline'}
            onClick={() => onLanguageChange(option.value)}
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
