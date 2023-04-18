const define = ({ event, method, view }: any) => {
  event("点击");
  method("弹出", () => {
    console.log("弹出");
  });
  view("PC", () => import("./component/Comp2"));
};

export default define;
