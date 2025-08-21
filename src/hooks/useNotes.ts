import { useLocalStorage } from './useLocalStorage'
import { Note, NoteTemplate } from '../types'
import { generateId } from '../utils/helpers'
import type { ConflictResolution } from '../components/DuplicateResolutionModal'

const DEFAULT_TEMPLATES: Record<string, NoteTemplate> = {
  plain: {
    type: 'plain',
    name: 'Plain Note',
    content: '',
    icon: '📝'
  },
  code: {
    type: 'code',
    name: 'Code Note',
    content: '```javascript\n// Your code here\n```',
    icon: '💻'
  },
  checklist: {
    type: 'checklist',
    name: 'Checklist Note',
    content: '- [ ] First task\n- [ ] Second task\n- [ ] Third task',
    icon: '✅'
  }
}

export function useNotes() {
  const [notes, setNotes] = useLocalStorage<Note[]>('jotty-notes', [])

  const createNote = (template: 'plain' | 'code' | 'checklist' = 'plain', noteData?: Partial<Note>) => {
    const templateData = DEFAULT_TEMPLATES[template]
    const newNote: Note = {
      id: generateId(),
      title: 'Untitled Note',
      content: templateData.content,
      color: '#ffffff',
      icon: templateData.icon,
      lastEdited: Date.now(),
      template: template,
      ...noteData
    }
    
    setNotes(prevNotes => [newNote, ...prevNotes])
    return newNote
  }

  const updateNote = (id: string, updates: Partial<Note>) => {
    setNotes(prevNotes =>
      prevNotes.map(note =>
        note.id === id
          ? { ...note, ...updates, lastEdited: Date.now() }
          : note
      )
    )
  }

  const deleteNote = (id: string) => {
    setNotes(prevNotes => prevNotes.filter(note => note.id !== id))
  }

  const duplicateNote = (id: string) => {
    const noteToClone = notes.find(note => note.id === id)
    if (noteToClone) {
      const duplicatedNote: Note = {
        ...noteToClone,
        id: generateId(),
        title: `${noteToClone.title} (Copy)`,
        lastEdited: Date.now()
      }
      setNotes(prevNotes => [duplicatedNote, ...prevNotes])
      return duplicatedNote
    }
  }

  const getNoteById = (id: string) => {
    return notes.find(note => note.id === id)
  }

  const importNotes = (importedNotes: Note[], resolutions?: ConflictResolution[]) => {
    let imported = 0
    let overwritten = 0
    let skipped = 0
    
    if (!resolutions) {
      // No conflicts - import all new notes
      const existingIds = new Set(notes.map(note => note.id))
      const newNotes = importedNotes.filter(note => !existingIds.has(note.id))
      
      if (newNotes.length > 0) {
        setNotes(prevNotes => [...newNotes, ...prevNotes])
      }
      
      return {
        imported: newNotes.length,
        overwritten: 0,
        skipped: importedNotes.length - newNotes.length
      }
    }
    
    // Handle conflicts according to resolutions
    const resolutionMap = new Map(resolutions.map(r => [r.noteId, r.action]))
    const existingIds = new Set(notes.map(note => note.id))
    
    setNotes(prevNotes => {
      let updatedNotes = [...prevNotes]
      
      for (const importedNote of importedNotes) {
        const hasConflict = existingIds.has(importedNote.id)
        
        if (hasConflict) {
          const resolution = resolutionMap.get(importedNote.id)
          
          switch (resolution) {
            case 'overwrite':
              // Replace existing note
              updatedNotes = updatedNotes.map(note => 
                note.id === importedNote.id ? importedNote : note
              )
              overwritten++
              break
              
            case 'saveAsNew':
              // Create new note with new ID
              const newNote = { ...importedNote, id: generateId() }
              updatedNotes.unshift(newNote)
              imported++
              break
              
            case 'skip':
            default:
              // Do nothing
              skipped++
              break
          }
        } else {
          // No conflict, add normally
          updatedNotes.unshift(importedNote)
          imported++
        }
      }
      
      return updatedNotes
    })
    
    return {
      imported,
      overwritten,
      skipped
    }
  }

  const sortedNotes = notes.sort((a, b) => a.title.localeCompare(b.title))

  return {
    notes: sortedNotes,
    createNote,
    updateNote,
    deleteNote,
    duplicateNote,
    getNoteById,
    importNotes
  }
}