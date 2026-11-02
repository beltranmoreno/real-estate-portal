import { cn } from '@/lib/utils'

/** Text from Studio split into paragraphs on blank lines; single line breaks are kept. */
export function Paragraphs({ text, className }: { text: string; className?: string }) {
  return (
    <>
      {text
        .split(/\n\s*\n/)
        .map((p) => p.trim())
        .filter(Boolean)
        .map((p, i) => (
          <p key={i} className={cn('whitespace-pre-line', className)}>
            {p}
          </p>
        ))}
    </>
  )
}
