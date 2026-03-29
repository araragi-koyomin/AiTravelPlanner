import { vi } from 'vitest'
import React from 'react'

export const ResponsiveContainer = vi.fn(
  ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  )
)

export const PieChart = vi.fn(
  ({ children }: { children: React.ReactNode }) => (
    <div data-testid="pie-chart">{children}</div>
  )
)

export const Pie = vi.fn(
  ({
    data,
    onClick,
    children
  }: {
    data?: Array<{ category: string; amount: number }>
    onClick?: (data: { payload: { category: string; amount: number } }) => void
    children?: React.ReactNode
  }) => (
    <div
      data-testid="pie"
      data-items={data?.length || 0}
      onClick={() => {
        if (onClick && data && data.length > 0) {
          onClick({ payload: data[0] })
        }
      }}
    >
      {data?.map((item, index) => (
        <div key={index} data-testid={`pie-cell-${item.category}`}>
          {item.category}: {item.amount}
        </div>
      ))}
      {children}
    </div>
  )
)

export const Cell = vi.fn(
  ({
    fill,
    onClick,
    'data-testid': testId
  }: {
    fill?: string
    onClick?: () => void
    'data-testid'?: string
  }) => (
    <div
      data-testid={testId || 'pie-cell'}
      style={{ backgroundColor: fill }}
      onClick={onClick}
    />
  )
)

export const BarChart = vi.fn(
  ({
    children,
    data
  }: {
    children: React.ReactNode
    data?: Array<{ date: string; amount: number }>
  }) => (
    <div data-testid="bar-chart" data-items={data?.length || 0}>
      {children}
    </div>
  )
)

export const Bar = vi.fn(
  ({
    dataKey,
    children
  }: {
    dataKey: string
    children?: React.ReactNode
  }) => <div data-testid="bar" data-key={dataKey}>{children}</div>
)

export const XAxis = vi.fn(
  ({ dataKey }: { dataKey: string }) => (
    <div data-testid="x-axis" data-key={dataKey} />
  )
)

export const YAxis = vi.fn(() => <div data-testid="y-axis" />)

export const Tooltip = vi.fn(
  ({ content }: { content?: React.ReactNode }) => (
    <div data-testid="tooltip">{content}</div>
  )
)

export const Legend = vi.fn(
  ({ content }: { content?: React.ReactNode }) => (
    <div data-testid="legend">{content}</div>
  )
)

export const ReferenceLine = vi.fn(
  ({ y, stroke }: { y?: number; stroke?: string }) => (
    <div data-testid="reference-line" data-y={y} data-stroke={stroke} />
  )
)

export const CartesianGrid = vi.fn(() => <div data-testid="cartesian-grid" />)
