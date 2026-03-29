import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ThemeSection } from './ThemeSection'

const mockOnThemeChange = vi.fn()

describe('ThemeSection', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockOnThemeChange.mockResolvedValue(undefined)
  })

  describe('rendering', () => {
    it('should render title and description', () => {
      render(
        <ThemeSection currentTheme="light" onThemeChange={mockOnThemeChange} />
      )

      expect(screen.getByText('外观设置')).toBeInTheDocument()
      expect(screen.getByText('选择您喜欢的主题风格')).toBeInTheDocument()
    })

    it('should display two theme options', () => {
      render(
        <ThemeSection currentTheme="light" onThemeChange={mockOnThemeChange} />
      )

      expect(screen.getByRole('button', { name: '浅色' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: '深色' })).toBeInTheDocument()
    })

    it('should highlight current theme', () => {
      render(
        <ThemeSection currentTheme="light" onThemeChange={mockOnThemeChange} />
      )

      const lightButton = screen.getByRole('button', { name: '浅色' })
      const darkButton = screen.getByRole('button', { name: '深色' })

      expect(lightButton).toHaveClass('bg-primary-600')
      expect(darkButton).not.toHaveClass('bg-primary-600')
    })

    it('should highlight dark theme when selected', () => {
      render(
        <ThemeSection currentTheme="dark" onThemeChange={mockOnThemeChange} />
      )

      const lightButton = screen.getByRole('button', { name: '浅色' })
      const darkButton = screen.getByRole('button', { name: '深色' })

      expect(lightButton).not.toHaveClass('bg-primary-600')
      expect(darkButton).toHaveClass('bg-primary-600')
    })
  })

  describe('interaction', () => {
    it('should call onThemeChange when clicking theme button', async () => {
      render(
        <ThemeSection currentTheme="light" onThemeChange={mockOnThemeChange} />
      )

      fireEvent.click(screen.getByRole('button', { name: '深色' }))

      expect(mockOnThemeChange).toHaveBeenCalledWith('dark')
    })

    it('should call onThemeChange when clicking light theme', async () => {
      render(
        <ThemeSection currentTheme="dark" onThemeChange={mockOnThemeChange} />
      )

      fireEvent.click(screen.getByRole('button', { name: '浅色' }))

      expect(mockOnThemeChange).toHaveBeenCalledWith('light')
    })

    it('should disable buttons when loading', () => {
      render(
        <ThemeSection currentTheme="light" onThemeChange={mockOnThemeChange} isLoading={true} />
      )

      const buttons = screen.getAllByRole('button')
      buttons.forEach((button) => {
        expect(button).toBeDisabled()
      })
    })

    it('should call onThemeChange even when clicking current theme', async () => {
      render(
        <ThemeSection currentTheme="light" onThemeChange={mockOnThemeChange} />
      )

      fireEvent.click(screen.getByRole('button', { name: '浅色' }))

      expect(mockOnThemeChange).toHaveBeenCalledWith('light')
    })
  })
})
