import React from "react";
import { map } from "lodash";
const Msg = React.lazy(() => import("./Msg"));

const data = [1, 2, 3];
const Button = ({ element }: any) => {
  const a = map(data, (item) => 1 + 1).join(",");
  return (
    <button
      onClick={() => {
        element.trigger("点击");
      }}
    >
      <Msg />
      {element.config.children}
      {a}
    </button>
  );
};

export default Button;
