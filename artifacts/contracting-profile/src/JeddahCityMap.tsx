import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type MouseEvent,
} from 'react';
import * as THREE from 'three';
import { ArrowRight, RotateCcw, X, ZoomIn, ZoomOut } from 'lucide-react';
import type { DemoProject } from './projects';
import PanoramaViewer from './PanoramaViewer';

type JeddahCityMapProps = {
  projects: DemoProject[];
  onSelect: (projectId: string, event: MouseEvent<HTMLAnchorElement>) => void;
  activeProject: DemoProject | null;
  onCloseProject: () => void;
};

export type JeddahCityMapHandle = {
  flyToProject: (projectId: string) => Promise<boolean>;
};

const arabicNumber = (value: number) =>
  String(value).replace(/[0-9]/g, (digit) => '٠١٢٣٤٥٦٧٨٩'[Number(digit)]);

const JeddahCityMap = forwardRef<JeddahCityMapHandle, JeddahCityMapProps>(
  function JeddahCityMap({ projects, onSelect, activeProject, onCloseProject }, ref) {
  const mountRef = useRef<HTMLDivElement>(null);
  const resetRef = useRef<(() => void) | null>(null);
  const flyToRef = useRef<((projectId: string) => Promise<boolean>) | null>(null);
  const [webglUnavailable, setWebglUnavailable] = useState(false);

  useImperativeHandle(ref, () => ({
    flyToProject: (projectId) => flyToRef.current?.(projectId) ?? Promise.resolve(false),
  }), []);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    let renderer: THREE.WebGLRenderer | undefined;
    const listeners = new AbortController();
    let frameId = 0;
    let disposed = false;
    let resizeObserver: ResizeObserver | undefined;
    let yaw = 0;
    let pitch = 0.68;
    let distance = 22;
    let dragging = false;
    let pointerId: number | null = null;
    let pointerX = 0;
    let pointerY = 0;
    let startYaw = 0;
    let startPitch = 0;
    let flight: {
      startedAt: number;
      fromTarget: THREE.Vector3;
      toTarget: THREE.Vector3;
      fromYaw: number;
      toYaw: number;
      fromPitch: number;
      toPitch: number;
      fromDistance: number;
      toDistance: number;
      resolve: (completed: boolean) => void;
    } | null = null;
    const scene = new THREE.Scene();
    scene.background = null;
    const camera = new THREE.PerspectiveCamera(39, 1, 0.1, 100);
    const target = new THREE.Vector3(0, 0, 0);
    const markerWorld: THREE.Vector3[] = [];
    const projectTargets = new Map<string, THREE.Vector3>();
    const materials: THREE.Material[] = [];
    const geometries: THREE.BufferGeometry[] = [];

    const material = (color: string, roughness = 0.92) => {
      const value = new THREE.MeshStandardMaterial({ color, roughness });
      materials.push(value);
      return value;
    };
    const addBox = (
      x: number, z: number, width: number, depth: number, height: number,
      color: string, yOffset = 0,
    ) => {
      const geometry = new THREE.BoxGeometry(width, height, depth);
      geometries.push(geometry);
      const mesh = new THREE.Mesh(geometry, material(color));
      mesh.position.set(x, height / 2 + yOffset, z);
      scene.add(mesh);
      return mesh;
    };
    const addLine = (
      points: THREE.Vector3[],
      color: string,
      transparent = false,
      opacity = 1,
    ) => {
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      geometries.push(geometry);
      const lineMaterial = new THREE.LineBasicMaterial({ color, transparent, opacity });
      materials.push(lineMaterial);
      scene.add(new THREE.Line(geometry, lineMaterial));
    };

    try {
      const activeRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
      renderer = activeRenderer;
      activeRenderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.7));
      activeRenderer.outputColorSpace = THREE.SRGBColorSpace;
      activeRenderer.toneMapping = THREE.ACESFilmicToneMapping;
      activeRenderer.toneMappingExposure = 1.1;
      activeRenderer.setClearColor('#f4f0e7', 0);
      activeRenderer.domElement.setAttribute('aria-hidden', 'true');
      mount.appendChild(activeRenderer.domElement);

      scene.add(new THREE.HemisphereLight('#fff9ed', '#8b8877', 2.05));
      const sun = new THREE.DirectionalLight('#fff5df', 2.5);
      sun.position.set(-7, 15, 10);
      scene.add(sun);

      const groundGeometry = new THREE.PlaneGeometry(19, 14);
      geometries.push(groundGeometry);
      const groundMaterial = new THREE.MeshBasicMaterial({ color: '#f4f0e7', toneMapped: false });
      materials.push(groundMaterial);
      const ground = new THREE.Mesh(groundGeometry, groundMaterial);
      ground.rotation.x = -Math.PI / 2;
      ground.position.set(0, -0.12, 0);
      scene.add(ground);

      const seaGeometry = new THREE.ShapeGeometry(new THREE.Shape([
        new THREE.Vector2(-10, -8), new THREE.Vector2(-6.4, -8),
        new THREE.Vector2(-6.05, -5.3), new THREE.Vector2(-6.55, -2.4),
        new THREE.Vector2(-5.95, .2), new THREE.Vector2(-6.2, 2.7),
        new THREE.Vector2(-5.65, 5.1), new THREE.Vector2(-5.95, 8),
        new THREE.Vector2(-10, 8),
      ]));
      geometries.push(seaGeometry);
      const sea = new THREE.Mesh(seaGeometry, material('#a9c1bd', 0.72));
      sea.rotation.x = -Math.PI / 2;
      sea.position.y = -0.07;
      scene.add(sea);

      const coastPoints = [
        [-6.4, -7], [-6.05, -5.3], [-6.55, -2.4], [-5.95, .2],
        [-6.2, 2.7], [-5.65, 5.1], [-5.95, 7],
      ].map(([x, z]) => new THREE.Vector3(x, 0.015, z));
       addLine(coastPoints, '#819f97');

      for (let i = 0; i < 6; i += 1) {
        const wavePoints = [
          new THREE.Vector3(-9.4 + i * 0.36, 0.005, -6.4),
          new THREE.Vector3(-8.95 + i * 0.36, 0.005, -3.2),
          new THREE.Vector3(-9.35 + i * 0.36, 0.005, 0.1),
          new THREE.Vector3(-8.9 + i * 0.36, 0.005, 3.2),
          new THREE.Vector3(-9.2 + i * 0.36, 0.005, 6.3),
        ];
         addLine(wavePoints, '#c4d4cd', true, 0.8);
      }

      const asphalt = material('#c3bbaa');
      const paleRoad = material('#e9e2d5');
      const addRoad = (x: number, z: number, width: number, length: number, rotation = 0) => {
         const roadGeometry = new THREE.PlaneGeometry(width, length);
         geometries.push(roadGeometry);
         const road = new THREE.Mesh(roadGeometry, asphalt);
        road.rotation.x = -Math.PI / 2;
         road.rotation.y = rotation;
        road.position.set(x, 0.005, z);
        scene.add(road);
         const centerGeometry = new THREE.PlaneGeometry(0.035, length);
         geometries.push(centerGeometry);
         const center = new THREE.Mesh(centerGeometry, paleRoad);
        center.rotation.x = -Math.PI / 2;
         center.rotation.y = rotation;
        center.position.set(x, 0.012, z);
        scene.add(center);
      };
      for (let z = -6; z <= 6; z += 2.4) addRoad(-0.3, z, 0.28, 12.8, 0);
      for (let x = -4.6; x <= 8; x += 2.4) addRoad(x, 0, 0.26, 12, Math.PI / 2);
      addRoad(1.1, 0, 0.5, 14, -0.28);
      addRoad(3.4, 0, 0.42, 14, 0.23);

      // Repeating street blocks are intentionally illustrative, not geospatial data.
      const buildingColors = ['#bdb3a2', '#c8beae', '#a9a394', '#d1c7b7', '#aaa99d', '#c0ad99'];
      for (let row = 0; row < 8; row += 1) {
        for (let col = 0; col < 9; col += 1) {
          const x = -4.2 + col * 1.48 + ((row * 7 + col * 3) % 5) * 0.08;
          const z = -6.25 + row * 1.72 + ((col * 5 + row) % 4) * 0.06;
          if (x < -5.4 || ((col + row * 2) % 7 === 0)) continue;
          const width = 0.48 + ((row * 3 + col) % 4) * 0.12;
          const depth = 0.48 + ((col * 2 + row) % 3) * 0.13;
          const height = 0.34 + ((row * 11 + col * 7) % 9) * 0.14;
          const building = addBox(x, z, width, depth, height, buildingColors[(row + col) % buildingColors.length], 0.025);
          if ((row + col) % 4 === 0) {
            addBox(x, z, width * 0.72, depth * 0.72, 0.12, '#978f80', height + 0.04);
          }
          if (height > 1.1) {
            building.material = material('#b0aa9a');
          }
        }
      }
      // A few taller landmarks give the skyline a distinct, non-uniform profile.
      addBox(1.6, -1.6, 0.82, 0.72, 2.25, '#9d9c91');
      addBox(5.1, 2.8, 0.9, 0.82, 2.8, '#b5a996');
      addBox(-1.1, 3.8, 0.78, 0.68, 1.9, '#a8a394');

      projects.forEach((project) => {
        const x = -8.1 + (project.mapPosition.x / 100) * 16.2;
        const z = -6 + (project.mapPosition.y / 100) * 12;
        const projectTarget = new THREE.Vector3(x, 0.45, z);
        markerWorld.push(projectTarget);
        projectTargets.set(project.id, projectTarget);
        const halo = new THREE.Mesh(
          new THREE.CylinderGeometry(0.43, 0.43, 0.025, 32),
          material('#a2533c'),
        );
        halo.position.set(x, 0.025, z);
        scene.add(halo);
        const stem = new THREE.Mesh(
          new THREE.CylinderGeometry(0.035, 0.06, 0.68, 10),
          material('#a2533c'),
        );
        stem.position.set(x, 0.37, z);
        scene.add(stem);
        const head = new THREE.Mesh(
          new THREE.SphereGeometry(0.15, 16, 12),
          material('#f4f0e7'),
        );
        head.position.set(x, 0.78, z);
        scene.add(head);
      });

      const updateCamera = () => {
        const horizontal = Math.cos(pitch) * distance;
        camera.position.set(
          target.x + Math.sin(yaw) * horizontal,
          target.y + Math.sin(pitch) * distance,
          target.z + Math.cos(yaw) * horizontal,
        );
        camera.lookAt(target);
      };
      const placeMarkers = () => {
        const width = mount.clientWidth;
        const height = mount.clientHeight;
        markerWorld.forEach((position, index) => {
          const projected = position.clone().project(camera);
          const marker = mount.parentElement?.querySelector<HTMLElement>(`[data-city-marker="${index}"]`);
          if (!marker) return;
          const visible = projected.z > -1 && projected.z < 1 && Math.abs(projected.x) < 0.96 && Math.abs(projected.y) < 0.95;
          marker.style.left = `${(projected.x * 0.5 + 0.5) * width}px`;
          marker.style.top = `${(-projected.y * 0.5 + 0.5) * height}px`;
          marker.classList.toggle('is-visible', visible);
          marker.tabIndex = visible ? 0 : -1;
        });
      };
      const resize = () => {
        if (disposed) return;
        const width = Math.max(1, mount.clientWidth);
        const height = Math.max(1, mount.clientHeight);
        activeRenderer.setSize(width, height, false);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        updateCamera();
        placeMarkers();
      };
      const render = (timestamp: number) => {
        if (disposed) return;
        frameId = requestAnimationFrame(render);
        if (flight) {
          const progress = Math.min((timestamp - flight.startedAt) / 1750, 1);
          const eased = progress * progress * (3 - 2 * progress);
          target.copy(flight.fromTarget).lerp(flight.toTarget, eased);
          target.y += Math.sin(progress * Math.PI) * 1.25;
          yaw = flight.fromYaw + (flight.toYaw - flight.fromYaw) * eased;
          pitch = flight.fromPitch + (flight.toPitch - flight.fromPitch) * eased;
          distance = flight.fromDistance + (flight.toDistance - flight.fromDistance) * eased;
          if (progress >= 1) {
            target.copy(flight.toTarget);
            const finishFlight = flight.resolve;
            flight = null;
            finishFlight(true);
          }
        }
        updateCamera();
        activeRenderer.render(scene, camera);
        placeMarkers();
      };
      const flyToProject = (projectId: string) => {
        const destination = projectTargets.get(projectId);
        if (!destination || flight) return Promise.resolve(false);
        return new Promise<boolean>((resolve) => {
          const angleToProject = Math.atan2(destination.x - target.x, destination.z - target.z);
          const yawDifference = Math.atan2(
            Math.sin(angleToProject - yaw),
            Math.cos(angleToProject - yaw),
          );
          flight = {
            startedAt: performance.now(),
            fromTarget: target.clone(),
            toTarget: new THREE.Vector3(destination.x, 0.25, destination.z),
            fromYaw: yaw,
            toYaw: yaw + yawDifference * 0.18,
            fromPitch: pitch,
            toPitch: 0.48,
            fromDistance: distance,
            toDistance: 4.4,
            resolve,
          };
          mount.parentElement?.classList.add('is-flying');
        });
      };
      const pointerDown = (event: PointerEvent) => {
        if (flight || (event.target as HTMLElement).closest('a,button')) return;
        dragging = true;
        pointerId = event.pointerId;
        pointerX = event.clientX;
        pointerY = event.clientY;
        startYaw = yaw;
        startPitch = pitch;
        mount.setPointerCapture(event.pointerId);
        mount.classList.add('is-dragging');
      };
      const pointerMove = (event: PointerEvent) => {
        if (!dragging || event.pointerId !== pointerId) return;
        yaw = startYaw + (event.clientX - pointerX) * 0.008;
        pitch = THREE.MathUtils.clamp(startPitch + (pointerY - event.clientY) * 0.006, 0.22, 1.24);
      };
      const pointerUp = (event: PointerEvent) => {
        if (event.pointerId !== pointerId) return;
        dragging = false;
        pointerId = null;
        mount.classList.remove('is-dragging');
      };
      const wheel = (event: WheelEvent) => {
        if (flight) return;
        event.preventDefault();
        distance = THREE.MathUtils.clamp(distance + event.deltaY * 0.012, 14, 31);
      };
      const zoom = (event: Event) => {
        if (flight) return;
        const amount = (event as CustomEvent<number>).detail;
        distance = THREE.MathUtils.clamp(distance + amount, 14, 31);
      };
      const reset = () => {
        if (flight) return;
        yaw = 0;
        pitch = 0.68;
        distance = 22;
        target.set(0, 0, 0);
      };
      mount.addEventListener('pointerdown', pointerDown, { signal: listeners.signal });
      mount.addEventListener('pointermove', pointerMove, { signal: listeners.signal });
      mount.addEventListener('pointerup', pointerUp, { signal: listeners.signal });
      mount.addEventListener('pointercancel', pointerUp, { signal: listeners.signal });
      mount.addEventListener('wheel', wheel, { passive: false, signal: listeners.signal });
      mount.addEventListener('city-map-zoom', zoom, { signal: listeners.signal });
      resetRef.current = reset;
      flyToRef.current = flyToProject;
      resize();
      resizeObserver = new ResizeObserver(resize);
      resizeObserver.observe(mount);
      frameId = requestAnimationFrame(render);
    } catch {
      renderer?.dispose();
      renderer?.domElement.remove();
      renderer = undefined;
      setWebglUnavailable(true);
    }

    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      resizeObserver?.disconnect();
      listeners.abort();
      if (renderer) {
        renderer.dispose();
        renderer.domElement.remove();
      }
      geometries.forEach((geometry) => geometry.dispose());
      materials.forEach((entry) => entry.dispose());
      resetRef.current = null;
      flyToRef.current = null;
      mount.parentElement?.classList.remove('is-flying');
      if (flight) {
        flight.resolve(false);
        flight = null;
      }
    };
  }, [projects]);

  useEffect(() => {
    if (!activeProject) resetRef.current?.();
  }, [activeProject]);

  const changeZoom = (amount: number) => {
    mountRef.current?.dispatchEvent(new CustomEvent('city-map-zoom', { detail: amount }));
  };

  const markers = projects.map((project, index) => (
      <a
        key={project.id}
        href={`/projects/${project.id}`}
        className="city-map-marker"
        data-city-marker={index}
        style={{ animationDelay: `${index * 140}ms` }}
        aria-label={`استكشاف المشهد: ${project.title}`}
        onClick={(event) => onSelect(project.id, event)}
        data-testid={`link-map-pin-${project.id}`}
        tabIndex={webglUnavailable ? 0 : -1}
      >
        <span>{arabicNumber(index + 1)}</span>
      </a>
  ));

  return (
    <div className={`city-map-frame${webglUnavailable ? ' city-map-fallback' : ''}`} dir="rtl">
      {!webglUnavailable ? (
        <>
          <div
            className="city-map-canvas"
            ref={mountRef}
            role="application"
            tabIndex={0}
            aria-label="مجسم تفاعلي توضيحي لمدينة جدة. اسحب للتدوير واستخدم عجلة الفأرة للتقريب."
          />
          <div className="city-map-overlay-label city-map-jeddah">جدة <span>تصوّر حضري</span></div>
          <div className="city-map-overlay-label city-map-sea">البحر الأحمر</div>
          <div className="city-map-north" aria-hidden="true"><span>شمال</span><b>↑</b></div>
          {markers}
        </>
      ) : (
        <div className="city-map-static" role="group" aria-label="خريطة تخطيطية بديلة لمدينة جدة">
          <div className="static-water"><span>البحر الأحمر</span></div>
          <div className="static-coast" />
          <div className="static-city-grid" aria-hidden="true">
            {Array.from({ length: 42 }, (_, index) => (
              <span key={index} style={{ height: `${22 + ((index * 17) % 52)}px` }} />
            ))}
          </div>
          <span className="static-city-name">جدة</span>
          {projects.map((project, index) => (
            <a
              key={project.id}
              href={`/projects/${project.id}`}
              className="city-map-marker static-marker is-visible"
              data-city-marker={index}
              style={{ left: `${project.mapPosition.x}%`, top: `${project.mapPosition.y}%`, animationDelay: `${index * 140}ms` }}
              aria-label={`استكشاف المشهد: ${project.title}`}
              onClick={(event) => onSelect(project.id, event)}
              data-testid={`link-map-pin-${project.id}`}
            ><span>{arabicNumber(index + 1)}</span></a>
          ))}
          <div className="city-map-fallback-note">تعذّر تشغيل العرض الثلاثي الأبعاد؛ اختر علامة لفتح المشروع</div>
        </div>
      )}
      {!webglUnavailable && (
        <>
          <div className="city-map-tools" aria-label="أدوات التحكم بالخريطة">
            <button type="button" onClick={() => changeZoom(-2)} aria-label="تقريب الخريطة" title="تقريب" data-testid="button-map-zoom-in"><ZoomIn size={17} /></button>
            <button type="button" onClick={() => changeZoom(2)} aria-label="إبعاد الخريطة" title="إبعاد" data-testid="button-map-zoom-out"><ZoomOut size={17} /></button>
            <button type="button" onClick={() => resetRef.current?.()} aria-label="إعادة ضبط الخريطة" title="إعادة الضبط" data-testid="button-map-reset"><RotateCcw size={16} /></button>
          </div>
          <div className="city-map-hint"><span /> اسحب للتدوير · عجلة الفأرة للتقريب</div>
        </>
      )}
      <div className="city-map-disclaimer">تصوّر ثلاثي الأبعاد تقريبي لأغراض العرض — لا يمثل خريطة فعلية أو مواقع موثقة</div>
      {activeProject && (
        <section
          className="city-map-project-view"
          key={activeProject.id}
          aria-label={`مشهد المشروع داخل خريطة جدة: ${activeProject.title}`}
          data-testid="panel-project-map-view"
        >
          <PanoramaViewer image={activeProject.panorama} title={activeProject.title} />
          <div className="city-project-topbar">
            <button type="button" onClick={onCloseProject} aria-label="العودة إلى خريطة جدة" data-testid="button-close-project-map-view">
              <ArrowRight size={17} aria-hidden="true" />
              <span>خريطة جدة</span>
            </button>
            <div className="city-project-title">
              <span>{activeProject.city} <i>·</i> {activeProject.type}</span>
              <strong>{activeProject.title}</strong>
            </div>
            <button className="city-project-close" type="button" onClick={onCloseProject} aria-label="إغلاق المشهد" title="إغلاق">
              <X size={18} aria-hidden="true" />
            </button>
          </div>
          <div className="city-project-caption">
            <span>مشهد بانورامي تجريبي — صورة توضيحية وليست صورة لموقع فعلي</span>
            <p>{activeProject.shortDescription}</p>
          </div>
        </section>
      )}
    </div>
  );
});

export default JeddahCityMap;
