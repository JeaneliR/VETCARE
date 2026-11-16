
type AnimatedPetProps = {
  animal: "🐶" | "🐱" | "🐾";
  className: string;
  label: string;
  delay?: string;
};

function AnimatedPet({
  animal,
  className,
  label,
  delay = "0s",
}: AnimatedPetProps) {
  return (
    <span
      aria-hidden="true"
      title={label}
      className={`pointer-events-none absolute select-none ${className}`}
      style={{ animationDelay: delay }}
    >
      {animal}
    </span>
  );
}

export default function AnimatedPets() {
  return (
    <>
      <AnimatedPet
        animal="🐶"
        label="Perrito decorativo"
        className="home-pet-float right-2 top-8 z-10 text-4xl sm:right-6 sm:text-5xl"
      />

      <AnimatedPet
        animal="🐱"
        label="Gatito decorativo"
        className="home-pet-float -bottom-3 left-3 z-10 text-3xl sm:left-8 sm:text-4xl"
        delay="1.2s"
      />

      <AnimatedPet
        animal="🐾"
        label="Huellitas decorativas"
        className="home-pet-float right-5 top-1/2 z-10 text-3xl opacity-60 sm:right-10 sm:text-4xl"
        delay="0.6s"
      />
    </>
  );
}
