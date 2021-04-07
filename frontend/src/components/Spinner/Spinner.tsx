import "./Spinner.scss"
import React from "react"

type SpinnerProps = {
  style : React.CSSProperties,
  className: string
}

export default function Spinner(props: SpinnerProps) {

  return <div className={["Spinner", props.className].join(" ")} style={props.style}>
  </div>;
}
