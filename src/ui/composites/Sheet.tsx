import { Modal, type ModalBaseProps } from "./Modal";

export interface SheetProps extends ModalBaseProps {
  /** Desktop side the panel slides from (mobile is always a bottom sheet). Default "right". */
  side?: "right" | "left";
}

/** Bottom sheet on mobile, side panel from md up. Same a11y as Dialog. */
export function Sheet({ side = "right", ...rest }: SheetProps) {
  return <Modal kind="sheet" side={side} {...rest} />;
}
