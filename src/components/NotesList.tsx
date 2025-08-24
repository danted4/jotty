import { useState } from 'preact/hooks'
import { Note } from '../types'
import { useNotes } from '../hooks/useNotes'
import { useTheme } from '../hooks/useTheme'
import { NoteCard } from './NoteCard'
import { ExportImportModal } from './ExportImportModal'
import { generateId } from '../utils/helpers'
import type { ConflictResolution } from './DuplicateResolutionModal'

interface NotesListProps {
  onNoteSelect: (note: Note) => void
  onCreateNote: (note: Note) => void
}

export function NotesList({ onNoteSelect, onCreateNote }: NotesListProps) {
  const { notes, deleteNote, duplicateNote, importNotes, createNote } = useNotes()
  const { theme, toggleTheme } = useTheme()
  const [searchTerm, setSearchTerm] = useState('')
  const [showExportImport, setShowExportImport] = useState(false)

  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.content.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleCreateNote = (template: 'plain' | 'code' | 'checklist' = 'plain') => {
    const templateData = {
      plain: { content: '', icon: '📝' },
      code: { content: '```javascript\n// Your code here\n```', icon: '💻' },
      checklist: { content: '- [ ] First task\n- [ ] Second task\n- [ ] Third task', icon: '✅' }
    }
    
    // Create a draft note (not saved to localStorage yet)
    const draftNote: Note = {
      id: generateId(),
      title: 'Untitled Note',
      content: templateData[template].content,
      color: '#ffffff',
      icon: templateData[template].icon,
      lastEdited: Date.now(),
      template: template
    }
    
    onCreateNote(draftNote)
  }

  const handleExport = (selectedNotes: Note[]) => {
    const dataStr = JSON.stringify(selectedNotes, null, 2)
    const blob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    
    const link = document.createElement('a')
    link.href = url
    link.download = `jotty-notes-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    URL.revokeObjectURL(url)
    setShowExportImport(false)
  }

  const handleImport = (importedNotes: Note[], resolutions?: ConflictResolution[]) => {
    const result = importNotes(importedNotes, resolutions)
    setShowExportImport(false)
    
    // Show success message with detailed results
    const messages = []
    if (result.imported > 0) messages.push(`${result.imported} imported`)
    if (result.overwritten > 0) messages.push(`${result.overwritten} overwritten`)
    if (result.skipped > 0) messages.push(`${result.skipped} skipped`)
    
    if (messages.length > 0) {
      alert(`Import completed: ${messages.join(', ')}`)
    } else {
      alert('No changes were made during import.')
    }
  }

  return (
    <div className="notes-list-container">
      <header className="app-header">
        <h1>Jotty</h1>
        <div className="header-actions">
          <button 
            className="export-import-btn"
            onClick={() => setShowExportImport(true)}
            title="Export/Import Notes"
          >
            📁
          </button>
          <button 
            className="theme-toggle"
            onClick={toggleTheme}
            title={`Switch to ${theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light'} mode`}
          >
            {theme === 'light' ? '🌙' : theme === 'dark' ? '🌓' : '☀️'}
          </button>
        </div>
      </header>

      <div className="toolbar">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search notes..."
            value={searchTerm}
            onInput={(e) => setSearchTerm((e.target as HTMLInputElement).value)}
            className="search-input"
          />
        </div>
        
        <div className="create-buttons">
          <button 
            className="create-btn primary"
            onClick={() => handleCreateNote('plain')}
          >
            📝 New Note
          </button>
          <button 
            className="create-btn"
            onClick={() => handleCreateNote('code')}
          >
            💻 Code
          </button>
          <button 
            className="create-btn"
            onClick={() => handleCreateNote('checklist')}
          >
            ✅ Checklist
          </button>
        </div>
      </div>

      <div className="notes-grid">
        {filteredNotes.length === 0 ? (
          <div className="empty-state">
            <p>No notes found</p>
            <button 
              className="create-btn primary"
              onClick={() => handleCreateNote('plain')}
            >
              Create your first note
            </button>
          </div>
        ) : (
          filteredNotes.map(note => (
            <NoteCard
              key={note.id}
              note={note}
              onSelect={onNoteSelect}
              onDelete={deleteNote}
              onDuplicate={duplicateNote}
            />
          ))
        )}
      </div>

      {showExportImport && (
        <ExportImportModal
          notes={notes}
          onClose={() => setShowExportImport(false)}
          onExport={handleExport}
          onImport={handleImport}
        />
      )}
    </div>
  )
}