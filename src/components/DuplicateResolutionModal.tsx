import { useState } from 'preact/hooks'
import { Note } from '../types'
import { formatDate, truncateText } from '../utils/helpers'

export interface DuplicateConflict {
  importedNote: Note
  existingNote: Note
}

export interface ConflictResolution {
  action: 'overwrite' | 'saveAsNew' | 'skip'
  noteId: string
}

interface DuplicateResolutionModalProps {
  conflicts: DuplicateConflict[]
  onResolve: (resolutions: ConflictResolution[]) => void
  onCancel: () => void
}

export function DuplicateResolutionModal({ conflicts, onResolve, onCancel }: DuplicateResolutionModalProps) {
  const [resolutions, setResolutions] = useState<Map<string, ConflictResolution['action']>>(
    new Map(conflicts.map(conflict => [conflict.importedNote.id, 'skip']))
  )

  const handleResolutionChange = (noteId: string, action: ConflictResolution['action']) => {
    const newResolutions = new Map(resolutions)
    newResolutions.set(noteId, action)
    setResolutions(newResolutions)
  }

  const handleApplyToAll = (action: ConflictResolution['action']) => {
    const newResolutions = new Map()
    conflicts.forEach(conflict => {
      newResolutions.set(conflict.importedNote.id, action)
    })
    setResolutions(newResolutions)
  }

  const handleResolve = () => {
    const resolutionsList: ConflictResolution[] = conflicts.map(conflict => ({
      action: resolutions.get(conflict.importedNote.id) || 'skip',
      noteId: conflict.importedNote.id
    }))
    onResolve(resolutionsList)
  }

  const getActionCounts = () => {
    const counts = { overwrite: 0, saveAsNew: 0, skip: 0 }
    resolutions.forEach(action => {
      counts[action]++
    })
    return counts
  }

  const actionCounts = getActionCounts()

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content duplicate-resolution-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Resolve Duplicate Notes</h2>
          <button className="close-btn" onClick={onCancel}>×</button>
        </div>

        <div className="duplicate-info">
          <p>Found {conflicts.length} notes with matching IDs. Choose how to handle each conflict:</p>
          
          <div className="bulk-actions">
            <span>Apply to all:</span>
            <button 
              className="bulk-action-btn overwrite"
              onClick={() => handleApplyToAll('overwrite')}
            >
              🔄 Overwrite All
            </button>
            <button 
              className="bulk-action-btn save-new"
              onClick={() => handleApplyToAll('saveAsNew')}
            >
              ➕ Save All as New
            </button>
            <button 
              className="bulk-action-btn skip"
              onClick={() => handleApplyToAll('skip')}
            >
              ⏭️ Skip All
            </button>
          </div>
        </div>

        <div className="conflicts-list">
          {conflicts.map(conflict => {
            const currentAction = resolutions.get(conflict.importedNote.id) || 'skip'
            
            return (
              <div key={conflict.importedNote.id} className="conflict-item">
                <div className="conflict-header">
                  <h3>Duplicate Note Found</h3>
                  <div className="conflict-actions">
                    <label className={`action-option ${currentAction === 'overwrite' ? 'selected' : ''}`}>
                      <input
                        type="radio"
                        name={`action-${conflict.importedNote.id}`}
                        value="overwrite"
                        checked={currentAction === 'overwrite'}
                        onChange={() => handleResolutionChange(conflict.importedNote.id, 'overwrite')}
                      />
                      🔄 Overwrite
                    </label>
                    <label className={`action-option ${currentAction === 'saveAsNew' ? 'selected' : ''}`}>
                      <input
                        type="radio"
                        name={`action-${conflict.importedNote.id}`}
                        value="saveAsNew"
                        checked={currentAction === 'saveAsNew'}
                        onChange={() => handleResolutionChange(conflict.importedNote.id, 'saveAsNew')}
                      />
                      ➕ Save as New
                    </label>
                    <label className={`action-option ${currentAction === 'skip' ? 'selected' : ''}`}>
                      <input
                        type="radio"
                        name={`action-${conflict.importedNote.id}`}
                        value="skip"
                        checked={currentAction === 'skip'}
                        onChange={() => handleResolutionChange(conflict.importedNote.id, 'skip')}
                      />
                      ⏭️ Skip
                    </label>
                  </div>
                </div>

                <div className="conflict-comparison">
                  <div className="note-version existing">
                    <h4>Existing Note</h4>
                    <div className="note-preview">
                      <div className="note-header">
                        <span className="note-icon">{conflict.existingNote.icon}</span>
                        <span className="note-title">{conflict.existingNote.title || 'Untitled'}</span>
                      </div>
                      <div className="note-content">
                        {truncateText(conflict.existingNote.content, 100)}
                      </div>
                      <div className="note-meta">
                        {conflict.existingNote.template} • {formatDate(conflict.existingNote.lastEdited)}
                      </div>
                    </div>
                  </div>

                  <div className="vs-divider">VS</div>

                  <div className="note-version imported">
                    <h4>Imported Note</h4>
                    <div className="note-preview">
                      <div className="note-header">
                        <span className="note-icon">{conflict.importedNote.icon}</span>
                        <span className="note-title">{conflict.importedNote.title || 'Untitled'}</span>
                      </div>
                      <div className="note-content">
                        {truncateText(conflict.importedNote.content, 100)}
                      </div>
                      <div className="note-meta">
                        {conflict.importedNote.template} • {formatDate(conflict.importedNote.lastEdited)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <div className="resolution-summary">
          <div className="action-summary">
            <span>Summary: </span>
            {actionCounts.overwrite > 0 && <span className="count overwrite">{actionCounts.overwrite} to overwrite</span>}
            {actionCounts.saveAsNew > 0 && <span className="count save-new">{actionCounts.saveAsNew} to save as new</span>}
            {actionCounts.skip > 0 && <span className="count skip">{actionCounts.skip} to skip</span>}
          </div>
          
          <div className="resolution-actions">
            <button className="cancel-btn" onClick={onCancel}>
              Cancel Import
            </button>
            <button className="apply-btn" onClick={handleResolve}>
              Apply Resolutions
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}