import { Note } from '../types'
import { formatDate, truncateText } from '../utils/helpers'

interface NoteCardProps {
  note: Note
  onSelect: (note: Note) => void
  onDelete: (id: string) => void
  onDuplicate: (id: string) => void
}

export function NoteCard({ note, onSelect, onDelete, onDuplicate }: NoteCardProps) {
  const handleDelete = (e: Event) => {
    e.stopPropagation()
    if (confirm('Are you sure you want to delete this note?')) {
      onDelete(note.id)
    }
  }

  const handleDuplicate = (e: Event) => {
    e.stopPropagation()
    onDuplicate(note.id)
  }

  const getContentPreview = () => {
    // Replace both raw triple backticks and processed code blocks with [Code Block]
    const content = note.content
      .replace(/```[\s\S]*?```/g, '[Code Block]')
      .replace(/\[CODE_BLOCK:[\w+]*\][\s\S]*?\[\/CODE_BLOCK\]/g, '[Code Block]')
    return truncateText(content, 120)
  }

  return (
    <div 
      className="note-card"
      style={{ 
        backgroundColor: note.color === '#ffffff' ? 'var(--bg-secondary)' : note.color 
      }}
      onClick={() => onSelect(note)}
    >
      <div className="note-card-header">
        <span className="note-icon">{note.icon}</span>
        <h3 className="note-title">{note.title || 'Untitled'}</h3>
        <div className="note-actions">
          <button 
            className="action-btn duplicate"
            onClick={handleDuplicate}
            title="Duplicate note"
          >
            📋
          </button>
          <button 
            className="action-btn delete"
            onClick={handleDelete}
            title="Delete note"
          >
            🗑️
          </button>
        </div>
      </div>
      
      <div className="note-content-preview">
        {getContentPreview()}
      </div>
      
      <div className="note-footer">
        <span className="note-template">{note.template}</span>
        <span className="note-date">{formatDate(note.lastEdited)}</span>
      </div>
    </div>
  )
}