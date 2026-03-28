import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ItineraryMapView } from './ItineraryMapView'
import type { ItineraryItem } from '@/services/itinerary'

vi.mock('@/hooks/useAMap', () => ({
  useAMap: vi.fn()
}))

vi.mock('@/services/amap', () => ({
  recommendTransport: vi.fn()
}))

vi.mock('@amap/amap-jsapi-loader', () => ({
  default: {
    load: vi.fn()
  }
}))

import { useAMap } from '@/hooks/useAMap'
import { recommendTransport } from '@/services/amap'

const mockItems: ItineraryItem[] = [
  {
    id: '1',
    itinerary_id: 'itinerary-1',
    day: 1,
    order_idx: 1,
    type: 'attraction',
    name: '天安门广场',
    description: '北京著名景点',
    time: '09:00',
    duration: 120,
    cost: 0,
    location: {
      lat: 39.9087,
      lng: 116.3975,
      address: '北京市东城区东长安街'
    },
    tips: '建议早上前往',
    image_url: null,
    created_at: '2026-03-20T00:00:00Z'
  },
  {
    id: '2',
    itinerary_id: 'itinerary-1',
    day: 1,
    order_idx: 2,
    type: 'restaurant',
    name: '全聚德烤鸭店',
    description: '北京烤鸭老字号',
    time: '12:00',
    duration: 90,
    cost: 200,
    location: {
      lat: 39.8998,
      lng: 116.4011,
      address: '北京市东城区前门大街'
    },
    tips: '需要提前预约',
    image_url: null,
    created_at: '2026-03-20T00:00:00Z'
  },
  {
    id: '3',
    itinerary_id: 'itinerary-1',
    day: 2,
    order_idx: 1,
    type: 'attraction',
    name: '故宫博物院',
    description: '明清两代皇宫',
    time: '09:00',
    duration: 180,
    cost: 60,
    location: {
      lat: 39.9163,
      lng: 116.3972,
      address: '北京市东城区景山前街4号'
    },
    tips: '周一闭馆',
    image_url: null,
    created_at: '2026-03-20T00:00:00Z'
  }
]

describe('ItineraryMapView Integration Tests', () => {
  let mockMap: any

  beforeEach(() => {
    vi.clearAllMocks()

    mockMap = {
      setCenter: vi.fn(),
      setZoom: vi.fn(),
      setBounds: vi.fn(),
      setMapStyle: vi.fn(),
      destroy: vi.fn(),
      getZoom: vi.fn(() => 13)
    }

      ; (useAMap as any).mockReturnValue({
        map: mockMap,
        loading: false,
        error: null,
        initMap: vi.fn(),
        destroyMap: vi.fn(),
        getCurrentPosition: vi.fn(),
        setCenter: vi.fn(),
        setZoom: vi.fn()
      })

      ; (recommendTransport as any).mockResolvedValue({
        success: true,
        recommendations: [
          {
            mode: 'driving',
            estimatedDuration: 30,
            estimatedCost: 15,
            distance: 10,
            reason: '最快路线'
          }
        ]
      })

      ; (window as any).AMap = {
        Map: vi.fn(() => mockMap),
        Geolocation: vi.fn(),
        Bounds: vi.fn(() => ({ contains: vi.fn() })),
        Marker: vi.fn(() => ({
          setMap: vi.fn(),
          on: vi.fn(),
          off: vi.fn()
        })),
        Polyline: vi.fn(() => ({
          setMap: vi.fn()
        })),
        InfoWindow: vi.fn(() => ({
          open: vi.fn(),
          close: vi.fn()
        })),
        Driving: vi.fn(() => ({
          search: vi.fn(),
          clear: vi.fn()
        })),
        Walking: vi.fn(() => ({
          search: vi.fn(),
          clear: vi.fn()
        })),
        Transfer: vi.fn(() => ({
          search: vi.fn(),
          clear: vi.fn()
        })),
        Riding: vi.fn(() => ({
          search: vi.fn(),
          clear: vi.fn()
        }))
      }
  })

  afterEach(() => {
    delete (window as any).AMap
    vi.restoreAllMocks()
  })

  describe('rendering', () => {
    it('should render map view with items', () => {
      render(<ItineraryMapView items={mockItems} />)

      expect(screen.getByText('行程路线')).toBeInTheDocument()
      expect(screen.getByText('第 1 天')).toBeInTheDocument()
      expect(screen.getByText('第 2 天')).toBeInTheDocument()
    })

    it('should render item names', () => {
      render(<ItineraryMapView items={mockItems} />)

      expect(screen.getByText('天安门广场')).toBeInTheDocument()
      expect(screen.getByText('全聚德烤鸭店')).toBeInTheDocument()
      expect(screen.getByText('故宫博物院')).toBeInTheDocument()
    })

    it('should render empty state when no items', () => {
      render(<ItineraryMapView items={[]} />)

      expect(screen.getByText('行程路线')).toBeInTheDocument()
    })

    it('should apply custom className', () => {
      const { container } = render(<ItineraryMapView items={mockItems} className="custom-class" />)

      expect(container.firstChild).toHaveClass('custom-class')
    })
  })

  describe('day grouping', () => {
    it('should group items by day correctly', () => {
      render(<ItineraryMapView items={mockItems} />)

      const day1Section = screen.getByText('第 1 天').parentElement
      const day2Section = screen.getByText('第 2 天').parentElement

      expect(day1Section).toHaveTextContent('天安门广场')
      expect(day1Section).toHaveTextContent('全聚德烤鸭店')
      expect(day2Section).toHaveTextContent('故宫博物院')
    })

    it('should sort items by order within each day', () => {
      const unsortedItems = [
        { ...mockItems[1], order_idx: 2 },
        { ...mockItems[0], order_idx: 1 }
      ]

      render(<ItineraryMapView items={unsortedItems} />)

      const day1Section = screen.getByText('第 1 天').parentElement
      const itemButtons = day1Section?.querySelectorAll('button.bg-blue-100')

      expect(itemButtons?.[0]).toHaveTextContent('天安门广场')
      expect(itemButtons?.[1]).toHaveTextContent('全聚德烤鸭店')
    })
  })

  describe('item interaction', () => {
    it('should highlight item when clicked', async () => {
      const user = userEvent.setup()
      render(<ItineraryMapView items={mockItems} />)

      const itemButton = screen.getByText('天安门广场')
      await user.click(itemButton)

      expect(itemButton).toBeInTheDocument()
    })

    it('should show route button between consecutive items', () => {
      render(<ItineraryMapView items={mockItems} />)

      const routeButtons = screen.getAllByTitle('查看路线')
      expect(routeButtons.length).toBeGreaterThan(0)
    })

    it('should not show route button for last item in day', () => {
      render(<ItineraryMapView items={mockItems} />)

      const day1Section = screen.getByText('第 1 天').parentElement
      const day2Section = screen.getByText('第 2 天').parentElement

      const day1RouteButtons = day1Section?.querySelectorAll('button[title="查看路线"]')
      const day2RouteButtons = day2Section?.querySelectorAll('button[title="查看路线"]')

      expect(day1RouteButtons?.length).toBe(1)
      expect(day2RouteButtons?.length).toBe(0)
    })
  })

  describe('route planning', () => {
    it('should call recommendTransport when route button is clicked', async () => {
      const user = userEvent.setup()
      render(<ItineraryMapView items={mockItems} />)

      const routeButton = screen.getAllByTitle('查看路线')[0]
      await user.click(routeButton)

      await waitFor(() => {
        expect(recommendTransport).toHaveBeenCalled()
      })
    })

    it('should show loading state when planning route', async () => {
      const user = userEvent.setup()
        ; (recommendTransport as any).mockImplementation(() => new Promise(() => { }))

      render(<ItineraryMapView items={mockItems} />)

      const routeButton = screen.getAllByTitle('查看路线')[0]
      await user.click(routeButton)

      await waitFor(() => {
        const loader = document.querySelector('.animate-spin')
        expect(loader).toBeInTheDocument()
      })
    })

    it('should show transport panel when recommendations are available', async () => {
      const user = userEvent.setup()
      render(<ItineraryMapView items={mockItems} />)

      const routeButton = screen.getAllByTitle('查看路线')[0]
      await user.click(routeButton)

      await waitFor(() => {
        expect(screen.getByText('交通推荐')).toBeInTheDocument()
      })
    })

    it('should display recommendation details', async () => {
      const user = userEvent.setup()
      render(<ItineraryMapView items={mockItems} />)

      const routeButton = screen.getAllByTitle('查看路线')[0]
      await user.click(routeButton)

      await waitFor(() => {
        expect(screen.getByText('驾车')).toBeInTheDocument()
        expect(screen.getByText('30分钟')).toBeInTheDocument()
        expect(screen.getByText('最快路线')).toBeInTheDocument()
      })
    })
  })

  describe('transport mode selection', () => {
    it('should allow switching transport modes', async () => {
      const user = userEvent.setup()
      render(<ItineraryMapView items={mockItems} />)

      const routeButton = screen.getAllByTitle('查看路线')[0]
      await user.click(routeButton)

      await waitFor(() => {
        expect(screen.getByText('交通推荐')).toBeInTheDocument()
      })

      const drivingButton = screen.getByText('驾车').closest('button')
      expect(drivingButton).toHaveClass('border-blue-500')
    })
  })

  describe('error handling', () => {
    it('should handle transport recommendation error gracefully', async () => {
      const user = userEvent.setup()
        ; (recommendTransport as any).mockRejectedValue(new Error('Network error'))

      render(<ItineraryMapView items={mockItems} />)

      const routeButton = screen.getAllByTitle('查看路线')[0]
      await user.click(routeButton)

      await waitFor(() => {
        expect(recommendTransport).toHaveBeenCalled()
      })
    })

    it('should handle empty recommendations', async () => {
      const user = userEvent.setup()
        ; (recommendTransport as any).mockResolvedValue({
          success: true,
          recommendations: []
        })

      render(<ItineraryMapView items={mockItems} />)

      const routeButton = screen.getAllByTitle('查看路线')[0]
      await user.click(routeButton)

      await waitFor(() => {
        expect(recommendTransport).toHaveBeenCalled()
      })
    })
  })

  describe('map controls integration', () => {
    it('should render map controls', () => {
      render(<ItineraryMapView items={mockItems} />)

      expect(screen.getByTitle('放大')).toBeInTheDocument()
      expect(screen.getByTitle('缩小')).toBeInTheDocument()
      expect(screen.getByTitle('定位')).toBeInTheDocument()
      expect(screen.getByTitle('标准地图')).toBeInTheDocument()
    })
  })

  describe('performance', () => {
    it('should not re-render unnecessarily', () => {
      const { rerender } = render(<ItineraryMapView items={mockItems} />)

      rerender(<ItineraryMapView items={mockItems} />)

      expect(screen.getByText('行程路线')).toBeInTheDocument()
    })

    it('should handle large number of items', () => {
      const manyItems = Array.from({ length: 50 }, (_, i) => ({
        ...mockItems[0],
        id: `item-${i}`,
        order_idx: i + 1,
        name: `景点 ${i + 1}`
      }))

      render(<ItineraryMapView items={manyItems} />)

      expect(screen.getByText('景点 1')).toBeInTheDocument()
      expect(screen.getByText('景点 50')).toBeInTheDocument()
    })
  })
})
