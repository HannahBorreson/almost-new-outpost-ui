import { act, renderHook, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import * as productsApi from '../api/productsApi'
import { useCountdown } from './useCountdown'
import { useDebounce } from './useDebounce'
import { useProducts } from './useProducts'

afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
})

describe('useDebounce', () => {
  it('only passes the value on once it stops changing', () => {
    vi.useFakeTimers()
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 300), {
      initialProps: { value: 'w' },
    })
    expect(result.current).toBe('w')

    rerender({ value: 'wa' })
    act(() => vi.advanceTimersByTime(200))
    rerender({ value: 'wat' })
    act(() => vi.advanceTimersByTime(200))
    expect(result.current).toBe('w') // still waiting: the value kept changing

    act(() => vi.advanceTimersByTime(100))
    expect(result.current).toBe('wat')
  })
})

describe('useCountdown', () => {
  it('counts whole seconds down to the target, once per second', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-10-28T12:00:00Z'))
    const { result } = renderHook(() => useCountdown('2026-10-28T12:00:10Z'))
    expect(result.current).toBe(10)

    act(() => vi.advanceTimersByTime(3000))
    expect(result.current).toBe(7)

    act(() => vi.advanceTimersByTime(60_000))
    expect(result.current).toBe(0) // never negative
  })

  it('uses the server clock offset', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-10-28T12:00:00Z'))
    // The server is 4 seconds ahead of this PC
    const { result } = renderHook(() => useCountdown('2026-10-28T12:00:10Z', 4000))
    expect(result.current).toBe(6)
  })

  it('returns null without a target', () => {
    const { result } = renderHook(() => useCountdown(null))
    expect(result.current).toBeNull()
  })
})

describe('useProducts', () => {
  it('loads products for the search and sort', async () => {
    const spy = vi.spyOn(productsApi, 'getProducts').mockResolvedValue([{ productId: 1 }])
    const { result } = renderHook(() => useProducts({ search: 'kit', sortBy: 'price', sortDir: 'desc' }))

    expect(result.current.isLoading).toBe(true)
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.products).toEqual([{ productId: 1 }])
    expect(spy).toHaveBeenCalledWith({ search: 'kit', sortBy: 'price', sortDir: 'desc' })
  })

  it('reports an error and reloads on request', async () => {
    const spy = vi
      .spyOn(productsApi, 'getProducts')
      .mockRejectedValueOnce(new Error('down'))
      .mockResolvedValueOnce([{ productId: 2 }])
    const { result } = renderHook(() => useProducts({ search: '', sortBy: 'name', sortDir: 'asc' }))

    await waitFor(() => expect(result.current.error?.message).toBe('down'))

    act(() => result.current.reload())
    await waitFor(() => expect(result.current.products).toEqual([{ productId: 2 }]))
    expect(result.current.error).toBeNull()
    expect(spy).toHaveBeenCalledTimes(2)
  })
})
