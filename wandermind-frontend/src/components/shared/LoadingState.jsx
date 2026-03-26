export default function LoadingState({ text = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-4">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full border-2 border-blue-600/20" />
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-blue-600 animate-spin" />
      </div>
      <p className="text-sm text-gray-700">{text}</p>
    </div>
  )
}
