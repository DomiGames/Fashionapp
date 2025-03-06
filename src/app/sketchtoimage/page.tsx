
// src/app/sketchtoimage/page.tsx
"use client";

import { SessionProvider, useSession } from "next-auth/react";
import { useState, useRef, useEffect } from "react";
import * as THREE from "three";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";
import UserButton from "@/components/ui/user-botton";

function FashionAIComponent() {
  const { data: session } = useSession();
  const [inputImage, setInputImage] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [coinCount, setCoinCount] = useState<number>(5);

  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Set up coin count on mount or when session changes
  useEffect(() => {
    if (session) {
      // For logged-in users, use the coin count from session
      setCoinCount(session.user.coins || 0);
    } else {
      // For guests, read coin count from localStorage or default to 5
      const storedCoins = localStorage.getItem("coins");
      if (storedCoins) {
        setCoinCount(parseInt(storedCoins, 10));
      } else {
        localStorage.setItem("coins", "5");
        setCoinCount(5);
      }
    }
  }, [session]);

  // Three.js scene setup
  useEffect(() => {
    if (!canvasRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current });

    renderer.setClearColor(0xffffff);
    renderer.setSize(300, 300);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 5, 5);
    scene.add(ambientLight, directionalLight);

    // Ground plane
    const plane = new THREE.Mesh(
      new THREE.PlaneGeometry(10, 10),
      new THREE.MeshBasicMaterial({ color: 0xcccccc, side: THREE.DoubleSide })
    );
    plane.rotation.x = Math.PI / 2;
    plane.position.y = -1;
    scene.add(plane);

    camera.position.z = 1;
    camera.lookAt(0, 0, 0);

    const animate = () => {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    sceneRef.current = scene;
    cameraRef.current = camera;
    rendererRef.current = renderer;

    return () => {
      renderer.dispose();
      scene.clear();
    };
  }, []);

  // Handle image upload and update state with generated URLs
  const handleUpload = async (file: File) => {
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/generate`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) throw new Error("Upload failed");

      const data = await response.json();
      setInputImage(data.input_sketch_url);
      setGeneratedImage(data.generated_image_url);
    } catch (err: any) {
      setError(err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  // Generate 3D model and deduct a coin
  const generateModel = async () => {
    if (!generatedImage) return;

    // Check available coins
    if (coinCount <= 0) {
      setError("No coins left. Please sign up to buy more coins.");
      return;
    }

    setLoading(true);
    setError(null);

    // Deduct coin: for logged-in users call API; for guests update localStorage
    if (session) {
      const deductRes = await fetch("/api/coins/deduct", { method: "POST" });
      if (!deductRes.ok) {
        const errData = await deductRes.json();
        setError(errData.message || "Error deducting coin");
        setLoading(false);
        return;
      }
      const data = await deductRes.json();
      setCoinCount(data.coins);
    } else {
      let guestCoins = parseInt(localStorage.getItem("coins") || "5", 10);
      if (guestCoins <= 0) {
        setError("No coins left. Please sign up to continue.");
        setLoading(false);
        return;
      }
      guestCoins -= 1;
      localStorage.setItem("coins", guestCoins.toString());
      setCoinCount(guestCoins);
    }

    // Proceed with model generation
    try {
      const blob = await fetch(generatedImage).then((res) => res.blob());
      const formData = new FormData();
      formData.append("file", blob, "generated_image.png");

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/generate-model`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) throw new Error("Model generation failed");

      const data = await response.json();

      if (sceneRef.current) {
        // Load model using OBJLoader
        new OBJLoader().load(
          data.generated_model_url,
          (obj) => {
            // Remove previous models from the scene
            sceneRef.current!.traverse((child) => {
              if (child instanceof THREE.Mesh && child.userData.isModel) {
                sceneRef.current!.remove(child);
              }
            });
            // Mark new model for future removal
            obj.traverse((child) => {
              if (child instanceof THREE.Mesh) {
                child.userData.isModel = true;
              }
            });
            // Adjust model transform
            obj.rotation.y = Math.PI;
            obj.rotation.z = Math.PI / 2;
            obj.rotation.x = Math.PI / 2;
            obj.position.set(0, 0, 0);
            obj.scale.set(0.5, 0.5, 0.5);
            sceneRef.current!.add(obj);
          },
          undefined,
          (error) => {
            throw new Error(`Model load failed: ${error.message}`);
          }
        );
      }
    } catch (err: any) {
      setError(err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative">
      {/* Header */}
      <div className="absolute top-4 left-4">
        <p className="text-xl font-bold text-white">SketchToDress</p>
      </div>
      <div className="absolute top-4 right-4 flex items-center space-x-4">
        <span className="text-white">Coins: {coinCount}</span>
        <UserButton />
      </div>

      {/* Main Container */}
      <div className="bg-gray-900 p-8 rounded-lg shadow-xl max-w-2xl w-full">
        <h1 className="text-gray-300 text-3xl font-bold text-center mb-8">
          Fashion Design AI
        </h1>

        {/* Upload Section */}
        <div className="mb-8">
          <h2 className="text-gray-300 text-xl mb-4">Upload Your Sketch</h2>
          <input
            type="file"
            accept="image/*"
            onChange={(e) =>
              e.target.files?.[0] && handleUpload(e.target.files[0])
            }
            className="w-full text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-purple-800 file:text-gray-200 hover:file:bg-purple-700 cursor-pointer"
          />
          <div className="mt-4 space-y-2">
            {generatedImage && (
              <button
                onClick={generateModel}
                className="w-full bg-purple-800 text-white py-2 rounded-lg hover:bg-purple-700 transition-colors"
              >
                Generate 3D Model
              </button>
            )}
          </div>
        </div>

        {/* Output Section */}
        <div className="space-y-6">
          {loading && (
            <p className="text-purple-500 text-center">Loading...</p>
          )}
          {error && <p className="text-red-500 text-center">{error}</p>}
          <div className="flex flex-col items-center space-y-4">
            {inputImage && (
              <img
                src={inputImage}
                alt="Input sketch"
                className="max-w-[300px] rounded-lg"
              />
            )}
            {generatedImage && (
              <img
                src={generatedImage}
                alt="Generated design"
                className="max-w-[300px] rounded-lg"
              />
            )}
            <div className="w-[300px] h-[300px] bg-gray-800 rounded-lg">
              <canvas ref={canvasRef} className="w-full h-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function FashionAIWithSession() {
  return (
    <SessionProvider>
      <FashionAIComponent />
    </SessionProvider>
  );
}

