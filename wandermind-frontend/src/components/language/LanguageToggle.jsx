import { useTripStore } from '../../store/tripStore'

const LANGUAGES = [
  { code: 'en', label: 'EN' },
  { code: 'hi', label: 'हिं' },
  { code: 'hinglish', label: 'Hi-En' },
]

export default function LanguageToggle() {
  const language = useTripStore((s) => s.language)
  const setLanguage = useTripStore((s) => s.setLanguage)

  return (
    <div className="flex items-center rounded-full bg-gray-100 p-0.5" title="Response language">
      {LANGUAGES.map((lang) => (
        <button
          key={lang.code}
          onClick={() => setLanguage(lang.code)}
          className={`px-2.5 py-1 rounded-full text-sm font-medium transition-all ${
            language === lang.code
              ? 'bg-blue-600 text-white'
              : 'text-gray-700 hover:text-gray-700'
          }`}
        >
          {lang.label}
        </button>
      ))}
    </div>
  )
}
