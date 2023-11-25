import Editor from "../editor"

type AdditionMessageProps = {
  checkReport: string
  stderrLog: string
}
export default function AdditionMessage(props: AdditionMessageProps) {
  return (
    <div>
      <span className="text-sm">Stderr:</span>
      <Editor className="min-w-0 m-2" kernel="codemirror" text={props.stderrLog} editable={false} />
      <span className="text-sm">Checker Report:</span>
      <Editor className="min-w-0 m-2" kernel="codemirror" text={props.checkReport} editable={false} />
    </div>
  )
}
