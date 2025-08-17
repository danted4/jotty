import { useState, useEffect } from 'preact/hooks'
import Prism from 'prismjs'
import 'prismjs/components/prism-javascript'
import 'prismjs/components/prism-typescript'
import 'prismjs/components/prism-python'
import 'prismjs/components/prism-css'
import 'prismjs/components/prism-json'
import 'prismjs/components/prism-bash'
import 'prismjs/components/prism-markup'

interface CodeBlockProps {
  language: string
  code: string
  onLanguageChange?: (language: string) => void
  onCodeChange?: (code: string) => void
  readOnly?: boolean
}

const SUPPORTED_LANGUAGES = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python', label: 'Python' },
  { value: 'css', label: 'CSS' },
  { value: 'html', label: 'HTML' },
  { value: 'json', label: 'JSON' },
  { value: 'bash', label: 'Bash' },
  { value: 'plaintext', label: 'Plain Text' }
]

export function CodeBlock({ 
  language, 
  code, 
  onLanguageChange, 
  onCodeChange, 
  readOnly = false 
}: CodeBlockProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [highlightedCode, setHighlightedCode] = useState('')

  useEffect(() => {
    const highlight = () => {
      try {
        if (language === 'plaintext' || !Prism.languages[language]) {
          setHighlightedCode(code)
          return
        }
        const highlighted = Prism.highlight(code, Prism.languages[language], language)
        setHighlightedCode(highlighted)
      } catch (error) {
        setHighlightedCode(code)
      }
    }

    highlight()
  }, [code, language])

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(code)
    } catch (error) {
      console.error('Failed to copy code:', error)
    }
  }

  return (
    <div className="code-block">
      <div className="code-block-header">
        <select 
          value={language}
          onChange={(e) => onLanguageChange?.((e.target as HTMLSelectElement).value)}
          className="language-selector"
          disabled={readOnly}
        >
          {SUPPORTED_LANGUAGES.map(lang => (
            <option key={lang.value} value={lang.value}>
              {lang.label}
            </option>
          ))}
        </select>
        
        <div className="code-actions">
          <button 
            className="code-action-btn"
            onClick={copyToClipboard}
            title="Copy code"
          >
            📋
          </button>
          <button 
            className="code-action-btn"
            onClick={() => setIsExpanded(!isExpanded)}
            title={isExpanded ? 'Collapse' : 'Expand'}
          >
            {isExpanded ? '📉' : '📈'}
          </button>
        </div>
      </div>
      
      <div className={`code-content ${isExpanded ? 'expanded' : ''}`}>
        {readOnly ? (
          <pre className="code-display">
            <code 
              className={`language-${language}`}
              dangerouslySetInnerHTML={{ __html: highlightedCode }}
            />
          </pre>
        ) : (
          <textarea
            className="code-editor"
            value={code}
            onInput={(e) => onCodeChange?.((e.target as HTMLTextAreaElement).value)}
            placeholder="Enter your code here..."
            spellcheck={false}
          />
        )}
      </div>
    </div>
  )
}