interface PetIllustrationProps {
  variant?: "duo" | "solo";
  className?: string;
}

/**
 * Ilustración propia en estilo plano (flat design), construida con formas
 * geométricas simples en la paleta de marca (aguamarina + azul). Reemplaza
 * las fotos de stock externas: no depende de ningún servicio de terceros,
 * así que siempre se ve igual, sin importar la conexión.
 */
export default function PetIllustration({ variant = "duo", className = "" }: PetIllustrationProps) {
  return (
    <svg
      viewBox="0 0 400 300"
      className={className}
      role="img"
      aria-label="Ilustración de una mascota siendo cuidada"
    >
      <defs>
        <linearGradient id="pi-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#effcfa" />
          <stop offset="100%" stopColor="#eff6ff" />
        </linearGradient>
      </defs>

      <rect width="400" height="300" rx="28" fill="url(#pi-bg)" />

      {/* Suelo decorativo */}
      <ellipse cx="200" cy="248" rx="140" ry="14" fill="#c9f7ef" opacity="0.6" />

      {/* Perro (cuerpo) */}
      <g>
        <ellipse cx="150" cy="190" rx="58" ry="46" fill="#2cc1ae" />
        <circle cx="150" cy="120" r="42" fill="#2cc1ae" />
        <ellipse cx="118" cy="90" rx="16" ry="24" fill="#14a394" transform="rotate(-20 118 90)" />
        <ellipse cx="182" cy="90" rx="16" ry="24" fill="#14a394" transform="rotate(20 182 90)" />
        <circle cx="136" cy="118" r="6" fill="#062623" />
        <circle cx="164" cy="118" r="6" fill="#062623" />
        <ellipse cx="150" cy="134" rx="10" ry="7" fill="#062623" />
        <path d="M130 146 Q150 160 170 146" stroke="#062623" strokeWidth="4" fill="none" strokeLinecap="round" />
      </g>

      {variant === "duo" && (
        <g>
          {/* Gato (cuerpo) */}
          <ellipse cx="262" cy="202" rx="48" ry="38" fill="#60a5fa" />
          <circle cx="262" cy="140" r="34" fill="#60a5fa" />
          <path d="M234 118 L244 88 L256 122 Z" fill="#3b82f6" />
          <path d="M290 118 L280 88 L268 122 Z" fill="#3b82f6" />
          <circle cx="250" cy="138" r="5" fill="#172554" />
          <circle cx="274" cy="138" r="5" fill="#172554" />
          <path d="M256 150 L262 155 L268 150" stroke="#172554" strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M238 154 L222 150 M238 158 L220 158 M286 154 L302 150 M286 158 L304 158" stroke="#172554" strokeWidth="2" strokeLinecap="round" />
        </g>
      )}

      {/* Corazón flotante */}
      <path
        d="M208 70 c-6-10-22-10-22 4 c0 12 22 24 22 24 s22-12 22-24 c0-14-16-14-22-4Z"
        fill="#2cc1ae"
        opacity="0.85"
      />

      {/* Huellitas decorativas */}
      <circle cx="90" cy="60" r="4" fill="#5bdcc9" opacity="0.7" />
      <circle cx="320" cy="70" r="4" fill="#93c5fd" opacity="0.7" />
      <circle cx="340" cy="220" r="3.5" fill="#5bdcc9" opacity="0.6" />
    </svg>
  );
}
