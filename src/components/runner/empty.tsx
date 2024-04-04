import { emit } from "@/lib/hooks/useMitt"
import clsx from "clsx"
import styled from "styled-components"

type EmptyRunnerProps = {
  className?: string
}
const ClickableLink = styled.a`
cursor: pointer;
text-decoration: underline;
`
export default function EmptyRunner(props: EmptyRunnerProps) {
  return (
    <div className={clsx(props.className, "h-full p-4 flex flex-col justify-center items-center")}>
      <div className="font-bold text-lg">No Test Case</div>
      <div>
        Use
        <ClickableLink target="__blank" href="https://github.com/jmerle/competitive-companion">
          {" "}
          Competitive Companion{" "}
        </ClickableLink>
        or <ClickableLink onClick={() => emit("fileMenu", "new")}> Create new file </ClickableLink> to continue
      </div>
    </div>
  )
}
