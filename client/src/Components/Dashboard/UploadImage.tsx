import { ImagePlus, Trash, Upload } from "lucide-react"
import { Loader } from "lucide-react"

interface UploadImageProps {
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  preview: string | null;
  name: string;
  handleUpload: () => void;
  cancelUpload: () => void;
  isLoading: boolean;
}

const UploadImage = ({ onChange, name, handleUpload, cancelUpload, preview, isLoading }: UploadImageProps) => {

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleUpload();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
       {!preview && <label htmlFor="image">
        <input type="file" id="image" name="image" className="hidden" onChange={onChange} accept=".png, .jpg, .jpeg" />
          <div className="border-dashed border border-line rounded-xl p-4 center flex-col gap-2">
            <ImagePlus size={24} />
            <p className="text-sm font-sora font-medium">Click to upload {name}</p>
            <p className="text-xs text-muted">.PNG, .JPEG, .JPG - Max 2mb</p>
          </div>
        </label>}
        {preview && (
          <div className="h-[150px] w-[150px] relative rounded-lg bg-foreground mx-auto overflow-hidden">
            <img src={preview} alt="Preview" className="w-full h-full object-cover" />
            <button onClick={cancelUpload} type="button" className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/50 text-white px-2 py-1 rounded-full">
              <Trash size={16} className="text-red-500" />
              <span>Remove</span>
            </button>
          </div>
        )}

        <button disabled={isLoading} type="submit" className="btn-primary w-full h-10 rounded-full">
          {isLoading ? <Loader size={20} className="animate-spin" /> : <Upload size={20} />}
         {isLoading ? "Uploading..." : "Upload"}
        </button>
    </form>
  )
}

export default UploadImage