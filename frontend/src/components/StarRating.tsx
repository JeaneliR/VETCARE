interface StarRatingProps {
  value: number;
  onChange?: (value: number) => void;
  size?: string;
}

export default function StarRating({ value, onChange, size = "text-lg" }: StarRatingProps) {
  const stars = [1, 2, 3, 4, 5];
  return (
    <div className={`flex gap-0.5 ${size}`}>
      {stars.map((star) => (
        <button
          key={star}
          type="button"
          disabled={!onChange}
          onClick={() => onChange?.(star)}
          className={`${onChange ? "cursor-pointer" : "cursor-default"} leading-none`}
          aria-label={`${star} estrellas`}
        >
          <span className={star <= value ? "text-amber-400" : "text-slate-300"}>★</span>
        </button>
      ))}
    </div>
  );
}
