import { useId, useState, useActionState } from "react";

function readAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.readAsDataURL(file);
    fr.onload = () => resolve(fr.result as string);
    fr.onerror = (err) => reject(err);
  });
}


async function uploadImage(_prevState: any, formData: any) {
  try {
    const response = await fetch("/api/images", {
      method: "POST",
      headers: {
        Authorization: `Bearer YOUR_AUTH_TOKEN_HERE`, // Replace this dynamically in a real app
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Upload failed with status " + response.status);
    }

    return { status: "success", message: "Upload successful!" };
  } catch (error) {
    return { status: "error", message: (error as Error).message };
  }
}

export function UploadPage() {
  const fileInputId = useId();
  const titleInputId = useId();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [state, formAction, isPending] = useActionState(uploadImage, {
    status: "idle",
    message: "",
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const dataUrl = await readAsDataURL(file);
      setPreviewUrl(dataUrl);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    formAction(formData);
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor={fileInputId}>Choose image to upload:</label>
          <input
            id={fileInputId}
            name="image"
            type="file"
            accept=".png,.jpg,.jpeg"
            required
            onChange={handleFileChange}
            disabled={isPending}
          />
        </div>

        <div>
          <label htmlFor={titleInputId}>
            <span>Image title:</span>
          </label>
          <input id={titleInputId} name="name" required disabled={isPending} />
        </div>

        {previewUrl && (
          <div>
            <img
              style={{ width: "20em", maxWidth: "100%" }}
              src={previewUrl}
              alt="Preview of selected upload"
            />
          </div>
        )}

        <input type="submit" value="Confirm upload" disabled={isPending} />
      </form>

      <div aria-live="polite" style={{ marginTop: "1em", minHeight: "1.5em" }}>
        {state.status === "success" && <span style={{ color: "green" }}>{state.message}</span>}
        {state.status === "error" && <span style={{ color: "red" }}>{state.message}</span>}
      </div>
    </>
  );
}

export default UploadPage;