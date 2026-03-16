type CSVGeneratorProps = {
    response: string | Blob;
    fileTitle: string;
};

export const CSVGenerator = ({ response, fileTitle }: CSVGeneratorProps) => {
    const blob = response instanceof Blob ? response : new Blob([response], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${fileTitle}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
};
