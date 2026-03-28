import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MapControls } from './MapControls'

describe('MapControls', () => {
  const mockMap = {
    getZoom: vi.fn(() => 13),
    setZoom: vi.fn(),
    setCenter: vi.fn(),
    setMapStyle: vi.fn()
  }

  const defaultProps = {
    map: mockMap,
    onLocate: vi.fn(),
    onLayerChange: vi.fn()
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('rendering', () => {
    it('should render all control buttons', () => {
      render(<MapControls {...defaultProps} />)

      expect(screen.getByTitle('放大')).toBeInTheDocument()
      expect(screen.getByTitle('缩小')).toBeInTheDocument()
      expect(screen.getByTitle('定位')).toBeInTheDocument()
      expect(screen.getByTitle('标准地图')).toBeInTheDocument()
      expect(screen.getByTitle('卫星地图')).toBeInTheDocument()
    })

    it('should render zoom controls', () => {
      render(<MapControls {...defaultProps} />)

      const zoomInButton = screen.getByTitle('放大')
      const zoomOutButton = screen.getByTitle('缩小')

      expect(zoomInButton).toBeInTheDocument()
      expect(zoomOutButton).toBeInTheDocument()
    })

    it('should render locate button', () => {
      render(<MapControls {...defaultProps} />)

      const locateButton = screen.getByTitle('定位')
      expect(locateButton).toBeInTheDocument()
    })

    it('should render layer buttons', () => {
      render(<MapControls {...defaultProps} />)

      const normalMapButton = screen.getByTitle('标准地图')
      const satelliteMapButton = screen.getByTitle('卫星地图')

      expect(normalMapButton).toBeInTheDocument()
      expect(satelliteMapButton).toBeInTheDocument()
    })

    it('should render scale indicator', () => {
      render(<MapControls {...defaultProps} />)

      expect(screen.getByText('比例尺')).toBeInTheDocument()
    })
  })

  describe('zoom controls', () => {
    it('should call setZoom with increased value when zoom in is clicked', () => {
      render(<MapControls {...defaultProps} />)

      const zoomInButton = screen.getByTitle('放大')
      fireEvent.click(zoomInButton)

      expect(mockMap.setZoom).toHaveBeenCalledWith(14)
    })

    it('should call setZoom with decreased value when zoom out is clicked', () => {
      render(<MapControls {...defaultProps} />)

      const zoomOutButton = screen.getByTitle('缩小')
      fireEvent.click(zoomOutButton)

      expect(mockMap.setZoom).toHaveBeenCalledWith(12)
    })
  })

  describe('locate control', () => {
    it('should call onLocate when locate button is clicked', async () => {
      const onLocate = vi.fn().mockResolvedValue(undefined)
      render(<MapControls {...defaultProps} onLocate={onLocate} />)

      const locateButton = screen.getByTitle('定位')
      fireEvent.click(locateButton)

      await vi.waitFor(() => {
        expect(onLocate).toHaveBeenCalledTimes(1)
      })
    })

    it('should show loading state when locating', async () => {
      const onLocate = vi.fn().mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))
      render(<MapControls {...defaultProps} onLocate={onLocate} />)

      const locateButton = screen.getByTitle('定位')
      fireEvent.click(locateButton)

      const loader = document.querySelector('.animate-spin')
      expect(loader).toBeInTheDocument()
    })
  })

  describe('layer control', () => {
    it('should call onLayerChange with normal when standard map is selected', () => {
      render(<MapControls {...defaultProps} />)

      const normalMapButton = screen.getByTitle('标准地图')
      fireEvent.click(normalMapButton)

      expect(defaultProps.onLayerChange).toHaveBeenCalledWith('normal')
    })

    it('should call onLayerChange with satellite when satellite map is selected', () => {
      render(<MapControls {...defaultProps} />)

      const satelliteMapButton = screen.getByTitle('卫星地图')
      fireEvent.click(satelliteMapButton)

      expect(defaultProps.onLayerChange).toHaveBeenCalledWith('satellite')
    })

    it('should highlight selected layer', () => {
      render(<MapControls {...defaultProps} />)

      const normalMapButton = screen.getByTitle('标准地图').closest('button')
      expect(normalMapButton).toHaveClass('bg-blue-50')
    })
  })

  describe('without map', () => {
    it('should not call map methods when map is null', () => {
      render(<MapControls {...defaultProps} map={null} />)

      const zoomInButton = screen.getByTitle('放大')
      fireEvent.click(zoomInButton)

      expect(mockMap.setZoom).not.toHaveBeenCalled()
    })
  })

  describe('accessibility', () => {
    it('should have proper title attributes', () => {
      render(<MapControls {...defaultProps} />)

      expect(screen.getByTitle('放大')).toBeInTheDocument()
      expect(screen.getByTitle('缩小')).toBeInTheDocument()
      expect(screen.getByTitle('定位')).toBeInTheDocument()
      expect(screen.getByTitle('标准地图')).toBeInTheDocument()
      expect(screen.getByTitle('卫星地图')).toBeInTheDocument()
    })

    it('should be keyboard accessible', () => {
      render(<MapControls {...defaultProps} />)

      const zoomInButton = screen.getByTitle('放大')
      zoomInButton.focus()
      expect(zoomInButton).toHaveFocus()
    })
  })

  describe('visibility controls', () => {
    it('should hide zoom controls when showZoom is false', () => {
      render(<MapControls {...defaultProps} showZoom={false} />)

      expect(screen.queryByTitle('放大')).not.toBeInTheDocument()
      expect(screen.queryByTitle('缩小')).not.toBeInTheDocument()
    })

    it('should hide locate button when showLocate is false', () => {
      render(<MapControls {...defaultProps} showLocate={false} />)

      expect(screen.queryByTitle('定位')).not.toBeInTheDocument()
    })

    it('should hide layer switch when showLayerSwitch is false', () => {
      render(<MapControls {...defaultProps} showLayerSwitch={false} />)

      expect(screen.queryByTitle('标准地图')).not.toBeInTheDocument()
      expect(screen.queryByTitle('卫星地图')).not.toBeInTheDocument()
    })

    it('should hide scale when showScale is false', () => {
      render(<MapControls {...defaultProps} showScale={false} />)

      expect(screen.queryByText('比例尺')).not.toBeInTheDocument()
    })
  })
})
