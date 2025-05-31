import { Link } from "react-router";
import "./Images.css";

interface IImageGridProps {
  images: any[];
}

export function ImageGrid(props: IImageGridProps) {
  const imageElements = props.images.map((image) => (
    <div key={image.id} className="ImageGrid-photo-container">
      <Link to={"/images/" + image.id}>
        <img src={image.src} alt={image.name} />
      </Link>
    </div>
  ));
  return <div className="ImageGrid">{imageElements}</div>;
}
