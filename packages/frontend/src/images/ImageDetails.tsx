import { useParams } from 'react-router'
import { ImageNameEditor } from '../ImageNameEditor';

interface IImageDetailsProps {
    imageData: any[];
    onImageNameChange: (imageId: string, newName: string) => void;
}

export function ImageDetails({ imageData, onImageNameChange }: IImageDetailsProps) {
    const { imageId } = useParams();
    const image = imageData.find(image => image.id === imageId);

    if (!image) {
        return <div><h2>Image not found</h2></div>;
    }

    return (
        <div>
            <h2>{image.name}</h2>
            <p>By {image.author.username}</p>
            <ImageNameEditor
                initialValue={image.name}
                imageId={image.id}
                onNameChange={onImageNameChange}
            />
            <img className="ImageDetails-img" src={image.src} alt={image.name} />
        </div>
    );
}
