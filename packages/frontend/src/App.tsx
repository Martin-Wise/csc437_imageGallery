import { AllImages } from "./images/AllImages.tsx";
import { ImageDetails } from "./images/ImageDetails.tsx";
import { UploadPage } from "./UploadPage.tsx";
import { LoginPage } from "./LoginPage.tsx";
import { MainLayout } from "./MainLayout.tsx";
import { Routes, Route } from "react-router";
import { useEffect, useState } from "react";
// import { fetchDataFromServer } from "../../backend/src/shared/ApiImageData.ts";
import { ValidRoutes } from "../../backend/src/shared/ValidRoutes.ts";

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [imageData, _setImageData] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/images")
    .then((res) => {
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`)
      }
      return res.json()
    })
    .then((data) => {
      _setImageData(data);
    })
    .catch((err) => {
      console.error("Fetch error:", err);
      setIsError(true);
    })
    .finally(() => {
      setIsLoading(false);
    })
    
  }, []);

  function handleImageNameChange(imageId: string, newName: string) {
    _setImageData(prev =>
        prev.map(img => img.id === imageId ? { ...img, name: newName } : img)
    );
  }

  return (
    <Routes>
      {/* MainLayout wraps the following routes */}
      <Route element={<MainLayout />}>
        <Route
          path={ValidRoutes.HOME}
          element={<AllImages imageData={imageData} isLoading={isLoading} isError={isError}/>}
        />
        <Route
          path={ValidRoutes.IMAGES}
          element={<ImageDetails imageData={imageData} onImageNameChange={handleImageNameChange} isLoading={isLoading} isError={isError}/>}
        />
        <Route path={ValidRoutes.UPLOAD} element={<UploadPage />} />
        <Route path={ValidRoutes.LOGIN} element={<LoginPage />} />
      </Route>

      {/* Login page doesn't need header/layout */}
    </Routes>
  );
}

export default App;
