import React from 'react';
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';
import Zoom from 'yet-another-react-lightbox/plugins/zoom';
import 'yet-another-react-lightbox/plugins/thumbnails.css';

interface SingleImageViewerProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    imageUrl: string;
}

export default function ImageViewer({ isOpen, setIsOpen, imageUrl }: SingleImageViewerProps) {
    return (
        <Lightbox
            open={isOpen}
            close={() => setIsOpen(false)}
            index={0}
            slides={[{ src: imageUrl }]}
            plugins={[Zoom]}
        />
    );
}
