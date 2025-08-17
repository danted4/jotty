import { 
  generateId, 
  formatDate, 
  debounce, 
  truncateText, 
  validateImageSize 
} from '../utils/helpers'

describe('helpers', () => {
  describe('generateId', () => {
    it('should generate unique IDs', () => {
      const id1 = generateId()
      const id2 = generateId()
      
      expect(id1).not.toBe(id2)
      expect(typeof id1).toBe('string')
      expect(id1.length).toBeGreaterThan(0)
    })
  })

  describe('formatDate', () => {
    it('should return "Just now" for very recent timestamps', () => {
      const now = Date.now()
      expect(formatDate(now)).toBe('Just now')
    })

    it('should return minutes ago', () => {
      const fiveMinutesAgo = Date.now() - (5 * 60 * 1000)
      expect(formatDate(fiveMinutesAgo)).toBe('5m ago')
    })

    it('should return hours ago', () => {
      const twoHoursAgo = Date.now() - (2 * 60 * 60 * 1000)
      expect(formatDate(twoHoursAgo)).toBe('2h ago')
    })

    it('should return days ago', () => {
      const threeDaysAgo = Date.now() - (3 * 24 * 60 * 60 * 1000)
      expect(formatDate(threeDaysAgo)).toBe('3d ago')
    })

    it('should return formatted date for older timestamps', () => {
      const twoWeeksAgo = Date.now() - (14 * 24 * 60 * 60 * 1000)
      const result = formatDate(twoWeeksAgo)
      expect(result).toMatch(/\d{1,2}\/\d{1,2}\/\d{4}/)
    })
  })

  describe('debounce', () => {
    beforeEach(() => {
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.restoreAllMocks()
    })

    it('should debounce function calls', () => {
      const mockFn = vi.fn()
      const debouncedFn = debounce(mockFn, 100)

      debouncedFn('arg1')
      debouncedFn('arg2')
      debouncedFn('arg3')

      expect(mockFn).not.toHaveBeenCalled()

      vi.advanceTimersByTime(100)

      expect(mockFn).toHaveBeenCalledTimes(1)
      expect(mockFn).toHaveBeenCalledWith('arg3')
    })
  })

  describe('truncateText', () => {
    it('should return original text if shorter than max length', () => {
      const text = 'Short text'
      expect(truncateText(text, 50)).toBe('Short text')
    })

    it('should truncate text and add ellipsis', () => {
      const text = 'This is a very long text that should be truncated'
      const result = truncateText(text, 20)
      expect(result).toBe('This is a very long...')
      expect(result.length).toBe(22) // Actual length after truncation + '...'
    })

    it('should use default max length of 100', () => {
      const text = 'a'.repeat(150)
      const result = truncateText(text)
      expect(result.length).toBe(103) // 100 + '...'
    })
  })

  describe('validateImageSize', () => {
    it('should return true for small base64 strings', () => {
      const smallBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='
      expect(validateImageSize(smallBase64, 5)).toBe(true)
    })

    it('should return false for large base64 strings', () => {
      // Create a base64 string that represents > 5MB
      const largeBase64 = 'a'.repeat(7000000) // ~7MB
      expect(validateImageSize(largeBase64, 5)).toBe(false)
    })

    it('should use custom max size', () => {
      const mediumBase64 = 'a'.repeat(2000000) // ~2MB
      expect(validateImageSize(mediumBase64, 1)).toBe(false)
      expect(validateImageSize(mediumBase64, 3)).toBe(true)
    })
  })
})