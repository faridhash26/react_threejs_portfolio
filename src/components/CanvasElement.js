import { useRef, useState, useEffect } from "react";
import * as THREE from "three";
import * as dat from "lil-gui";
import gsap from "gsap";

import firstTexture from "../static/textures/gradiant/3.jpg";
import ThirdTexture from "../static/textures/gradiant/3.jpg";

const CanvasElement = () => {
  const gui = new dat.GUI();
  const canvasElement = useRef();

  const [theCanvas, setTheCanvas] = useState({});
  const [theColor] = useState({ materialColor: "#ffeded" });
  const [sizes, setSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  useEffect(() => {
    setTheCanvas(canvasElement);
  }, [canvasElement]);

  gui.addColor(theColor, "materialColor").onChange(() => {
    material.color.set(theColor.materialColor);
  });

  // Scene
  const scene = new THREE.Scene();

  // texture
  const textureLoader = new THREE.TextureLoader();
  const gradiantTexture = textureLoader.load(ThirdTexture);
  gradiantTexture.magFilter = THREE.NearestFilter;
  // material
  const material = new THREE.MeshToonMaterial({
    color: theColor.materialColor,
    gradientMap: gradiantTexture,
  });

  // meshs
  const objectDistance = 4;
  const mesh1 = new THREE.Mesh(
    new THREE.TorusGeometry(1, 0.4, 16, 60),
    material
  );

  const mesh2 = new THREE.Mesh(new THREE.ConeGeometry(1, 2, 32), material);
  const mesh3 = new THREE.Mesh(
    new THREE.TorusKnotGeometry(0.8, 0.35, 100, 16),
    material
  );

  mesh1.position.x = 2;
  mesh2.position.x = -2;
  mesh3.position.x = 2;
  mesh1.position.y = -objectDistance * 0;
  mesh2.position.y = -objectDistance * 1;
  mesh3.position.y = -objectDistance * 2;

  scene.add(mesh1, mesh2, mesh3);

  const sectionMeshes = [mesh1, mesh2, mesh3];

  const particleCount = 200;
  const positions = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount; i++) {
    positions[i * 3 + 0] = (Math.random() - 0.5) * 10;
    positions[i * 3 + 1] =
      objectDistance * 0.5 -
      Math.random() * objectDistance * sectionMeshes.length;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
  }
  const participlesGeometry = new THREE.BufferGeometry();
  participlesGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(positions, 3)
  );
  // material
  const particlesMaterial = new THREE.PointsMaterial({
    color: theColor.materialColor,
    sizeAttenuation: true,
    size: 0.03,
  });
  // points
  const particles = new THREE.Points(participlesGeometry, particlesMaterial);
  scene.add(particles);

  // light
  const directionalLight = new THREE.DirectionalLight("#ffffff", 1);
  directionalLight.position.set(1, 1, 0);
  scene.add(directionalLight);

  /**
   * Camera
   */

  // group
  const cameraGroup = new THREE.Group();
  scene.add(cameraGroup);
  // Base camera
  const camera = new THREE.PerspectiveCamera(
    35,
    sizes.width / sizes.height,
    0.1,
    100
  );
  camera.position.z = 6;
  cameraGroup.add(camera);

  const renderer = new THREE.WebGLRenderer({
    canvas: theCanvas.current,
    alpha: true,
  });
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  useEffect(() => {
    window.addEventListener("resize", () => {
      // Update sizes
      setSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });

      // Update camera
      camera.aspect = sizes.width / sizes.height;
      camera.updateProjectionMatrix();

      // Update renderer
      renderer.setSize(sizes.width, sizes.height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    });
  }, []);

  //scroll
  let scrollY = window.scrollY;

  var currentSection = 0;
  const handleScroll = () => {
    scrollY = window.scrollY;
    const newSection = Math.round(scrollY / sizes.height);
    if (newSection != currentSection) {
      currentSection = newSection;
      gsap.to(sectionMeshes[currentSection].rotation, {
        duration: 1.5,
        ease: "power2.inOut",
        x: "+=6",
        y: "+=3",
        z: "+=1.5",
      });
    }
  };

  window.addEventListener("scroll", handleScroll);

  // cursor
  const cursor = { x: 0, y: 0 };
  window.addEventListener("mousemove", (event) => {
    cursor.x = event.clientX / sizes.width - 0.5;
    cursor.y = event.clientY / sizes.height - 0.5;
  });

  /**
   * Animate
   */
  const clock = new THREE.Clock();
  let previousTime = 0;

  const tick = () => {
    const elapsedTime = clock.getElapsedTime();
    const deltaTime = elapsedTime - previousTime;
    previousTime = elapsedTime;

    camera.position.y = (-scrollY / sizes.height) * objectDistance;

    const paralaxX = cursor.x * 0.5;
    const paralaxY = -cursor.y * 0.5;
    cameraGroup.position.x +=
      (paralaxX - cameraGroup.position.x) * 5 * deltaTime;
    cameraGroup.position.y +=
      (paralaxY - cameraGroup.position.y) * 5 * deltaTime;

    for (let mesh of sectionMeshes) {
      mesh.rotation.x = deltaTime * 0.1;
      mesh.rotation.y = deltaTime * 0.12;
    }

    // Render
    renderer.render(scene, camera);

    // Call tick again on the next frame
    window.requestAnimationFrame(tick);
  };

  tick();
  return <canvas className="webgl" ref={canvasElement} />;
};

export default CanvasElement;
