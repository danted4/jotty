import { useState } from 'preact/hooks'

interface ColorPickerProps {
  currentColor: string
  onColorChange: (color: string) => void
  onClose: () => void
}

const PRESET_COLORS = [
  '#ffffff', '#f8f9fa', '#e9ecef', '#dee2e6',
  '#ffeaa7', '#fdcb6e', '#e17055', '#d63031',
  '#fab1a0', '#e84393', '#a29bfe', '#6c5ce7',
  '#74b9ff', '#0984e3', '#00b894', '#00cec9',
  '#55a3ff', '#5f27cd', '#00d2d3', '#ff9ff3',
  '#54a0ff', '#2e86de', '#f368e0', '#ff3838'
]

export function ColorPicker({ currentColor, onColorChange, onClose }: ColorPickerProps) {
  const [customColor, setCustomColor] = useState(currentColor)

  const handlePresetClick = (color: string) => {
    onColorChange(color)
  }

  const handleCustomColorChange = (color: string) => {
    setCustomColor(color)
    onColorChange(color)
  }

  return (
    <div className="color-picker-overlay" onClick={onClose}>
      <div className="color-picker" onClick={(e) => e.stopPropagation()}>
        <div className="color-picker-header">
          <h3>Choose Color</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="preset-colors">
          <h4>Preset Colors</h4>
          <div style={{ overflowY: 'auto', maxHeight: '300px' }}>
            <div className="color-grid">
              {PRESET_COLORS.map(color => (
                <button
                  key={color}
                  className={`color-swatch ${currentColor === color ? 'selected' : ''}`}
                  style={{ backgroundColor: color }}
                  onClick={() => handlePresetClick(color)}
                  title={color}
                />
              ))}
            </div>
          </div>
        </div>
        
        <div className="custom-color">
          <h4>Custom Color</h4>
          <div className="custom-color-input">
            <input
              type="color"
              value={customColor}
              onInput={(e) => handleCustomColorChange((e.target as HTMLInputElement).value)}
            />
            <input
              type="text"
              value={customColor}
              onInput={(e) => handleCustomColorChange((e.target as HTMLInputElement).value)}
              placeholder="#ffffff"
              pattern="^#[0-9A-Fa-f]{6}$"
            />
          </div>
        </div>
      </div>
    </div>
  )
}