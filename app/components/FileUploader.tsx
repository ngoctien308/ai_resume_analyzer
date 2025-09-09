import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";

interface FileUploaderProps {
    onFileSelect?: (file: File | null) => void;
}

const FileUploader = ({ onFileSelect }: FileUploaderProps) => {
    // every time a file is selected, call onFileSelect in order to set the file in the parent component
    const onDrop = useCallback((acceptedFiles: File[]) => {
        onFileSelect?.(acceptedFiles[0] || null);
        setFile(acceptedFiles[0] || null);
    }, [onFileSelect]);
    const { getRootProps, getInputProps, acceptedFiles } = useDropzone({
        onDrop,
        multiple: false,
        accept: { 'application/pdf': ['.pdf'] }
    });
    const [file, setFile] = useState<File | null>(null);

    return (
        <div className="w-full gradient-border">
            <div {...getRootProps()}>
                <input {...getInputProps()} />

                <div className="space-y-4 cursor-pointer">
                    {file ? (
                        <div className="uploader-selected-file" onClick={(e) => e.stopPropagation()}>
                            <img src="/images/pdf.png" alt="pdf" className="size-10" />
                            <div className="flex items-center space-x-3">
                                <div>
                                    <p className="text-sm font-medium text-gray-700 truncate max-w-xs">
                                        {file.name}
                                    </p>
                                </div>
                            </div>
                            {/* Button to remove the selected file */}
                            <button
                                className="p-2 cursor-pointer"
                                onClick={(e) => {
                                    onFileSelect?.(null)
                                    setFile(null);
                                }}>
                                <img src="/icons/cross.svg" alt="remove" className="w-4 h-4" />
                            </button>
                        </div>
                    ) : (
                        <div>
                            <div className="mx-auto w-16 h-16 flex items-center justify-center mb-2">
                                <img src="/icons/info.svg" alt="upload" className="size-20" />
                            </div>
                            <p className="text-lg text-gray-500">
                                <span className="font-semibold">
                                    Click to upload
                                </span> or drag and drop
                            </p>
                            <p className="text-lg text-gray-500">PDF (max 200MB)</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default FileUploader