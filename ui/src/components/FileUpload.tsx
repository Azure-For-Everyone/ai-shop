import React, { useRef, useState } from "react";
import { CloudArrowUpIcon } from "@heroicons/react/24/outline";
import classNames from "classnames";
import axios from "axios";
const FileUpload = (props: any) => {
  const [fileList, setFileList] = useState<File[] | null>(null);
  const [uploadedFileList, setUploadedFileList] = useState<File[] | null>(null);
  const [shouldHighlight, setShouldHighlight] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const [progress, setProgress] = useState(0);
  const preventDefaultHandler = (e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };
  const handleUpload = async () => {
    const UPLOAD_URL = "http://localhost:8080/upload";
    const data = new FormData();
    for (let file of fileList!) {
      data.append("file", file);
    }
    await axios.post(UPLOAD_URL, data, {
      onUploadProgress(e) {
        const progress = e.progress ?? 0;
        setProgress(progress * 100);
        if (progress * 100 >= 100) {
          setUploaded(true);
          setUploadedFileList(fileList);
          //setFileList(null);
          if (props.setData) {
            props.setData({
              brand: "Nike",
              model: "Air Max 90",
              confidence: 0.99, 
            });
          }
        }
      },
    });
  };
  const uploading = progress > 0 && progress < 100;
  return (
    <div
      className={classNames({
        "purple-border": true,
        "w-full h-96": true,
        "p-4 grid place-content-center cursor-pointer": true,
        "text-violet-500 rounded-lg": true,
        "border-4 border-dashed ": true,
        "transition-colors": true,
        "border-violet-500 bg-violet-100": shouldHighlight,
        "border-violet-100 bg-violet-50": !shouldHighlight,
      })}
      onDragOver={(e) => {
        preventDefaultHandler(e);
        setShouldHighlight(true);
      }}
      onDragEnter={(e) => {
        preventDefaultHandler(e);
        setShouldHighlight(true);
      }}
      onDragLeave={(e) => {
        preventDefaultHandler(e);
        setShouldHighlight(false);
      }}
      onDrop={(e) => {
        preventDefaultHandler(e);
        const files = Array.from(e.dataTransfer.files);
        setFileList(files);
        setShouldHighlight(false);
      }}
    >
      {!uploaded && 
        <div className="flex flex-col items-center">
          {!fileList ? (
            <>
              <CloudArrowUpIcon className="w-10 h-10" />
              <span>
                <span>Choose a File</span> or drag it here
              </span>
            </>
          ) : (
            <>
              <p>Files to Upload</p>
              {fileList.map((file, i) => {
                return <div>
                  <img src={URL.createObjectURL(file)} alt={file.name} className="w-20 h-20" />
                  <span key={i}>{file.name}</span>
                  </div>;
              })}
              <div className="flex gap-2 mt-2">
                <button
                  className={classNames({
                    "bg-violet-500 text-violet-50 px-2 py-1 rounded-md": true,
                    "pointer-events-none opacity-40 w-full": uploading,
                  })}
                  onClick={() => {
                    handleUpload();
                  }}
                >
                  {uploading
                    ? `Uploading...  ( ${progress.toFixed(2)}% )`
                    : "Upload"}
                </button>
                {!uploading && (
                  <button
                    className="border border-violet-500 px-2 py-1 rounded-md"
                    onClick={() => {
                      setFileList(null);
                    }}
                  >
                    Clear
                  </button>
                )}
              </div>
            </>
          )}
        </div>
    }

  {uploaded && uploadedFileList &&
              <div className="flex flex-col items-center">
                
                {uploadedFileList.map((file, i) => {
                  return <div>
                    <img src={URL.createObjectURL(file)} alt={file.name} className="h-80" />
                    </div>;
                })}

              </div>
            }
    </div>
  );
};

export default FileUpload;


