interface NumericKeypadProps {
  value: string
  onChange: (value: string) => void
}

// Сумма хранится строкой ("12,50"), пока её набирают: так проще управлять
// запятой и ведущим нулём, чем гонять число туда-сюда через parseFloat.
export function NumericKeypad({ value, onChange }: NumericKeypadProps) {
  const pressDigit = (digit: string) => {
    if (value === '0') {
      onChange(digit)
      return
    }
    const commaIndex = value.indexOf(',')
    const hasTwoDecimals = commaIndex !== -1 && value.length - commaIndex - 1 >= 2
    if (hasTwoDecimals) return
    onChange(value + digit)
  }

  const pressComma = () => {
    if (value.includes(',')) return
    onChange(value + ',')
  }

  const pressBackspace = () => {
    onChange(value.length <= 1 ? '0' : value.slice(0, -1))
  }

  return (
    <div className="grid grid-cols-3 gap-px bg-slate-200 pb-[env(safe-area-inset-bottom)]">
      {['7', '8', '9', '4', '5', '6', '1', '2', '3'].map((digit) => (
        <KeypadButton key={digit} onClick={() => pressDigit(digit)}>
          {digit}
        </KeypadButton>
      ))}
      <KeypadButton onClick={pressComma}>,</KeypadButton>
      <KeypadButton onClick={() => pressDigit('0')}>0</KeypadButton>
      <KeypadButton onClick={pressBackspace} ariaLabel="Стереть">
        <BackspaceIcon />
      </KeypadButton>
    </div>
  )
}

interface KeypadButtonProps {
  onClick: () => void
  children: React.ReactNode
  ariaLabel?: string
}

function KeypadButton({ onClick, children, ariaLabel }: KeypadButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className="flex h-14 items-center justify-center bg-white text-2xl font-medium text-slate-900 active:bg-slate-100"
    >
      {children}
    </button>
  )
}

function BackspaceIcon() {
  return (
    <svg
      width="26"
      height="26"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    >
      <path d="M9 5h11a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H9l-6-7z" />
      <line x1="12" y1="10" x2="17" y2="15" />
      <line x1="17" y1="10" x2="12" y2="15" />
    </svg>
  )
}
