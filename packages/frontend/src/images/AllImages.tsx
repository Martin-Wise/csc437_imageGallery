import { ImageGrid } from "./ImageGrid.tsx";

export function AllImages(props: { imageData: any[]; searchPanel: React.ReactNode}) {
    
    return (
        <div>
            <h2>All Images</h2>
            {props.searchPanel}
            <ImageGrid images={props.imageData} />
        </div>
    );
}
