export function ThemeSwitcher() {
  return (
    <div className="flex items-center gap-2">
      <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
        🌞 Light
      </button>
      <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
        🌙 Dark
      </button>
    </div>
  )
} 