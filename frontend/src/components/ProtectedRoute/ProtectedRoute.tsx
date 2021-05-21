import { RouteProps } from "react-router";
import { Route, Redirect } from "react-router-dom";
import auth from "../../auth";
import useProfileInfo from "../../hooks/useProfileInfo";
type ProtectedRouteProps = RouteProps & {
  redirectPath?: string;
  shouldRender?: boolean;
};

export default function ProtectedRoute({
  component: Component,
  render,
  redirectPath = "/login",
  shouldRender,
  children,
  path,
  ...restProps
}: ProtectedRouteProps) {
  const { profile } = useProfileInfo();
  return (
    <Route
      path={profile ? path : "fdsafdsf"}
      {...restProps}
      render={(props) => {
        if (shouldRender ?? auth.currentUser()) {
          return Component ? (
            <Component {...props} />
          ) : render ? (
            render(props)
          ) : (
            children
          );
        } else {
          return <Redirect exact to={redirectPath} />;
        }
      }}
    />
  );
}
