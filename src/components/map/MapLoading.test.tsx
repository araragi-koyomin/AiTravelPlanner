import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MapLoading } from './MapLoading'

describe('MapLoading', () => {
  it('should render loading indicator', () => {
    render(<MapLoading />)

    expect(screen.getByText('正在加载地图...')).toBeInTheDocument()
  })

  it('should render map pin icon', () => {
    render(<MapLoading />)

    const icon = document.querySelector('.lucide-map-pin')
    expect(icon).toBeInTheDocument()
  })

  it('should have bounce animation on icon', () => {
    render(<MapLoading />)

    const icon = document.querySelector('.animate-bounce')
    expect(icon).toBeInTheDocument()
  })

  it('should have pulse animation on shadow', () => {
    render(<MapLoading />)

    const shadow = document.querySelector('.animate-pulse')
    expect(shadow).toBeInTheDocument()
  })

  it('should render with correct structure', () => {
    const { container } = render(<MapLoading />)

    const wrapper = container.firstChild as HTMLElement
    expect(wrapper).toHaveClass('absolute', 'inset-0', 'flex', 'flex-col', 'items-center', 'justify-center')
  })

  it('should render backdrop blur', () => {
    const { container } = render(<MapLoading />)

    const wrapper = container.firstChild as HTMLElement
    expect(wrapper).toHaveClass('backdrop-blur-sm')
  })

  it('should have correct z-index', () => {
    const { container } = render(<MapLoading />)

    const wrapper = container.firstChild as HTMLElement
    expect(wrapper).toHaveClass('z-10')
  })

  it('should render shadow element', () => {
    render(<MapLoading />)

    const shadow = document.querySelector('.bg-gray-300.rounded-full')
    expect(shadow).toBeInTheDocument()
  })
})
