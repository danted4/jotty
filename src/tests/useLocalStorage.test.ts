import { renderHook, act } from '@testing-library/preact'
import { useLocalStorage } from '../hooks/useLocalStorage'

describe('useLocalStorage', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  it('should return initial value when localStorage is empty', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'initial'))
    
    expect(result.current[0]).toBe('initial')
  })

  it('should return stored value from localStorage', () => {
    localStorage.setItem('test-key', JSON.stringify('stored-value'))
    
    const { result } = renderHook(() => useLocalStorage('test-key', 'initial'))
    
    expect(result.current[0]).toBe('stored-value')
  })

  it('should update localStorage when value changes', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'initial'))
    
    act(() => {
      result.current[1]('new-value')
    })
    
    expect(localStorage.setItem).toHaveBeenCalledWith('test-key', JSON.stringify('new-value'))
  })

  it('should handle localStorage quota exceeded error', () => {
    localStorage.setItem.mockImplementation(() => {
      const error = new Error('QuotaExceededError')
      error.name = 'QuotaExceededError'
      throw error
    })

    const { result } = renderHook(() => useLocalStorage('test-key', 'initial'))
    
    expect(() => {
      act(() => {
        result.current[1]('new-value')
      })
    }).toThrow('Storage quota exceeded. Please delete some notes or reduce image sizes.')
  })

  it('should remove value from localStorage when set to null', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'initial'))
    
    act(() => {
      result.current[1](null)
    })
    
    expect(localStorage.removeItem).toHaveBeenCalledWith('test-key')
  })
})