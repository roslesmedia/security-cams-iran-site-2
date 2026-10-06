import { useEffect, useRef } from "react";
import * as T from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
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
    let renderer: T.WebGLRenderer;
    try {
      renderer = new T.WebGLRenderer({ antialias: true, alpha: true });
    } catch {
      const poster = document.createElement("img");
      const fallbackShape = category === "panoramic" ? "panorama" : category;
      poster.src = "/assets/camera-" + fallbackShape + ".png";
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
    renderer.toneMapping = T.NeutralToneMapping;
    host.appendChild(renderer.domElement);
    const scene = new T.Scene(),
      camera = new T.PerspectiveCamera(32, 1, 0.1, 30);
    camera.position.set(0, 0.1, 8);
    const pmrem = new T.PMREMGenerator(renderer),
      room = new RoomEnvironment(),
      env = pmrem.fromScene(room, 0.04);
    room.dispose();
    scene.environment = env.texture;
    scene.add(new T.HemisphereLight(0xfffbf0, 0x61685a, 2));
    const light = new T.DirectionalLight(0xffffff, 3);
    light.position.set(-3, 4, 5);
    scene.add(light);
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
    const render = () => renderer.render(scene, camera);
    const resize = () => {
      renderer.setSize(host.clientWidth, host.clientHeight, false);
      camera.aspect = host.clientWidth / host.clientHeight;
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
      renderer.domElement.style.display = "none";
      const img = document.createElement("img");
      img.src = "/assets/camera-" + shape + ".png";
      img.alt = "نمای مفهومی دوربین";
      img.style.cssText = "height:100%;width:100%;object-fit:contain";
      host.appendChild(img);
    };
    renderer.domElement.addEventListener("webglcontextlost", lost);
    resize();
    return () => {
      observer.disconnect();
      host.removeEventListener("pointerdown", down);
      host.removeEventListener("pointermove", move);
      host.removeEventListener("pointerup", up);
      host.removeEventListener("pointercancel", up);
      host.removeEventListener("keydown", key);
      renderer.domElement.removeEventListener("webglcontextlost", lost);
      scene.traverse((o) => {
        if (o instanceof T.Mesh) {
          o.geometry.dispose();
          (Array.isArray(o.material) ? o.material : [o.material]).forEach(
            (m) => {
              Object.values(m).forEach((v) => {
                if (v instanceof T.Texture) v.dispose();
              });
              m.dispose();
            },
          );
        }
      });
      env.dispose();
      pmrem.dispose();
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
