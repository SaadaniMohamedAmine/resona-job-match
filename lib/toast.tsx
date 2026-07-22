import { toast } from "react-toastify";
import { IconCircleCheck, IconAlertCircle, IconInfoCircle } from "@tabler/icons-react";

export const notify = {
  success: (message: string) =>
    toast.success(message, { icon: () => <IconCircleCheck size={20} stroke={1.5} /> }),

  error: (message: string) =>
    toast.error(message, { icon: () => <IconAlertCircle size={20} stroke={1.5} />, autoClose: 6000 }),

  info: (message: string) =>
    toast.info(message, { icon: () => <IconInfoCircle size={20} stroke={1.5} /> }),
};
