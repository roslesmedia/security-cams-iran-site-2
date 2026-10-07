import { useEffect, useRef } from "react";
import * as T from "three";
import { createStudioLighting } from "./StudioLighting";
import { makeCatalogModel } from "./CatalogModel";
import { categories } from "./data";
export default function Product3DViewer({
  category,
  finish = "ivory",
  orientation = "angled",
}: {
  category: string;
  finish?: string;
  orientation?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const host = ref.current;
    if (!host) return;
    window.dispatchEvent(new CustomEvent("didban-viewer", { detail: true }));
    const ids = [
      "turret",
      "bullet",
      "dome",
      "ptz",
      "indoor",
      "battery",
      "solar",
      "panorama",
      "doorbell",
      "thermal",
    ];
    const index = Math.max(0, categories.indexOf(category));
    const shape = ids.includes(category)
      ? category
      : category === "panoramic"
        ? "panorama"
        : ids[index];
    let renderer: T.WebGLRenderer;
    try {
      renderer = new T.WebGLRenderer({ antialias: true, alpha: true });
    } catch {
      const poster = document.createElement("img");
      poster.src = "/assets/camera-" + shape + ".webp";
      poster.alt =
        "نمای مفهومی دوربین؛ نمایش سه‌بعدی در این مرورگر در دسترس نیست";
      poster.style.cssText = "width:100%;height:100%;object-fit:contain";
      host.appendChild(poster);
      return () => {
        host.replaceChildren();
        window.dispatchEvent(
          new CustomEvent("didban-viewer", { detail: false }),
        );
      };
    }
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.25));
    host.appendChild(renderer.domElement);
    const scene = new T.Scene(),
      camera = new T.PerspectiveCamera(32, 1, 0.1, 30);
    camera.position.set(0, 0.1, 8);
    const lighting = createStudioLighting(renderer, scene);
    const root = makeCatalogModel(shape, finish);
    root.rotation.set(
      orientation === "downward" ? 0.12 : -0.12,
      orientation === "straight"
        ? -0.48
        : orientation === "angled"
          ? 0.05
          : 0.65,
      0,
    );
    scene.add(root);
    let frame = 0,
      disposed = false,
      contextLost = false;
    const render = () => {
      if (frame || disposed || contextLost || document.hidden) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        if (!disposed && !contextLost) renderer.render(scene, camera);
      });
    };
    const resize = () => {
      const width = Math.max(1, host.clientWidth),
        height = Math.max(1, host.clientHeight);
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      render();
    };
    const observer = new ResizeObserver(resize);
    observer.observe(host);
    let dragging = false,
      x = 0;
    const down = (e: PointerEvent) => {
      dragging = true;
      x = e.clientX;
      host.setPointerCapture(e.pointerId);
    };
    const move = (e: PointerEvent) => {
      if (!dragging) return;
      root.rotation.y += (e.clientX - x) * 0.012;
      x = e.clientX;
      render();
    };
    const up = () => {
      dragging = false;
    };
    const key = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
        e.preventDefault();
        root.rotation.y += e.key === "ArrowLeft" ? -0.15 : 0.15;
        render();
      }
    };
    host.addEventListener("pointerdown", down);
    host.addEventListener("pointermove", move);
    host.addEventListener("pointerup", up);
    host.addEventListener("pointercancel", up);
    host.addEventListener("keydown", key);
    const lost = (e: Event) => {
      e.preventDefault();
      contextLost = true;
      renderer.domElement.style.display = "none";
      const img = document.createElement("img");
      img.src = "/assets/camera-" + shape + ".webp";
      img.alt = "نمای مفهومی دوربین";
      img.style.cssText = "height:100%;width:100%;object-fit:contain";
      host.appendChild(img);
    };
    renderer.domElement.addEventListener("webglcontextlost", lost);
    resize();
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
      host.removeEventListener("pointerdown", down);
      host.removeEventListener("pointermove", move);
      host.removeEventListener("pointerup", up);
      host.removeEventListener("pointercancel", up);
      host.removeEventListener("keydown", key);
      renderer.domElement.removeEventListener("webglcontextlost", lost);
      const geometries = new Set<T.BufferGeometry>();
      const materials = new Set<T.Material>();
      const textures = new Set<T.Texture>();
      scene.traverse((object) => {
        if (!(object instanceof T.Mesh)) return;
        if (object instanceof T.InstancedMesh) object.dispose();
        geometries.add(object.geometry);
        (Array.isArray(object.material)
          ? object.material
          : [object.material]
        ).forEach((material) => {
          materials.add(material);
          Object.values(material).forEach((value) => {
            if (value instanceof T.Texture) textures.add(value);
          });
        });
      });
      geometries.forEach((geometry) => geometry.dispose());
      materials.forEach((material) => material.dispose());
      textures.forEach((texture) => texture.dispose());
      lighting.dispose();
      renderer.dispose();
      host.replaceChildren();
      window.dispatchEvent(new CustomEvent("didban-viewer", { detail: false }));
    };
  }, [category, finish, orientation]);
  return (
    <div>
      <div
        ref={ref}
        tabIndex={0}
        role="img"
        aria-label="نمایش مفهومی سه‌بعدی، برای چرخاندن کلیدهای جهت یا لمس را به‌کار ببرید"
        style={{
          height: 320,
          width: "100%",
          touchAction: "pan-y",
          background: "#efede6",
        }}
      />
      <p style={{ fontSize: 11, color: "#737b69" }}>
        نمایش مفهومی فرم دوربین · برای چرخاندن بکشید یا از کلیدهای جهت استفاده
        کنید.
      </p>
    </div>
  );
}
