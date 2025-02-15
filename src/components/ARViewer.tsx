import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';

interface ARViewerProps {
  modelUrl: string | null;
  onExit: () => void;
}

export const ARViewer = ({ modelUrl, onExit }: ARViewerProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const modelRef = useRef<THREE.Group | null>(null);

  useEffect(() => {
    if (!modelUrl || !canvasRef.current) return;

    // Initialize scene, camera, renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current });

    sceneRef.current = scene;
    cameraRef.current = camera;
    rendererRef.current = renderer;

    // Add lighting
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(1, 1, 1).normalize();
    scene.add(light);

    // Load model using OBJLoader
    const loader = new OBJLoader();
    loader.load(
      modelUrl,
      (obj) => {
        modelRef.current = obj;
        
        // Adjust model rotation
        obj.rotation.y = Math.PI;
        obj.rotation.z = Math.PI / 2;
        obj.rotation.x = Math.PI / 2;
        
        scene.add(obj);
      },
      undefined,
      (error) => {
        console.error('Error loading model:', error);
        onExit();
      }
    );

    // Handle AR session
    const startARSession = async () => {
      try {
        if (!navigator.xr) throw new Error('WebXR not supported');
        const session = await navigator.xr.requestSession('immersive-ar');
        renderer.xr.enabled = true;
        renderer.xr.setSession(session);

        session.addEventListener('end', onExit);
        renderer.setAnimationLoop(() => {
          renderer.render(scene, camera);
        });
      } catch (error) {
        console.error('AR session failed:', error);
        onExit();
      }
    };

    startARSession();

    return () => {
      rendererRef.current?.dispose();
      sceneRef.current?.clear();
    };
  }, [modelUrl, onExit]);

  return (
    <div className="fixed inset-0 bg-black z-50">
      <button
        onClick={onExit}
        className="absolute top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg z-50"
      >
        Exit AR
      </button>
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  );
};
