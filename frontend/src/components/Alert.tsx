interface AlertProps {
  type?: "error" | "success";
  message: string;
  onDismiss?: () => void;
}

export default function Alert({ type = "error", message, onDismiss }: AlertProps) {
  const styles =
    type === "error"
      ? "bg-red-50 text-red-700 border-red-200"
      : "bg-emerald-50 text-emerald-700 border-emerald-200";

  return (
    <div className={`mb-4 flex items-start justify-between gap-3 rounded-lg border px-4 py-3 text-sm ${styles}`}>
      <span>{message}</span>
      {onDismiss && (
        <button onClick={onDismiss} className="text-current opacity-70 hover:opacity-100">
          ✕
        </button>
      )}
    </div>
  );
}
