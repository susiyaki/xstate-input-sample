import { ComponentProps } from "react";

type Props = Pick<
  ComponentProps<"input">,
  "onChange" | "onBlur" | "onFocus" | "id" | "type" | "value"
> & {
  isDisabled: boolean;
};

export const XStateInput = ({ isDisabled, ...props }: Props) => {
  return <input {...props} disabled={isDisabled} />;
};
