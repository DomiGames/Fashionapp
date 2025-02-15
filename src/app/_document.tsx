import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html>
      <Head>
        <script src="https://cdn.jsdelivr.net/npm/@mediapipe/pose" />
        <script src="https://cdn.jsdelivr.net/npm/@tensorflow-models/pose-detection" />
        <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js" />
        <script src="https://cdn.jsdelivr.net/npm/three/examples/js/loaders/OBJLoader.js" />
        <script src="https://cdn.jsdelivr.net/npm/webxr-polyfill@latest/build/webxr-polyfill.js" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
