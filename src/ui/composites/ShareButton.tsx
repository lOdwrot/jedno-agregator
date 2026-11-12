import { Icon } from "../icons";
import { Button, type ButtonProps } from "../primitives/Button";
import { useToast } from "./toast-context";

export interface ShareButtonProps extends Omit<ButtonProps, "onClick" | "to" | "href"> {
  title: string;
  text?: string;
  /** Defaults to the current page URL. */
  url?: string;
}

/** Uses the Web Share API when present, otherwise copies the link and shows a toast. Needs ToastProvider. */
export function ShareButton({ title, text, url, children, ...rest }: ShareButtonProps) {
  const { toast } = useToast();
  const share = async () => {
    const link = url ?? window.location.href;
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title, text, url: link });
      } catch {
        /* user dismissed the share sheet */
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(link);
      toast("Link skopiowany", { tone: "success" });
    } catch {
      toast("Nie udało się skopiować linku", { tone: "danger" });
    }
  };
  return (
    <Button variant="soft" leftIcon={<Icon name="share" size={20} />} onClick={share} {...rest}>
      {children ?? "Udostępnij"}
    </Button>
  );
}
