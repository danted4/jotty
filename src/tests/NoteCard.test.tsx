import { render, screen, fireEvent } from '@testing-library/preact'
import { NoteCard } from '../components/NoteCard'
import { Note } from '../types'

const mockNote: Note = {
  id: 'test-note',
  title: 'Test Note Title',
  content: 'This is test content for the note',
  color: '#ffffff',
  icon: '📝',
  lastEdited: Date.now() - 1000 * 60 * 5, // 5 minutes ago
  template: 'plain'
}

describe('NoteCard', () => {
  const mockOnSelect = vi.fn()
  const mockOnDelete = vi.fn()
  const mockOnDuplicate = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render note information correctly', () => {
    render(
      <NoteCard
        note={mockNote}
        onSelect={mockOnSelect}
        onDelete={mockOnDelete}
        onDuplicate={mockOnDuplicate}
      />
    )

    expect(screen.getByText('Test Note Title')).toBeInTheDocument()
    expect(screen.getByText('This is test content for the note')).toBeInTheDocument()
    expect(screen.getByText('📝')).toBeInTheDocument()
    expect(screen.getByText('plain')).toBeInTheDocument()
    expect(screen.getByText('5m ago')).toBeInTheDocument()
  })

  it('should call onSelect when card is clicked', () => {
    render(
      <NoteCard
        note={mockNote}
        onSelect={mockOnSelect}
        onDelete={mockOnDelete}
        onDuplicate={mockOnDuplicate}
      />
    )

    fireEvent.click(screen.getByText('Test Note Title'))
    expect(mockOnSelect).toHaveBeenCalledWith(mockNote)
  })

  it('should call onDuplicate when duplicate button is clicked', () => {
    render(
      <NoteCard
        note={mockNote}
        onSelect={mockOnSelect}
        onDelete={mockOnDelete}
        onDuplicate={mockOnDuplicate}
      />
    )

    const duplicateButton = screen.getByTitle('Duplicate note')
    fireEvent.click(duplicateButton)
    
    expect(mockOnDuplicate).toHaveBeenCalledWith('test-note')
    expect(mockOnSelect).not.toHaveBeenCalled() // Should not trigger card select
  })

  it('should show confirmation and call onDelete when delete button is clicked', () => {
    // Mock window.confirm
    window.confirm = vi.fn(() => true)

    render(
      <NoteCard
        note={mockNote}
        onSelect={mockOnSelect}
        onDelete={mockOnDelete}
        onDuplicate={mockOnDuplicate}
      />
    )

    const deleteButton = screen.getByTitle('Delete note')
    fireEvent.click(deleteButton)
    
    expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to delete this note?')
    expect(mockOnDelete).toHaveBeenCalledWith('test-note')
    expect(mockOnSelect).not.toHaveBeenCalled() // Should not trigger card select
  })

  it('should not call onDelete when confirmation is cancelled', () => {
    window.confirm = vi.fn(() => false)

    render(
      <NoteCard
        note={mockNote}
        onSelect={mockOnSelect}
        onDelete={mockOnDelete}
        onDuplicate={mockOnDuplicate}
      />
    )

    const deleteButton = screen.getByTitle('Delete note')
    fireEvent.click(deleteButton)
    
    expect(window.confirm).toHaveBeenCalled()
    expect(mockOnDelete).not.toHaveBeenCalled()
  })

  it('should display "Untitled" when note has no title', () => {
    const noteWithoutTitle = { ...mockNote, title: '' }
    
    render(
      <NoteCard
        note={noteWithoutTitle}
        onSelect={mockOnSelect}
        onDelete={mockOnDelete}
        onDuplicate={mockOnDuplicate}
      />
    )

    expect(screen.getByText('Untitled')).toBeInTheDocument()
  })

  it('should truncate long content in preview', () => {
    const noteWithLongContent = {
      ...mockNote,
      content: 'a'.repeat(200) // Very long content
    }
    
    render(
      <NoteCard
        note={noteWithLongContent}
        onSelect={mockOnSelect}
        onDelete={mockOnDelete}
        onDuplicate={mockOnDuplicate}
      />
    )

    const preview = screen.getByText(/a+\.\.\./)
    expect(preview.textContent?.length).toBeLessThan(200)
    expect(preview.textContent?.endsWith('...')).toBe(true)
  })

  it('should replace code blocks with [Code Block] in preview', () => {
    const noteWithCodeBlock = {
      ...mockNote,
      content: 'Some text\n```javascript\nconsole.log("hello")\n```\nMore text'
    }
    
    render(
      <NoteCard
        note={noteWithCodeBlock}
        onSelect={mockOnSelect}
        onDelete={mockOnDelete}
        onDuplicate={mockOnDuplicate}
      />
    )

    expect(screen.getByText(/Some text\s*\[Code Block\]\s*More text/)).toBeInTheDocument()
  })
})