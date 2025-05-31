import { useParams } from 'react-router'
interface IImageDetailsProps {
    imageData: any[];
}

export function ImageDetails(props: IImageDetailsProps) {
    const { imageId } = useParams()
    const image = props.imageData.find(image => image.id === imageId);
    if (!image) {
        return <div><h2>Image not found</h2></div>;
    }

    return (
        <div>
            <h2>{image.name}</h2>
            <p>By {image.author.username}</p>
            <img className="ImageDetails-img" src={image.src} alt={image.name} />
        </div>
    )
}
