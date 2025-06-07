import { AllImages } from "./images/AllImages.tsx";
import { ImageDetails } from "./images/ImageDetails.tsx";
import { UploadPage } from "./UploadPage.tsx";
import { LoginPage } from "./LoginPage.tsx";
import { MainLayout } from "./MainLayout.tsx";
import { Routes, Route } from "react-router";
import { useEffect, useRef, useState } from "react";
// import { fetchDataFromServer } from "../../backend/src/shared/ApiImageData.ts";
import { ValidRoutes } from "../../backend/src/shared/ValidRoutes.ts";
import { ImageSearchForm } from "./images/ImageSearchForm.tsx";
import { ProtectedRoute } from "./ProtectedRoute.tsx";

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [imageData, setImageData] = useState<any[]>([]);
  const [searchString, setSearchString] = useState("");
  const requestCounterRef = useRef(0);
  const [authToken, setAuthToken] = useState("");

  if (authToken == "hiu") {
    console.log("hi")
  }

  async function fetchImages(query?: string) {
    setIsLoading(true);
    setIsError(false);
  
    // Bump the counter and capture this request's number
    const currentRequestNumber = ++requestCounterRef.current;
  
    const url = query && query.trim()
      ? `/api/images?name=${encodeURIComponent(query.trim())}`
      : `/api/images`;
  
    try {
      const headers: HeadersInit = {};
      
      // Add Authorization header if authToken exists
      if (authToken) {
        headers["Authorization"] = `Bearer ${authToken}`;
      }

      const res = await fetch(url, { headers });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
  
      // Only set state if this is the most recent request
      if (currentRequestNumber === requestCounterRef.current) {
        setImageData(data);
        setIsLoading(false);
      }
    } catch (err) {
      // Only set error if this is the most recent request
      if (currentRequestNumber === requestCounterRef.current) {
        console.error("Failed to fetch images:", err);
        setIsError(true);
        setIsLoading(false);
      }
    }
  }

  // Re-fetch images whenever authToken changes
  useEffect(() => {
    if (authToken) {
      fetchImages(); // fetch when auth token is set
    }
  }, [authToken]);

  function handleImageNameChange(imageId: string, newName: string) {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${authToken}`
    };
   

    fetch(`/api/images/${imageId}/name`, {
      method: "PUT",
      headers,
      body: JSON.stringify({ newName })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error("Failed to update image name");
        }
        return response.json();
    })
    .then(() => {
        setImageData(prev =>
            prev.map(img => img.id === imageId ? { ...img, name: newName } : img)
        );
    })
    .catch(err => {
        console.error("Error updating image name:", err);
    });
  }

  function handleImageSearch() {
    fetchImages(searchString); // fetch with optional search query
  }

  const searchPanel = (
    <ImageSearchForm
      searchString={searchString}
      onSearchStringChange={setSearchString}
      onSearchRequested={handleImageSearch}
    />
  );

  if (isLoading || isError) {}
  return (
    <Routes>
      {/* MainLayout wraps the following routes */}
      <Route element={<MainLayout />}>
        <Route
          path={ValidRoutes.HOME}
          
          element={<ProtectedRoute authToken={authToken}><AllImages imageData={imageData} searchPanel={searchPanel}/></ProtectedRoute>}
        />
        <Route
          path={ValidRoutes.IMAGES}
          element={<ProtectedRoute authToken={authToken}><ImageDetails imageData={imageData} onImageNameChange={handleImageNameChange}/></ProtectedRoute>}
        />
        <Route path={ValidRoutes.UPLOAD} element={<ProtectedRoute authToken={authToken}><UploadPage /></ProtectedRoute>} />
        <Route path={ValidRoutes.LOGIN} element={<LoginPage setAuthToken={setAuthToken}/>} />
        <Route path={ValidRoutes.REGISTER} element={<LoginPage isRegistering={true} setAuthToken={setAuthToken}/>} />

      </Route>

      {/* Login page doesn't need header/layout */}
    </Routes>
  );
}

export default App;