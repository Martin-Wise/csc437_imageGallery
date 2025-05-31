import { ImageGrid } from "./ImageGrid.tsx";

export function AllImages(props: { imageData: any[]; }) {
    
    return (
        <div>
            <h2>All Images</h2>
            <ImageGrid images={props.imageData} />
        </div>
    );
}
