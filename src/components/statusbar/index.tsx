import clsx from "clsx"

type StatusBarProps = {
  className?: string
}
export default function StatusBar(props: StatusBarProps) {
  const { className } = props

  return <div className={clsx(className, "bg-blue-500")}></div>
}
