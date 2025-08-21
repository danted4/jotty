import { useState, useEffect } from 'preact/hooks'
import { Note } from '../types'
import { useNotes } from '../hooks/useNotes'
import { debounce } from '../utils/helpers'
import { CodeBlock } from './CodeBlock'
import { ColorPicker } from './ColorPicker'
import { IconPicker } from './IconPicker'
import { ImageUploader } from './ImageUploader'

interface NoteEditorProps {
  note: Note | null
  onBack: () => void
  isNewNote?: boolean
}

export function NoteEditor({ note, onBack, isNewNote = false }: NoteEditorProps) {
  const { updateNote, createNote } = useNotes()
  const [title, setTitle] = useState(note?.title || '')
  const [content, setContent] = useState(note?.content || '')
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [showIconPicker, setShowIconPicker] = useState(false)
  const [hasBeenSaved, setHasBeenSaved] = useState(!isNewNote)
  const [isPreviewMode, setIsPreviewMode] = useState(isNewNote ? false : true)

  useEffect(() => {
    if (note) {
      setTitle(note.title)
      setContent(note.content)
    }
  }, [note])

  const debouncedSave = debounce((updates: Partial<Note>) => {
    if (note) {
      if (isNewNote && !hasBeenSaved) {
        // For new notes, check if we have meaningful changes
        const hasContentChange = updates.content && updates.content.trim() !== '' && 
                                 updates.content.trim() !== note.content?.trim()
        const hasTitleChange = updates.title && updates.title.trim() !== '' && 
                              updates.title.trim() !== 'Untitled Note'
        
        if (hasContentChange || hasTitleChange) {
          // Save the note for the first time
          createNote(note.template, { ...note, ...updates })
          setHasBeenSaved(true)
        }
      } else if (hasBeenSaved) {
        // Update existing note
        updateNote(note.id, updates)
      }
    }
  }, 500)

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle)
    debouncedSave({ title: newTitle, content })
  }

  const handleContentChange = (newContent: string) => {
    // Process any new triple backticks when content changes
    const processedContent = processCodeBlocks(newContent)
    setContent(processedContent)
    debouncedSave({ title, content: processedContent })
  }

  const handleBackClick = () => {
    // Force save any pending changes before navigating away
    if (note) {
      if (isNewNote && !hasBeenSaved) {
        const hasContentChange = content && content.trim() !== '' && 
                                 content.trim() !== note.content?.trim()
        const hasTitleChange = title && title.trim() !== '' && 
                              title.trim() !== 'Untitled Note'
        
        if (hasContentChange || hasTitleChange) {
          createNote(note.template, { ...note, title, content })
        }
      } else if (hasBeenSaved) {
        updateNote(note.id, { title, content })
      }
    }
    onBack()
  }

  const processCodeBlocks = (text: string) => {
    // Process triple backticks and convert to code block markers
    // This will work even if there are existing markers in the text
    return text.replace(/```(\w*)\s*\n?([\s\S]*?)\n?\s*```/g, (match, lang, code) => {
      return `\n[CODE_BLOCK:${lang || 'javascript'}]\n${code.trim()}\n[/CODE_BLOCK]\n`
    })
  }

  const renderContent = (content: string) => {
    const parts = content.split(/(\[CODE_BLOCK:(\w+)\]\n[\s\S]*?\n\[\/CODE_BLOCK\])/g)
    
    return parts.map((part, index) => {
      const codeBlockMatch = part.match(/\[CODE_BLOCK:(\w+)\]\n([\s\S]*?)\n\[\/CODE_BLOCK\]/)
      if (codeBlockMatch) {
        const [fullMatch, language, code] = codeBlockMatch
        return (
          <CodeBlock
            key={`${index}-${language}-${code.slice(0, 10)}`}
            language={language}
            code={code}
            readOnly={isPreviewMode}
            onLanguageChange={(newLang) => {
              // Replace only this specific code block by targeting the exact match
              const newContent = content.replace(fullMatch, `[CODE_BLOCK:${newLang}]\n${code}\n[/CODE_BLOCK]`)
              setContent(newContent)
              debouncedSave({ title, content: newContent })
            }}
            onCodeChange={isPreviewMode ? undefined : (newCode) => {
              // Replace only this specific code block by targeting the exact match
              const newContent = content.replace(fullMatch, `[CODE_BLOCK:${language}]\n${newCode}\n[/CODE_BLOCK]`)
              setContent(newContent)
              debouncedSave({ title, content: newContent })
            }}
          />
        )
      }
      return part ? (
        <div key={index} className="text-content">
          {part.split('\n').map((line, lineIndex) => (
            <div key={lineIndex}>{line}</div>
          ))}
        </div>
      ) : null
    })
  }

  const handleColorChange = (color: string) => {
    if (note) {
      updateNote(note.id, { color })
      setShowColorPicker(false)
    }
  }

  const handleIconChange = (icon: string) => {
    if (note) {
      updateNote(note.id, { icon })
      setShowIconPicker(false)
    }
  }

  const handleImageUpload = (imageData: string) => {
    if (note) {
      updateNote(note.id, { image: imageData })
    }
  }

  if (!note) {
    return <div>No note selected</div>
  }

  return (
    <div className="note-editor-container">
      <header className="editor-header">
        <button className="back-btn" onClick={handleBackClick}>
          ← Back
        </button>
        
        <div className="editor-tools">
          <button 
            className="tool-btn"
            onClick={() => setShowIconPicker(!showIconPicker)}
            title="Change icon"
          >
            {note.icon}
          </button>
          
          <button 
            className="tool-btn color-btn"
            onClick={() => setShowColorPicker(!showColorPicker)}
            style={{ backgroundColor: note.color }}
            title="Change color"
          >
            🎨
          </button>
          
          <ImageUploader onImageUpload={handleImageUpload} />
        </div>
      </header>

      {showColorPicker && (
        <ColorPicker
          currentColor={note.color}
          onColorChange={handleColorChange}
          onClose={() => setShowColorPicker(false)}
        />
      )}

      {showIconPicker && (
        <IconPicker
          currentIcon={note.icon}
          onIconChange={handleIconChange}
          onClose={() => setShowIconPicker(false)}
        />
      )}

      <div 
        className="editor-content" 
        style={{ 
          backgroundColor: note.color === '#ffffff' ? 'var(--bg-secondary)' : note.color 
        }}
      >
        {note.image && (
          <div className="note-image">
            <img src={note.image} alt="Note attachment" />
          </div>
        )}
        
        <input
          type="text"
          className="note-title-input"
          value={title}
          onInput={(e) => handleTitleChange((e.target as HTMLInputElement).value)}
          placeholder="Note title..."
        />
        
        <div className="note-content-container">
          {isPreviewMode ? (
            <div className="note-content-rendered">
              {renderContent(content)}
            </div>
          ) : (
            <textarea
              className="note-content-input"
              value={content}
              onInput={(e) => handleContentChange((e.target as HTMLTextAreaElement).value)}
              placeholder="Start typing... Use ``` for code blocks"
              rows={20}
            />
          )}
          
          <button 
            className="toggle-edit-mode"
            onClick={() => {
              setIsPreviewMode(!isPreviewMode)
            }}
          >
            {isPreviewMode ? '✏️ Edit' : '👁️ Preview'}
          </button>
        </div>
      </div>
    </div>
  )
}