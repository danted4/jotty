import { useState } from 'preact/hooks'
import { NotesList } from './components/NotesList'
import { NoteEditor } from './components/NoteEditor'
import { ThemeProvider } from './hooks/useTheme'
import { Note } from './types'

export function App() {
  const [selectedNote, setSelectedNote] = useState<Note | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isNewNote, setIsNewNote] = useState(false)
  const handleNoteSelect = (note: Note) => {
    setSelectedNote(note)
    setIsEditing(true)
    setIsNewNote(false)
  }

  const handleCreateNote = (note: Note) => {
    setSelectedNote(note)
    setIsEditing(true)
    setIsNewNote(true)
  }

  const handleBackToList = () => {
    setSelectedNote(null)
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