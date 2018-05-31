import React from "react";

// HACK: some of our components need a profile, but there's no easy way to just
// wait for the damned thing to be ready in the redux state.
export function waitForProfile(Component) {
  return function({ isLoading, ...props }) {
    if (props.profile.isEmpty || props.profile.isFetching) {
      return null;
    }
    return <Component {...props} />;
  };
}
