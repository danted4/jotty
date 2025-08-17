import { renderHook, act } from '@testing-library/preact'
import { useNotes } from '../hooks/useNotes'
import { useLocalStorage } from '../hooks/useLocalStorage'

// Mock the useLocalStorage hook
vi.mock('../hooks/useLocalStorage', () => ({
  useLocalStorage: vi.fn(() => [[], vi.fn(), vi.fn()])
}))

const mockUseLocalStorage = vi.mocked(useLocalStorage)

describe('useNotes', () => {
  let mockSetNotes: ReturnType<typeof vi.fn>
  
  beforeEach(() => {
    mockSetNotes = vi.fn()
    mockUseLocalStorage.mockReturnValue([[], mockSetNotes, vi.fn()])
  })

  it('should create a new note with default template', () => {
    const { result } = renderHook(() => useNotes())
    
    act(() => {
      result.current.createNote()
    })
    
    expect(mockSetNotes).toHaveBeenCalledWith(expect.any(Function))
    const updateFunction = mockSetNotes.mock.calls[0][0]
    const newNotes = updateFunction([])
    
    expect(newNotes).toHaveLength(1)
    expect(newNotes[0]).toMatchObject({
      title: 'Untitled Note',
      content: '',
      color: '#ffffff',
      icon: '📝',
      template: 'plain'
    })
    expect(newNotes[0].id).toBeDefined()
    expect(newNotes[0].lastEdited).toBeDefined()
  })

  it('should create a code note template', () => {
    const { result } = renderHook(() => useNotes())
    
    act(() => {
      result.current.createNote('code')
    })
    
    expect(mockSetNotes).toHaveBeenCalledWith(expect.any(Function))
    const updateFunction = mockSetNotes.mock.calls[0][0]
    const newNotes = updateFunction([])
    
    expect(newNotes[0]).toMatchObject({
      content: '```javascript\n// Your code here\n```',
      icon: '💻',
      template: 'code'
    })
  })

  it('should create a checklist note template', () => {
    const { result } = renderHook(() => useNotes())
    
    act(() => {
      result.current.createNote('checklist')
    })
    
    expect(mockSetNotes).toHaveBeenCalledWith(expect.any(Function))
    const updateFunction = mockSetNotes.mock.calls[0][0]
    const newNotes = updateFunction([])
    
    expect(newNotes[0]).toMatchObject({
      content: '- [ ] First task\n- [ ] Second task\n- [ ] Third task',
      icon: '✅',
      template: 'checklist'
    })
  })

  it('should update a note', () => {
    const existingNote = {
      id: 'test-id',
      title: 'Test Note',
      content: 'Test content',
      color: '#ffffff',
      icon: '📝',
      lastEdited: Date.now(),
      template: 'plain' as const
    }
    
    mockUseLocalStorage.mockReturnValue([[existingNote], mockSetNotes, vi.fn()])
    
    const { result } = renderHook(() => useNotes())
    
    act(() => {
      result.current.updateNote('test-id', { title: 'Updated Title' })
    })
    
    expect(mockSetNotes).toHaveBeenCalledWith(expect.any(Function))
    const updateFunction = mockSetNotes.mock.calls[0][0]
    const updatedNotes = updateFunction([existingNote])
    
    expect(updatedNotes[0].title).toBe('Updated Title')
    expect(updatedNotes[0].lastEdited).toBeGreaterThan(existingNote.lastEdited)
  })

  it('should delete a note', () => {
    const note1 = { id: 'note1', title: 'Note 1' }
    const note2 = { id: 'note2', title: 'Note 2' }
    
    mockUseLocalStorage.mockReturnValue([[note1, note2], mockSetNotes, vi.fn()])
    
    const { result } = renderHook(() => useNotes())
    
    act(() => {
      result.current.deleteNote('note1')
    })
    
    expect(mockSetNotes).toHaveBeenCalledWith(expect.any(Function))
    const updateFunction = mockSetNotes.mock.calls[0][0]
    const updatedNotes = updateFunction([note1, note2])
    
    expect(updatedNotes).toHaveLength(1)
    expect(updatedNotes[0].id).toBe('note2')
  })
})