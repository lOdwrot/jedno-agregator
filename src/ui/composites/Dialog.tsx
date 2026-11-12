import { cn } from "@/lib/cn";
import { Modal, type ModalBaseProps } from "./Modal";

const SIZES = { sm: "sm:max-w-md", md: "sm:max-w-xl", lg: "sm:max-w-3xl", xl: "sm:max-w-5xl" } as const;

export interface DialogProps extends ModalBaseProps {
  size?: keyof typeof SIZES;
}

/** Modal dialog (native <dialog>): focus trap, Esc/backdrop closes, focus restored, scroll locked. */
export function Dialog({ size = "md", ...rest }: DialogProps) {
  return <Modal kind="dialog" panelClassName={cn(SIZES[size])} {...rest} />;
}
