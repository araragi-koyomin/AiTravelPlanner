import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { LanguageSection } from './LanguageSection'

const mockOnLanguageChange = vi.fn()

describe('LanguageSection', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockOnLanguageChange.mockResolvedValue(undefined)
  })

  describe('rendering', () => {
    it('should render title and description', () => {
      render(
        <LanguageSection currentLanguage="zh" onLanguageChange={mockOnLanguageChange} />
      )

      expect(screen.getByText('语言设置')).toBeInTheDocument()
      expect(screen.getByText('选择应用显示语言')).toBeInTheDocument()
    })

    it('should display two language options', () => {
      render(
        <LanguageSection currentLanguage="zh" onLanguageChange={mockOnLanguageChange} />
      )

      expect(screen.getByRole('button', { name: '中文' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'English' })).toBeInTheDocument()
    })

    it('should highlight current language', () => {
      render(
        <LanguageSection currentLanguage="zh" onLanguageChange={mockOnLanguageChange} />
      )

      const zhButton = screen.getByRole('button', { name: '中文' })
      const enButton = screen.getByRole('button', { name: 'English' })

      expect(zhButton).toHaveClass('bg-primary-600')
      expect(enButton).not.toHaveClass('bg-primary-600')
    })

    it('should highlight English when selected', () => {
      render(
        <LanguageSection currentLanguage="en" onLanguageChange={mockOnLanguageChange} />
      )

      const zhButton = screen.getByRole('button', { name: '中文' })
      const enButton = screen.getByRole('button', { name: 'English' })

      expect(zhButton).not.toHaveClass('bg-primary-600')
      expect(enButton).toHaveClass('bg-primary-600')
    })
  })

  describe('interaction', () => {
    it('should call onLanguageChange when clicking language button', async () => {
      render(
        <LanguageSection currentLanguage="zh" onLanguageChange={mockOnLanguageChange} />
      )

      fireEvent.click(screen.getByRole('button', { name: 'English' }))

      expect(mockOnLanguageChange).toHaveBeenCalledWith('en')
    })

    it('should call onLanguageChange when clicking Chinese', async () => {
      render(
        <LanguageSection currentLanguage="en" onLanguageChange={mockOnLanguageChange} />
      )

      fireEvent.click(screen.getByRole('button', { name: '中文' }))

      expect(mockOnLanguageChange).toHaveBeenCalledWith('zh')
    })

    it('should disable buttons when loading', () => {
      render(
        <LanguageSection currentLanguage="zh" onLanguageChange={mockOnLanguageChange} isLoading={true} />
      )

      const buttons = screen.getAllByRole('button')
      buttons.forEach((button) => {
        expect(button).toBeDisabled()
      })
    })

    it('should call onLanguageChange even when clicking current language', async () => {
      render(
        <LanguageSection currentLanguage="zh" onLanguageChange={mockOnLanguageChange} />
      )

      fireEvent.click(screen.getByRole('button', { name: '中文' }))

      expect(mockOnLanguageChange).toHaveBeenCalledWith('zh')
    })
  })
})
