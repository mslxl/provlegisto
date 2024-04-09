import Editor from "../editor"

type AdditionMessageProps = {
  checkReport: string
  stderrLog: string
}
export default function AdditionMessage(props: AdditionMessageProps) {
  return (
    <div>
      <span className="text-sm">Stderr:</span>
      <Editor className="min-w-0 p-2" text={props.stderrLog}/>
      <span className="text-sm">Checker Report:</span>
      <Editor className="min-w-0 p-2" text={props.checkReport} />
    </div>
  )
}
