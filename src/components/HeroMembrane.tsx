"use client";

import { Canvas, useFrame, useThree, useLoader } from "@react-three/fiber";
import { animate } from "motion";
import {
  Component,
  Suspense,
  useEffect,
  useRef,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import {
  DoubleSide,
  TextureLoader,
  SRGBColorSpace,
  type Mesh,
  type MeshPhysicalMaterial,
  type PlaneGeometry,
} from "three";

const smooth = (value: number) => {
  const t = Math.max(0, Math.min(1, value));
  return t * t * (3 - 2 * t);
};

function Membrane({
  onComplete,
  onReady,
}: {
  onComplete: () => void;
  onReady: () => void;
}) {
  const mesh = useRef<Mesh<PlaneGeometry, MeshPhysicalMaterial>>(null);
  const logo = useRef<Mesh<PlaneGeometry>>(null);
  const sourceTexture = useLoader(
    TextureLoader,
    "/brand/vd-barrisol-logo-transparent.png",
  );
  const texture = useMemo(() => {
    const copy = sourceTexture.clone();
    copy.colorSpace = SRGBColorSpace;
    return copy;
  }, [sourceTexture]);
  useEffect(() => () => texture.dispose(), [texture]);
  const progress = useRef(0);
  const { viewport, invalidate } = useThree();

  useEffect(() => {
    const frame = requestAnimationFrame(() => requestAnimationFrame(onReady));
    const playback = animate(0, 1, {
      duration: 3.1,
      ease: "linear",
      onUpdate: (value) => {
        progress.current = value;
        invalidate();
      },
      onComplete,
    });
    return () => {
      cancelAnimationFrame(frame);
      playback.stop();
    };
  }, [invalidate, onComplete, onReady]);

  useFrame(() => {
    if (!mesh.current) return;
    const { geometry } = mesh.current;
    const positions = geometry.attributes.position;
    const uv = geometry.attributes.uv;
    const p = progress.current;
    const tension = smooth(p / 0.36);
    for (let i = 0; i < positions.count; i++) {
      const x = uv.getX(i) * 2 - 1;
      const y = uv.getY(i) * 2 - 1;
      // Bilinear corner weights stagger the four pulls while keeping the sheet continuous.
      const weights = [
        (1 - x) * (1 + y),
        (1 + x) * (1 - y),
        (1 + x) * (1 + y),
        (1 - x) * (1 - y),
      ];
      let pull = 0;
      for (let corner = 0; corner < 4; corner++) {
        pull += weights[corner] * 0.25 * smooth((p - corner * 0.02) / 0.28);
      }
      const loose = 1 - tension;
      const centre = (1 - x * x) * (1 - y * y);
      const edgeX = 1 - 0.13 * (1 - y * y) * loose;
      const edgeY = 1 - 0.13 * (1 - x * x) * loose;
      let folds = 0;
      for (let corner = 0; corner < 4; corner++) {
        const cx = corner % 2 ? 1 : -1;
        const cy = corner < 2 ? 1 : -1;
        const dx = x - cx;
        const dy = y - cy;
        const distance = Math.hypot(dx, dy);
        const angle = Math.atan2(dy, dx);
        folds +=
          Math.sin(angle * 13 + distance * 9 - tension * 3) *
          Math.exp(-distance * 1.7) *
          Math.min(distance * 3, 1);
      }
      positions.setXYZ(
        i,
        x * viewport.width * 0.66 * (0.94 + 0.06 * pull) * edgeX,
        y * viewport.height * 0.66 * (0.94 + 0.06 * pull) * edgeY,
        loose * (-centre * 0.75 + folds * 0.16),
      );
    }
    const lift = smooth((p - 0.43) / 0.57);
    const radius = Math.min(viewport.width, viewport.height) * 0.12;
    const bend = (x: number, y: number, z: number) => {
      const front =
        -viewport.height * 0.68 +
        lift * (viewport.height * 1.5 + radius * 4) +
        (x / viewport.width) * Math.sin(lift * Math.PI) * 1.2;
      const distance = Math.max(0, front - y);
      const angle = Math.min(distance / radius, Math.PI);
      return [
        x,
        distance
          ? front -
            Math.sin(angle) * radius +
            Math.max(0, distance - Math.PI * radius)
          : y,
        z + radius * (1 - Math.cos(angle)),
      ];
    };
    for (let i = 0; i < positions.count; i++) {
      const [x, y, z] = bend(
        positions.getX(i),
        positions.getY(i),
        positions.getZ(i),
      );
      positions.setXYZ(i, x, y, z);
    }
    if (logo.current) {
      const g = logo.current.geometry;
      const pos = g.attributes.position;
      const u = g.attributes.uv;
      const width = Math.min(viewport.width * 0.55, 3.6);
      for (let i = 0; i < pos.count; i++) {
        const x = (u.getX(i) - 0.5) * width;
        const y =
          ((u.getY(i) - 0.5) * width * texture.image.height) /
          texture.image.width;
        const nx = x / (viewport.width * 0.66),
          ny = y / (viewport.height * 0.66);
        const [px, py, pz] = bend(
          x,
          y,
          -(1 - nx * nx) * (1 - ny * ny) * 0.75 * (1 - tension),
        );
        pos.setXYZ(i, px, py, pz + 0.015);
      }
      pos.needsUpdate = true;
      g.computeVertexNormals();
    }
    positions.needsUpdate = true;
    geometry.computeVertexNormals();
  });

  return (
    <>
      <mesh ref={mesh} frustumCulled={false}>
        <planeGeometry args={[2, 2, 80, 100]} />
        <meshPhysicalMaterial
          color="#454545"
          roughness={0.36}
          metalness={0}
          clearcoat={0.35}
          clearcoatRoughness={0.4}
          side={DoubleSide}
        />
      </mesh>
      <mesh ref={logo} frustumCulled={false} renderOrder={2}>
        <planeGeometry args={[2, 2, 32, 24]} />
        <meshBasicMaterial
          depthTest={false}
          depthWrite={false}
          map={texture}
          transparent
          side={DoubleSide}
          toneMapped={false}
        />
      </mesh>
    </>
  );
}

class CanvasFallback extends Component<
  { children: ReactNode; onComplete: () => void },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onComplete();
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

export default function HeroMembrane({
  onComplete,
  locale,
}: {
  onComplete: () => void;
  locale: "ro" | "en";
}) {
  const container = useRef<HTMLDivElement>(null);
  const ready = useRef(false);
  const markReady = useCallback(() => {
    if (ready.current) return;
    if (document.documentElement.dataset.vdIntro !== "pending") {
      onComplete();
      return;
    }
    ready.current = true;
    container.current?.classList.add("is-ready");
    document.documentElement.dataset.vdIntro = "playing";
  }, [onComplete]);
  useEffect(() => {
    const previousFocus = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const siblings = Array.from(document.body.children).filter(
      (el): el is HTMLElement =>
        el instanceof HTMLElement && el !== container.current,
    );
    const prior = siblings.map((el) => el.inert);
    siblings.forEach((el) => {
      el.inert = true;
    });
    container.current?.querySelector("button")?.focus({ preventScroll: true });
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onComplete();
    };
    document.addEventListener("keydown", escape);
    const timeout = setTimeout(() => {
      if (!ready.current) onComplete();
    }, 2500);
    return () => {
      clearTimeout(timeout);
      document.removeEventListener("keydown", escape);
      document.body.style.overflow = overflow;
      siblings.forEach((el, index) => {
        el.inert = prior[index];
      });
      previousFocus?.focus({ preventScroll: true });
    };
  }, [onComplete]);
  return createPortal(
    <div
      ref={container}
      className="site-membrane"
      role="dialog"
      aria-modal="true"
      aria-label={
        locale === "ro" ? "Introducere VD BARRISOL" : "VD BARRISOL introduction"
      }
    >
      <div className="site-membrane__canvas" aria-hidden="true">
        <CanvasFallback onComplete={onComplete}>
          <Canvas
            orthographic
            camera={{ position: [0, 0, 14], zoom: 90 }}
            dpr={[1, 1.5]}
            frameloop="demand"
            events={undefined}
            gl={{ alpha: true, antialias: true, powerPreference: "low-power" }}
            fallback={null}
          >
            <ambientLight intensity={1.6} />
            <directionalLight position={[-3, 4, 5]} intensity={4} />
            <directionalLight
              position={[4, -2, 2]}
              intensity={0.8}
              color="#FF7A30"
            />
            <Suspense fallback={null}>
              <Membrane onComplete={onComplete} onReady={markReady} />
            </Suspense>
          </Canvas>
        </CanvasFallback>
      </div>
      <button
        type="button"
        className="site-membrane__skip"
        onClick={onComplete}
      >
        {locale === "ro" ? "Sari peste" : "Skip intro"}{" "}
        <span aria-hidden="true">→</span>
      </button>
    </div>,
    document.body,
  );
}
