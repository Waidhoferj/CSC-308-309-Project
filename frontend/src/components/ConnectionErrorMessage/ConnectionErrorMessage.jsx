import "./ConnectionErrorMessage.scss";
import { useHistory } from "react-router-dom";
import { AlertCircle } from "react-feather";

export default function ConnectionErrorMessage({ children }) {
  const { goBack } = useHistory();

  return (
    <div className="error-message">
      <AlertCircle size={35} />
      <p>{children}</p>
      <button onClick={goBack}>Go Back</button>
    </div>
  );
}
