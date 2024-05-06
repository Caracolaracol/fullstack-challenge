import { useState } from "react";
import { toast, Toaster } from "sonner";
import { type Data } from "./types";

import "./App.css";
import { uploadFile } from "./services/upload";
import { Search } from "./steps/Search";

const APP_STATUS = {
  IDLE: "idle",
  ERROR: "error",
  READY_UPLOAD: "ready_upload",
  UPLOADING: "uploading",
  READY_USAGE: "ready_usage",
} as const;

const BUTTON_TEXT = {
  [APP_STATUS.READY_UPLOAD]: "Subir Archivo",
  [APP_STATUS.UPLOADING]: "Subiendo ...",
};

type AppStatusType = (typeof APP_STATUS)[keyof typeof APP_STATUS];

function App() {
  const [appStatus, setAppStatus] = useState<AppStatusType>(APP_STATUS.IDLE);
  const [file, setFile] = useState<File | null>(null);
  const [data, setData] = useState<Data>([]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const [file] = event.target.files ?? [];
    console.log(file);
    if (file) {
      setFile(file);
      setAppStatus(APP_STATUS.READY_UPLOAD);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (appStatus != APP_STATUS.READY_UPLOAD || !file) {
      return;
    }

    setAppStatus(APP_STATUS.UPLOADING);

    const [err, newData] = await uploadFile(file);

    if (err) {
      setAppStatus(APP_STATUS.ERROR);
      toast.error(err.message);
      return;
    }
    setAppStatus(APP_STATUS.READY_USAGE);
    if (newData) setData(newData);
    toast.success("Archivo subido correctamente");
  };

  const showButton =
    appStatus == APP_STATUS.READY_UPLOAD || appStatus == APP_STATUS.UPLOADING;

  const showInput = appStatus != APP_STATUS.READY_USAGE;
  return (
    <>
      <Toaster />
      <h4>Challenge upload CSV + Search</h4>
      {showInput && (
        <form onSubmit={handleSubmit}>
          <label>
            <input
              onChange={handleInputChange}
              type="file"
              name="file"
              accept=".csv"
            />
          </label>
          {showButton && (
            <button disabled={appStatus == APP_STATUS.UPLOADING}>
              {BUTTON_TEXT[appStatus]}
            </button>
          )}
        </form>
      )}

      {appStatus === APP_STATUS.READY_USAGE && <Search initialData={data} />}
    </>
  );
}

export default App;
