import planetLogo from "../../assets/branding/planet-smart-city-logo.svg";

type Props = {
  className?: string;
  compact?: boolean;
};

export default function PlanetLogo({ className = "", compact = false }: Props) {
  return (
    <img
      src={planetLogo}
      alt="Planet Smart City"
      className={`bo-planet-logo ${compact ? "bo-planet-logo-compact" : ""} ${className}`.trim()}
    />
  );
}
