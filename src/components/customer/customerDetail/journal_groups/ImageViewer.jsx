import React from 'react'
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import "yet-another-react-lightbox/plugins/thumbnails.css";

const ImageViewer = ({isOpen, setIsOpen, photoIndex, storeImages}) => {
  return <>
    {isOpen &&
        <Lightbox
        index={photoIndex}
            open={isOpen}
            close={() => setIsOpen(false)}
            slides={storeImages}
            plugins={[Zoom]}
            />
        }</>
    
  
}

export default ImageViewer