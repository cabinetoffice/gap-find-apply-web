type InferProps<T extends (args: any) => any> = Extract<
  Awaited<ReturnType<T>>,
  { props: any }
>['props'];

export default InferProps;
