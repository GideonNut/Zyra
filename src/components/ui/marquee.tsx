import { cn } from "@/lib/utils"

interface MarqueeProps {
  className?: string
  reverse?: boolean
  pauseOnHover?: boolean
  children?: React.ReactNode
  vertical?: boolean
}

export function Marquee({
  className,
  reverse,
  pauseOnHover = false,
  children,
  vertical = false,
  ...props
}: MarqueeProps) {
  return (
    <div
      {...props}
      className={cn(
        "group flex overflow-hidden p-2 [--duration:40s] [--gap:1rem] [gap:var(--gap)]",
        {
          "flex-row": !vertical,
          "flex-col": vertical,
        },
        className
      )}
    >
      {reverse && (
        <div
          className={cn("flex shrink-0 justify-around [gap:var(--gap)]", {
            "animate-marquee-reverse flex-row": !vertical,
            "animate-marquee-reverse-vertical flex-col": vertical,
          })}
          style={
            {
              "--gap": "1rem",
            } as React.CSSProperties
          }
        >
          {children}
        </div>
      )}
      <div
        className={cn("flex shrink-0 justify-around [gap:var(--gap)]", {
          "animate-marquee flex-row": !vertical,
          "animate-marquee-vertical flex-col": vertical,
          "group-hover:[animation-play-state:paused]": pauseOnHover,
        })}
        style={
          {
            "--gap": "1rem",
          } as React.CSSProperties
        }
      >
        {children}
      </div>
      {!reverse && (
        <div
          className={cn("flex shrink-0 justify-around [gap:var(--gap)]", {
            "animate-marquee flex-row": !vertical,
            "animate-marquee-vertical flex-col": vertical,
            "group-hover:[animation-play-state:paused]": pauseOnHover,
          })}
          style={
            {
              "--gap": "1rem",
            } as React.CSSProperties
          }
        >
          {children}
        </div>
      )}
    </div>
  )
}

