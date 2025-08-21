import { useState, useEffect } from 'preact/hooks'
import { NotesList } from './components/NotesList'
import { NoteEditor } from './components/NoteEditor'
import { ThemeProvider } from './hooks/useTheme'
import { useNotes } from './hooks/useNotes'
import { Note } from './types'

export function App() {
  const { notes } = useNotes()
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null)
  const [temporaryNote, setTemporaryNote] = useState<Note | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isNewNote, setIsNewNote] = useState(false)
  
  // Get the current version of the selected note from the global state
  // Use temporary note as fallback if note isn't found in global state yet
  const selectedNote = selectedNoteId 
    ? notes.find(note => note.id === selectedNoteId) || temporaryNote
    : null
  const handleNoteSelect = (note: Note) => {
    setSelectedNoteId(note.id)
    setTemporaryNote(note) // Keep the note reference until we're sure it's in the global state
    setIsEditing(true)
    setIsNewNote(false)
  }

  const handleCreateNote = (note: Note) => {
    setSelectedNoteId(note.id)
    setTemporaryNote(note)
    setIsEditing(true)
    setIsNewNote(true)
  }

  const handleBackToList = () => {
    setSelectedNoteId(null)
    setTemporaryNote(null)
    setIsEditing(false)
    setIsNewNote(false)
  }

  return (
    <ThemeProvider>
      <div className="app">
        {!isEditing ? (
          <NotesList onNoteSelect={handleNoteSelect} onCreateNote={handleCreateNote} />
        ) : (
          <NoteEditor 
            note={selectedNote} 
            onBack={handleBackToList}
            isNewNote={isNewNote}
          />
        )}
      </div>
    </ThemeProvider>
  )
}