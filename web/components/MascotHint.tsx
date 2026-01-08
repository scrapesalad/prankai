type MascotHintProps = {
  text: string;
  image?: string;
  alt?: string;
};

const defaultImage = "/images/mascot/uvO5q40CRFOYaeRVd_6fTg.jpg";
const defaultAlt = "Pranklyn mascot tip";

export default function MascotHint({ text, image = defaultImage, alt = defaultAlt }: MascotHintProps) {
  return (
    <div className="mascot-hint">
      <img src={image} alt={alt} />
      <p>{text}</p>
    </div>
  );
}
