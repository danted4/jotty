import { useRef, useState } from 'preact/hooks'
import { fileToBase64, validateImageSize } from '../utils/helpers'

interface ImageUploaderProps {
  onImageUpload: (imageData: string) => void
}

export function ImageUploader({ onImageUpload }: ImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFileSelect = async (e: Event) => {
    const target = e.target as HTMLInputElement
    const file = target.files?.[0]
    
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file')
      return
    }

    setIsUploading(true)
    setError(null)

    try {
      const base64 = await fileToBase64(file)
      
      if (!validateImageSize(base64, 5)) {
        setError('Image too large. Please choose an image smaller than 5MB.')
        setIsUploading(false)
        return
      }

      onImageUpload(base64)
      setIsUploading(false)
      
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (err) {
      setError('Failed to upload image. Please try again.')
      setIsUploading(false)
    }
  }

  const triggerFileSelect = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="image-uploader">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />
      
      <button
        className="tool-btn"
        onClick={triggerFileSelect}
        disabled={isUploading}
        title="Upload image"
      >
        {isUploading ? '⏳' : '🖼️'}
      </button>
      
      {error && (
        <div className="upload-error">
          {error}
        </div>
      )}
    </div>
  )
}