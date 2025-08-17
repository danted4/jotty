import { useState } from 'preact/hooks'
import { Note } from '../types'
import { formatDate } from '../utils/helpers'
import { DuplicateResolutionModal, DuplicateConflict, ConflictResolution } from './DuplicateResolutionModal'

interface ExportImportModalProps {
  notes: Note[]
  onClose: () => void
  onExport: (selectedNotes: Note[]) => void
  onImport: (notes: Note[], resolutions?: ConflictResolution[]) => void
}

export function ExportImportModal({ notes, onClose, onExport, onImport }: ExportImportModalProps) {
  const [activeTab, setActiveTab] = useState<'export' | 'import'>('export')
  const [selectedNotes, setSelectedNotes] = useState<Set<string>>(new Set())
  const [importError, setImportError] = useState<string | null>(null)
  const [pendingImport, setPendingImport] = useState<Note[] | null>(null)
  const [duplicateConflicts, setDuplicateConflicts] = useState<DuplicateConflict[]>([])
  const [showDuplicateResolution, setShowDuplicateResolution] = useState(false)

  const handleSelectAll = () => {
    if (selectedNotes.size === notes.length) {
      setSelectedNotes(new Set())
    } else {
      setSelectedNotes(new Set(notes.map(note => note.id)))
    }
  }

  const handleNoteToggle = (noteId: string) => {
    const newSelected = new Set(selectedNotes)
    if (newSelected.has(noteId)) {
      newSelected.delete(noteId)
    } else {
      newSelected.add(noteId)
    }
    setSelectedNotes(newSelected)
  }

  const handleExport = () => {
    const notesToExport = notes.filter(note => selectedNotes.has(note.id))
    onExport(notesToExport)
  }

  const handleFileImport = async (event: Event) => {
    const target = event.target as HTMLInputElement
    const file = target.files?.[0]
    
    if (!file) return
    
    try {
      const text = await file.text()
      const importedNotes = JSON.parse(text) as Note[]
      
      // Validate the imported data
      if (!Array.isArray(importedNotes)) {
        throw new Error('Invalid file format: Expected an array of notes')
      }
      
      // Validate each note has required fields
      for (const note of importedNotes) {
        if (!note.id || note.title === undefined || note.content === undefined) {
          throw new Error('Invalid note format: Missing required fields')
        }
      }
      
      // Check for duplicates
      const existingNoteIds = new Set(notes.map(note => note.id))
      const conflicts: DuplicateConflict[] = []
      
      for (const importedNote of importedNotes) {
        if (existingNoteIds.has(importedNote.id)) {
          const existingNote = notes.find(note => note.id === importedNote.id)!
          conflicts.push({
            importedNote,
            existingNote
          })
        }
      }
      
      if (conflicts.length > 0) {
        // Show duplicate resolution modal
        setPendingImport(importedNotes)
        setDuplicateConflicts(conflicts)
        setShowDuplicateResolution(true)
      } else {
        // No conflicts, import directly
        onImport(importedNotes)
      }
      
      setImportError(null)
    } catch (error) {
      setImportError(error instanceof Error ? error.message : 'Failed to import notes')
    }
    
    // Reset file input
    target.value = ''
  }

  const handleDuplicateResolution = (resolutions: ConflictResolution[]) => {
    if (pendingImport) {
      onImport(pendingImport, resolutions)
    }
    setShowDuplicateResolution(false)
    setPendingImport(null)
    setDuplicateConflicts([])
  }

  const handleCancelDuplicateResolution = () => {
    setShowDuplicateResolution(false)
    setPendingImport(null)
    setDuplicateConflicts([])
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content export-import-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Export/Import Notes</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="modal-tabs">
          <button 
            className={`tab-btn ${activeTab === 'export' ? 'active' : ''}`}
            onClick={() => setActiveTab('export')}
          >
            📤 Export
          </button>
          <button 
            className={`tab-btn ${activeTab === 'import' ? 'active' : ''}`}
            onClick={() => setActiveTab('import')}
          >
            📥 Import
          </button>
        </div>

        {activeTab === 'export' ? (
          <div className="export-section">
            <div className="export-header">
              <p>Select notes to export ({selectedNotes.size} of {notes.length} selected)</p>
              <button 
                className="select-all-btn"
                onClick={handleSelectAll}
              >
                {selectedNotes.size === notes.length ? 'Deselect All' : 'Select All'}
              </button>
            </div>

            <div className="notes-selection-list">
              {notes.map(note => (
                <label key={note.id} className="note-selection-item">
                  <input
                    type="checkbox"
                    checked={selectedNotes.has(note.id)}
                    onChange={() => handleNoteToggle(note.id)}
                  />
                  <div className="note-selection-info">
                    <span className="note-icon">{note.icon}</span>
                    <div className="note-details">
                      <div className="note-title">{note.title || 'Untitled'}</div>
                      <div className="note-meta">
                        {note.template} • {formatDate(note.lastEdited)}
                      </div>
                    </div>
                  </div>
                </label>
              ))}
            </div>

            <div className="export-actions">
              <button 
                className="export-btn primary"
                onClick={handleExport}
                disabled={selectedNotes.size === 0}
              >
                Export Selected Notes ({selectedNotes.size})
              </button>
            </div>
          </div>
        ) : (
          <div className="import-section">
            <div className="import-info">
              <p>Import notes from a JSON file. This will add the imported notes to your existing collection.</p>
              <p className="import-warning">ℹ️ If duplicate notes are found, you'll be able to choose how to handle them.</p>
            </div>

            <div className="file-input-container">
              <input
                type="file"
                accept=".json"
                onChange={handleFileImport}
                className="file-input"
                id="import-file"
              />
              <label htmlFor="import-file" className="file-input-label">
                📁 Choose JSON File
              </label>
            </div>

            {importError && (
              <div className="import-error">
                <strong>Import Error:</strong> {importError}
              </div>
            )}

            <div className="import-help">
              <h4>Expected JSON Format:</h4>
              <pre className="json-example">
{`[
  {
    "id": "unique-id",
    "title": "Note Title",
    "content": "Note content...",
    "color": "#ffffff",
    "icon": "📝",
    "template": "plain",
    "lastEdited": 1234567890
  }
]`}
              </pre>
            </div>
          </div>
        )}

        {showDuplicateResolution && (
          <DuplicateResolutionModal
            conflicts={duplicateConflicts}
            onResolve={handleDuplicateResolution}
            onCancel={handleCancelDuplicateResolution}
          />
        )}
      </div>
    </div>
  )
}