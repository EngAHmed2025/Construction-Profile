import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RotateCcw, ZoomIn, ZoomOut } from 'lucide-react';

type PanoramaViewerProps = {
  image: string;
  title: string;
};

export default function PanoramaViewer({ image, title }: PanoramaViewerProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const resetRef = useRef<(() => void) | null>(null);
  const [viewerError, setViewerError] = useState(false);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    let renderer: THREE.WebGLRenderer;
    let frameId = 0;
    let disposed = false;
    let texture: THREE.Texture | undefined;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1100);
    camera.position.set(0, 0, 0.01);
    const sphere = new THREE.Mesh(
      new THREE.SphereGeometry(500, 64, 40),
      new THREE.MeshBasicMaterial({ side: THREE.BackSide }),
    );
    scene.add(sphere);

    let longitude = 0;
    let latitude = 0;
    let zoom = 75;
    let dragging = false;
    let pointerX = 0;
    let pointerY = 0;
    let startLongitude = 0;
    let startLatitude = 0;
    let activePointer: number | null = null;
    const render = () => {
      frameId = requestAnimationFrame(render);
      camera.fov = zoom;
      camera.updateProjectionMatrix();
      const phi = THREE.MathUtils.degToRad(90 - latitude);
      const theta = THREE.MathUtils.degToRad(longitude);
      camera.lookAt(
        500 * Math.sin(phi) * Math.cos(theta),
        500 * Math.cos(phi),
        500 * Math.sin(phi) * Math.sin(theta),
      );
      renderer.render(scene, camera);
    };
    const resize = () => {
      if (!mount || disposed) return;
      const width = Math.max(1, mount.clientWidth);
      const height = Math.max(1, mount.clientHeight);
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    const onPointerDown = (event: PointerEvent) => {
      dragging = true;
      activePointer = event.pointerId;
      pointerX = event.clientX;
      pointerY = event.clientY;
      startLongitude = longitude;
      startLatitude = latitude;
      mount.setPointerCapture(event.pointerId);
      mount.classList.add('is-dragging');
    };
    const onPointerMove = (event: PointerEvent) => {
      if (!dragging || activePointer !== event.pointerId) return;
      longitude = startLongitude + (pointerX - event.clientX) * 0.12;
      latitude = THREE.MathUtils.clamp(startLatitude + (event.clientY - pointerY) * 0.12, -75, 75);
    };
    const stopDrag = (event: PointerEvent) => {
      if (activePointer !== event.pointerId) return;
      dragging = false;
      activePointer = null;
      mount.classList.remove('is-dragging');
    };
    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      zoom = THREE.MathUtils.clamp(zoom + (event.deltaY > 0 ? 3 : -3), 42, 95);
    };
    const onZoomControl = (event: Event) => {
      const amount = (event as CustomEvent<number>).detail;
      zoom = THREE.MathUtils.clamp(zoom + amount, 42, 95);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      const step = event.shiftKey ? 12 : 6;
      if (event.key === 'ArrowLeft') longitude -= step;
      else if (event.key === 'ArrowRight') longitude += step;
      else if (event.key === 'ArrowUp') latitude = THREE.MathUtils.clamp(latitude - step, -75, 75);
      else if (event.key === 'ArrowDown') latitude = THREE.MathUtils.clamp(latitude + step, -75, 75);
      else return;
      event.preventDefault();
    };
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.setClearColor(0xddd4c5);
      mount.appendChild(renderer.domElement);
      texture = new THREE.TextureLoader().load(
        image,
        () => {
          if (disposed) return;
          texture!.colorSpace = THREE.SRGBColorSpace;
          (sphere.material as THREE.MeshBasicMaterial).map = texture!;
          (sphere.material as THREE.MeshBasicMaterial).needsUpdate = true;
        },
        undefined,
        () => { if (!disposed) setViewerError(true); },
      );
      resetRef.current = () => { longitude = 0; latitude = 0; zoom = 75; };
      mount.addEventListener('pointerdown', onPointerDown);
      mount.addEventListener('pointermove', onPointerMove);
      mount.addEventListener('pointerup', stopDrag);
      mount.addEventListener('pointercancel', stopDrag);
      mount.addEventListener('wheel', onWheel, { passive: false });
      mount.addEventListener('panorama-zoom', onZoomControl);
      mount.addEventListener('keydown', onKeyDown);
      window.addEventListener('resize', resize);
      resize();
      render();
    } catch {
      setViewerError(true);
    }

    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', resize);
      mount.removeEventListener('pointerdown', onPointerDown);
      mount.removeEventListener('pointermove', onPointerMove);
      mount.removeEventListener('pointerup', stopDrag);
      mount.removeEventListener('pointercancel', stopDrag);
      mount.removeEventListener('wheel', onWheel);
      mount.removeEventListener('panorama-zoom', onZoomControl);
      mount.removeEventListener('keydown', onKeyDown);
      texture?.dispose();
      sphere.geometry.dispose();
      (sphere.material as THREE.Material).dispose();
      if (renderer) {
        renderer.dispose();
        renderer.domElement.remove();
      }
      resetRef.current = null;
    };
  }, [image]);

  const adjustZoom = (amount: number) => {
    const canvas = mountRef.current;
    if (!canvas) return;
    canvas.dispatchEvent(new CustomEvent('panorama-zoom', { detail: amount }));
  };

  return (
    <div className="panorama-viewer">
      <div className="panorama-canvas" ref={mountRef} role="application" tabIndex={0} aria-label={`مشهد بانورامي تفاعلي: ${title}. استخدم مفاتيح الأسهم لتحريك المشهد.`} />
      {viewerError && <div className="panorama-error" role="status">تعذّر تحميل المشهد. يرجى إعادة تحميل الصفحة.</div>}
      <div className="panorama-tools" aria-label="أدوات التحكم بالمشهد">
        <button type="button" onClick={() => adjustZoom(-7)} aria-label="تقريب المشهد" title="تقريب" data-testid="button-panorama-zoom-in"><ZoomIn size={18} /></button>
        <button type="button" onClick={() => adjustZoom(7)} aria-label="إبعاد المشهد" title="إبعاد" data-testid="button-panorama-zoom-out"><ZoomOut size={18} /></button>
        <button type="button" onClick={() => resetRef.current?.()} aria-label="إعادة ضبط زاوية المشهد" title="إعادة الضبط" data-testid="button-panorama-reset"><RotateCcw size={17} /></button>
      </div>
      <div className="panorama-hint"><span /> اسحب لاستكشاف المشهد · استخدم عجلة الفأرة للتقريب</div>
    </div>
  );
}
