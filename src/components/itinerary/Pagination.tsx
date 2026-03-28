import { memo, useCallback } from 'react'
import { Button } from '@/components/ui/Button'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  showQuickJumper?: boolean
}

export const Pagination = memo(function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  showQuickJumper = true
}: PaginationProps) {
  const handleFirstPage = useCallback(() => {
    onPageChange(1)
  }, [onPageChange])

  const handlePrevPage = useCallback(() => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1)
    }
  }, [currentPage, onPageChange])

  const handleNextPage = useCallback(() => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1)
    }
  }, [currentPage, totalPages, onPageChange])

  const handleLastPage = useCallback(() => {
    onPageChange(totalPages)
  }, [totalPages, onPageChange])

  const handlePageClick = useCallback(
    (page: number) => {
      onPageChange(page)
    },
    [onPageChange]
  )

  if (totalPages <= 1) {
    return null
  }

  const getPageNumbers = (): (number | string)[] => {
    const pages: (number | string)[] = []
    const maxVisible = 5

    if (totalPages <= maxVisible + 2) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      pages.push(1)

      if (currentPage > 3) {
        pages.push('...')
      }

      const start = Math.max(2, currentPage - 1)
      const end = Math.min(totalPages - 1, currentPage + 1)

      for (let i = start; i <= end; i++) {
        pages.push(i)
      }

      if (currentPage < totalPages - 2) {
        pages.push('...')
      }

      pages.push(totalPages)
    }

    return pages
  }

  return (
    <div className="flex items-center justify-center gap-1">
      <Button
        variant="outline"
        size="sm"
        onClick={handleFirstPage}
        disabled={currentPage === 1}
        aria-label="第一页"
      >
        <ChevronsLeft className="h-4 w-4" />
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={handlePrevPage}
        disabled={currentPage === 1}
        aria-label="上一页"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {showQuickJumper && (
        <div className="flex items-center gap-1 mx-2">
          {getPageNumbers().map((page, index) =>
            typeof page === 'number' ? (
              <Button
                key={index}
                variant={page === currentPage ? 'primary' : 'outline'}
                size="sm"
                onClick={() => handlePageClick(page)}
                className="min-w-[32px]"
              >
                {page}
              </Button>
            ) : (
              <span key={index} className="px-2 text-gray-400">
                {page}
              </span>
            )
          )}
        </div>
      )}

      {!showQuickJumper && (
        <span className="px-3 text-sm text-gray-600">
          {currentPage} / {totalPages}
        </span>
      )}

      <Button
        variant="outline"
        size="sm"
        onClick={handleNextPage}
        disabled={currentPage === totalPages}
        aria-label="下一页"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={handleLastPage}
        disabled={currentPage === totalPages}
        aria-label="最后一页"
      >
        <ChevronsRight className="h-4 w-4" />
      </Button>
    </div>
  )
})
