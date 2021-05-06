import "./Spinner.scss"
import React from "react"

interface SpinnerProps {
  style? : React.CSSProperties,
  className?: string,
  absCenter?: boolean
}

export default function Spinner(props: SpinnerProps) {
  const classNames = ["Spinner", props.className, props.absCenter && "absolute-center"].filter(v => v).join(" ")
  return <div className={classNames} style={props.style}>
  </div>;
}
