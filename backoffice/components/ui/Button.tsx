type Props = {
  children: React.ReactNode;
  type?: "button" | "submit";
  variant?: "primary" | "secondary" | "ghost";
  disabled?: boolean;
  onClick?: () => void;
  fullWidth?: boolean;
};

export default function Button({
  children,
  type = "button",
  variant = "primary",
  disabled = false,
  onClick,
  fullWidth = false
}: Props) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`bo-button bo-button-${variant} ${fullWidth ? "bo-button-full" : ""}`}
    >
      {children}
    </button>
  );
}
