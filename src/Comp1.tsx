import React from "react";
const Msg = React.lazy(() => import("./Msg"));

const Button = ({ element }: any) => {
  return (
    <button
      onClick={() => {
        element.trigger("点击");
      }}
    >
      <Msg />
      {element.config.children}
    </button>
  );
};

export default Button;
