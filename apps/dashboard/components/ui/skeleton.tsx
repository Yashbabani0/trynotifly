import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: Omit<React.HTMLAttributes<HTMLDivElement>, "ref">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("animate-pulse rounded-xl bg-muted", className)}
      {...props}
    />
  )
}

export { Skeleton }
