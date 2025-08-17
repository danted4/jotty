interface IconPickerProps {
  currentIcon: string
  onIconChange: (icon: string) => void
  onClose: () => void
}

const AVAILABLE_ICONS = [
  '📝', '📄', '📋', '📌', '📍', '📎', '📚', '📖',
  '💡', '💻', '💾', '🔍', '🔧', '🔨', '⚡', '⭐',
  '❤️', '💯', '🎯', '🎨', '🎭', '🎪', '🎵', '🎸',
  '🚀', '🌟', '🌙', '☀️', '🌈', '🌸', '🌺', '🌻',
  '✅', '❌', '⚠️', '💰', '🎁', '🏆', '🔑', '📊',
  '📈', '📉', '📅', '⏰', '🍕', '☕', '🍎', '🎂'
]

export function IconPicker({ currentIcon, onIconChange, onClose }: IconPickerProps) {
  return (
    <div className="icon-picker-overlay" onClick={onClose}>
      <div className="icon-picker" onClick={(e) => e.stopPropagation()}>
        <div className="icon-picker-header">
          <h3>Choose Icon</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="icon-grid">
          {AVAILABLE_ICONS.map(icon => (
            <button
              key={icon}
              className={`icon-option ${currentIcon === icon ? 'selected' : ''}`}
              onClick={() => onIconChange(icon)}
            >
              {icon}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}