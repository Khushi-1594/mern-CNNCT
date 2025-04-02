import { toast } from "react-hot-toast";
import { CheckCircle, AlertTriangle, Info, XCircle, X } from "lucide-react";
import "../styles/toastStyles.css";

const ICONS = {
  success: <CheckCircle size={18} className="toast-icon" />,
  error: <AlertTriangle size={18} className="toast-icon" />,
  info: <Info size={18} className="toast-icon" />,
  warning: <XCircle size={18} className="toast-icon" />,
};

const showToast = (type, message) => {
  toast.custom(
    (t) => (
      <div className={`toast-container toast-${type}`}>
        {ICONS[type]}
        <span>{message}</span>
        <X size={16} className="toast-close" onClick={() => toast.dismiss(t.id)} />
      </div>
    ),
    { duration: 2000 }
  );
};

// Export functions to use globally
export const showSuccessToast = (message) => showToast("success", message);
export const showErrorToast = (message) => showToast("error", message);
export const showInfoToast = (message) => showToast("info", message);
export const showWarningToast = (message) => showToast("warning", message);
