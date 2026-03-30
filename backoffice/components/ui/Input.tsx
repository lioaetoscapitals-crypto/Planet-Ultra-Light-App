type Props = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: "text" | "email" | "password";
  error?: string;
};

export default function Input({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  error
}: Props) {
  return (
    <label className="bo-input-group">
      <span className="bo-input-label">{label}</span>
      <input
        className={`bo-input ${error ? "bo-input-error" : ""}`}
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
      {error ? <span className="bo-input-error-text">{error}</span> : null}
    </label>
  );
}
