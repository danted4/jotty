import { render, screen, fireEvent, waitFor } from '@testing-library/preact'
import { App } from '../App'

describe('Notes App Integration Tests', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
    // Reset localStorage mock to default behavior
    const store: Record<string, string> = {}
    localStorage.getItem = vi.fn((key: string) => store[key] || null)
    localStorage.setItem = vi.fn((key: string, value: string) => {
      store[key] = value
    })
  })

  it('should complete full note lifecycle: create, edit, duplicate, delete', async () => {
    render(<App />)

    // Initially should show empty state
    expect(screen.getByText('No notes found')).toBeInTheDocument()
    expect(screen.getByText('Create your first note')).toBeInTheDocument()

    // Create a new note
    fireEvent.click(screen.getByText('📝 New Note'))

    // Should be in editor mode
    await waitFor(() => {
      expect(screen.getByDisplayValue('Untitled Note')).toBeInTheDocument()
    })

    // Edit note title and content (this should trigger creation since content is added)
    const titleInput = screen.getByDisplayValue('Untitled Note')
    fireEvent.input(titleInput, { target: { value: 'My First Note' } })

    const contentTextarea = screen.getByPlaceholderText('Start typing... Use ``` for code blocks')
    fireEvent.input(contentTextarea, { target: { value: 'This is my first note content!' } })

    // Wait for auto-save debounce
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Go back to notes list
    fireEvent.click(screen.getByText('← Back'))

    // Should see the created note in the list
    await waitFor(() => {
      expect(screen.getByText('My First Note')).toBeInTheDocument()
      expect(screen.getByText('This is my first note content!')).toBeInTheDocument()
    })

    // Test note duplicate functionality
    const duplicateButton = screen.getByTitle('Duplicate note')
    fireEvent.click(duplicateButton)

    await waitFor(() => {
      expect(screen.getByText('My First Note (Copy)')).toBeInTheDocument()
    })

    // Test note deletion
    window.confirm = vi.fn(() => true)
    const deleteButtons = screen.getAllByTitle('Delete note')
    fireEvent.click(deleteButtons[1]) // Delete the copy (second in alphabetical order)

    await waitFor(() => {
      expect(screen.queryByText('My First Note (Copy)')).not.toBeInTheDocument()
    })

    // Should still have the original note
    expect(screen.getByText('My First Note')).toBeInTheDocument()
  })

  it('should handle code note template workflow', async () => {
    render(<App />)

    // Create a code note
    fireEvent.click(screen.getByText('💻 Code'))

    // Should be in editor with code template
    await waitFor(() => {
      expect(screen.getByDisplayValue('Untitled Note')).toBeInTheDocument()
    })

    // Get the content textarea (may start empty due to useEffect timing)
    const contentTextarea = screen.getByPlaceholderText('Start typing... Use ``` for code blocks')

    // Add some code content (this triggers save since there's actual content change)
    fireEvent.input(contentTextarea, { 
      target: { value: '```javascript\nconsole.log("Hello World!")\nconst x = 42;\n```' } 
    })

    // Wait for auto-save debounce
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Click preview to see rendered code block
    fireEvent.click(screen.getByText('👁️ Preview'))

    // Should render as code block in preview mode
    await waitFor(() => {
      expect(screen.getByText('✏️ Edit')).toBeInTheDocument()
    })

    // Go back to list
    fireEvent.click(screen.getByText('← Back'))

    // Should see code block indicator in preview
    await waitFor(() => {
      expect(screen.getByText('[Code Block]')).toBeInTheDocument()
    })
  })

  it('should handle checklist note template', async () => {
    render(<App />)

    // Create a checklist note
    fireEvent.click(screen.getByText('✅ Checklist'))

    await waitFor(() => {
      expect(screen.getByDisplayValue('Untitled Note')).toBeInTheDocument()
    })

    // Get the content textarea (may start empty due to useEffect timing)
    const contentTextarea = screen.getByPlaceholderText('Start typing... Use ``` for code blocks')

    // Edit checklist (this triggers save since there's actual content change)
    fireEvent.input(contentTextarea, { 
      target: { value: '- [x] Completed task\n- [ ] Pending task\n- [ ] Another task\n- [ ] Final task' } 
    })

    // Wait for auto-save debounce
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Go back to list
    fireEvent.click(screen.getByText('← Back'))

    // Should see checklist content in preview
    await waitFor(() => {
      expect(screen.getByText(/Completed task.*Pending task/)).toBeInTheDocument()
    })
  })

  it('should persist notes across page refreshes', async () => {
    // Mock localStorage to return pre-existing data (simulating page refresh)
    localStorage.getItem.mockReturnValue(JSON.stringify([{
      id: 'test-id',
      title: 'Persistent Note',
      content: 'Some content to save',
      color: '#ffffff',
      icon: '📝',
      lastEdited: Date.now(),
      template: 'plain'
    }]))

    render(<App />)

    // Should show the persisted note from localStorage
    await waitFor(() => {
      expect(screen.getByText('Persistent Note')).toBeInTheDocument()
      expect(screen.getByText('Some content to save')).toBeInTheDocument()
    })

    // Verify localStorage was called to load the data
    expect(localStorage.getItem).toHaveBeenCalledWith('jotty-notes')
  })

  it('should handle theme switching', async () => {
    render(<App />)

    // Find and click theme toggle
    const themeToggle = screen.getByTitle(/Switch to (dark|light) mode/)
    fireEvent.click(themeToggle)

    // Verify localStorage was called to save theme preference
    await waitFor(() => {
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'jotty-theme',
        expect.stringMatching(/"(light|dark)"/)
      )
    })
  })

  it('should not create empty notes without user input', async () => {
    render(<App />)

    // Create a new note
    fireEvent.click(screen.getByText('📝 New Note'))

    await waitFor(() => {
      expect(screen.getByDisplayValue('Untitled Note')).toBeInTheDocument()
    })

    // Go back without making any changes
    fireEvent.click(screen.getByText('← Back'))

    // Should return to empty state since no meaningful content was added
    await waitFor(() => {
      expect(screen.getByText('No notes found')).toBeInTheDocument()
      expect(screen.getByText('Create your first note')).toBeInTheDocument()
    })

    // Verify no note was saved to localStorage
    expect(localStorage.setItem).not.toHaveBeenCalledWith(
      'jotty-notes',
      expect.anything()
    )
  })

  it('should create notes only when user adds meaningful content', async () => {
    render(<App />)

    // Create a new note
    fireEvent.click(screen.getByText('📝 New Note'))

    await waitFor(() => {
      expect(screen.getByDisplayValue('Untitled Note')).toBeInTheDocument()
    })

    // Add some content to trigger note creation
    const contentTextarea = screen.getByPlaceholderText('Start typing... Use ``` for code blocks')
    fireEvent.input(contentTextarea, { target: { value: 'This is actual content!' } })

    // Wait for auto-save debounce
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Go back
    fireEvent.click(screen.getByText('← Back'))

    // Should show the created note since we added content
    await waitFor(() => {
      expect(screen.getByText('Untitled Note')).toBeInTheDocument()
      expect(screen.getByText('This is actual content!')).toBeInTheDocument()
    })

    // Verify note was saved to localStorage
    expect(localStorage.setItem).toHaveBeenCalledWith(
      'jotty-notes',
      expect.stringContaining('This is actual content!')
    )
  })

  it('should handle export/import functionality', async () => {
    // Mock some existing notes
    localStorage.getItem.mockReturnValue(JSON.stringify([
      {
        id: 'note1',
        title: 'Test Note 1',
        content: 'First note content',
        color: '#ffffff',
        icon: '📝',
        lastEdited: Date.now(),
        template: 'plain'
      },
      {
        id: 'note2', 
        title: 'Test Note 2',
        content: 'Second note content',
        color: '#ffffff',
        icon: '💻',
        lastEdited: Date.now() - 1000,
        template: 'code'
      }
    ]))

    render(<App />)

    await waitFor(() => {
      expect(screen.getByText('Test Note 1')).toBeInTheDocument()
      expect(screen.getByText('Test Note 2')).toBeInTheDocument()
    })

    // Click export/import button
    const exportImportBtn = screen.getByTitle('Export/Import Notes')
    fireEvent.click(exportImportBtn)

    // Should show export/import modal
    await waitFor(() => {
      expect(screen.getByText('Export/Import Notes')).toBeInTheDocument()
      expect(screen.getByText('📤 Export')).toBeInTheDocument()
      expect(screen.getByText('📥 Import')).toBeInTheDocument()
    })

    // Should show both notes for selection in the modal
    expect(screen.getAllByText('Test Note 1')).toHaveLength(2) // One in main list, one in modal
    expect(screen.getAllByText('Test Note 2')).toHaveLength(2) // One in main list, one in modal

    // Close modal
    fireEvent.click(screen.getByRole('button', { name: '×' }))

    await waitFor(() => {
      expect(screen.queryByText('Export/Import Notes')).not.toBeInTheDocument()
    })
  })

  it('should handle search functionality', async () => {
    // Mock some existing notes
    localStorage.getItem.mockReturnValue(JSON.stringify([
      {
        id: 'note1',
        title: 'JavaScript Notes',
        content: 'Learning about functions and variables',
        color: '#ffffff',
        icon: '📝',
        lastEdited: Date.now(),
        template: 'plain'
      },
      {
        id: 'note2',
        title: 'Python Tutorial',
        content: 'Object oriented programming concepts',
        color: '#ffffff',
        icon: '🐍',
        lastEdited: Date.now() - 1000,
        template: 'plain'
      }
    ]))

    render(<App />)

    await waitFor(() => {
      expect(screen.getByText('JavaScript Notes')).toBeInTheDocument()
      expect(screen.getByText('Python Tutorial')).toBeInTheDocument()
    })

    // Search for JavaScript
    const searchInput = screen.getByPlaceholderText('Search notes...')
    fireEvent.input(searchInput, { target: { value: 'JavaScript' } })

    // Should only show JavaScript note
    await waitFor(() => {
      expect(screen.getByText('JavaScript Notes')).toBeInTheDocument()
      expect(screen.queryByText('Python Tutorial')).not.toBeInTheDocument()
    })

    // Clear search
    fireEvent.input(searchInput, { target: { value: '' } })

    // Should show both notes again
    await waitFor(() => {
      expect(screen.getByText('JavaScript Notes')).toBeInTheDocument()
      expect(screen.getByText('Python Tutorial')).toBeInTheDocument()
    })
  })
})