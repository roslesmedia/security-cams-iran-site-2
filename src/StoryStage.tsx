import { useEffect, useRef, useState } from "react";
import * as T from "three";
import { createStudioLighting } from "./StudioLighting";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { makeCamera } from "./CameraModel";
import { applyStory, phase } from "./StoryTimeline";
import "./story.css";
gsap.registerPlugin(ScrollTrigger);
const chapters = [
  {
    tag: "نگاهی دقیق‌تر. خیالی آسوده‌تر.",
    title: (
      <>
        هر زاویه،
        <br />
        یک انتخاب دقیق.
      </>
    ),
    copy: "دوربین و تجهیزات نظارتی، از چند برند معتبر.",
  },
  {
    tag: "از نزدیک، دقیق‌تر.",
    title: (
      <>
        همه‌چیز،
        <br />
        از یک نگاه آغاز می‌شود.
      </>
    ),
    copy: "فرم، نور و جزئیاتی که تصویر را می‌سازند.",
  },
  {
    tag: "نمای مفهومی ساختار دوربین",
    title: <>جزئیات را ببینید.</>,
    copy: "بدنه، روشنایی مادون قرمز، حسگر و لنز؛ یک تصویر، از چند بخش.",
  },
  {
    tag: "از طراحی تا جای درست",
    title: <>برای فضای شما.</>,
    copy: "انتخاب دوربین، از شناخت فضا آغاز می‌شود.",
  },
  {
    tag: "از روشنایی روز تا آرامش شب",
    title: (
      <>
        نور عوض می‌شود.
        <br />
        نگاه ادامه دارد.
      </>
    ),
    copy: "مقایسه روشنایی، یک راهنمای تصویری برای انتخاب شما.",
  },
  {
    tag: "فضا را بهتر بشناسید",
    title: (
      <>
        آنچه اهمیت دارد،
        <br />
        در یک قاب.
      </>
    ),
    copy: "نمای نصب و رویداد نمونه؛ برای تصور انتخاب درست.",
  },
  {
    tag: "هر فضا، یک نگاه",
    title: (
      <>
        انتخاب شما،
        <br />
        از اینجا شروع می‌شود.
      </>
    ),
    copy: "فرم‌های متفاوت؛ برای نیازهای متفاوت.",
  },
];
const bounds = [0, 0.14, 0.24, 0.42, 0.54, 0.69, 0.84, 1.01];
export default function StoryStage() {
  const [reducedMotion, setReducedMotion] = useState(
    () => matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  useEffect(() => {
    const preference = matchMedia("(prefers-reduced-motion: reduce)");
    const changed = () => setReducedMotion(preference.matches);
    preference.addEventListener("change", changed);
    return () => preference.removeEventListener("change", changed);
  }, []);
  const trackRef = useRef<HTMLElement>(null),
    stageRef = useRef<HTMLDivElement>(null),
    canvasRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const track = trackRef.current,
      stage = stageRef.current,
      host = canvasRef.current;
    if (!track || !stage || !host) return;
    const chapterNodes = Array.from(
      stage.querySelectorAll<HTMLElement>(".chapter-copy"),
    );
    const counter = stage.querySelector(".story-counter");
    // The static story has the same content without paying for a WebGL context.
    if (reducedMotion) {
      chapterNodes.forEach((node) => {
        node.style.opacity = "1";
        node.style.visibility = "visible";
        node.removeAttribute("aria-hidden");
        node.inert = false;
      });
      return;
    }

    let renderer: T.WebGLRenderer | undefined;
    let scene: T.Scene | undefined;
    let camera: T.PerspectiveCamera | undefined;
    let model: ReturnType<typeof makeCamera> | undefined;
    let lighting: ReturnType<typeof createStudioLighting> | undefined;
    let shadow: T.Mesh<T.PlaneGeometry, T.MeshBasicMaterial> | undefined;
    let current = 0,
      target = 0,
      raf = 0,
      initRaf = 0,
      last = 0;
    let visible = true,
      viewerActive = false,
      disposed = false,
      contextLost = false;
    let width = 1,
      height = 1,
      mobile = false,
      previousChapter = -1;
    const styleCache = new WeakMap<HTMLElement, Map<string, string>>();
    const write = (node: HTMLElement, property: string, value: string) => {
      let cache = styleCache.get(node);
      if (!cache) {
        cache = new Map();
        styleCache.set(node, cache);
      }
      if (cache.get(property) === value) return;
      cache.set(property, value);
      node.style.setProperty(property, value);
    };
    function updateDOM(p: number) {
      if (!stage) return;
      const progress = p.toFixed(3);
      if (stage.dataset.progress !== progress)
        stage.dataset.progress = progress;
      write(
        stage,
        "--graphite-rise",
        `${((1 - phase(p, 0.135, 0.205)) * 100).toFixed(2)}%`,
      );
      write(
        stage,
        "--bone-rise",
        `${((1 - phase(p, 0.84, 0.92)) * 100).toFixed(2)}%`,
      );
      write(
        stage,
        "--installation",
        (phase(p, 0.445, 0.51) * (1 - phase(p, 0.84, 0.89))).toFixed(3),
      );
      write(
        stage,
        "--wipe",
        `${((1 - phase(p, 0.56, 0.65)) * 100).toFixed(2)}%`,
      );
      write(stage, "--plan", phase(p, 0.7, 0.77).toFixed(3));
      write(
        stage,
        "--event",
        (phase(p, 0.733, 0.77) * (1 - phase(p, 0.84, 0.88))).toFixed(3),
      );
      write(
        stage,
        "--engineering",
        (phase(p, 0.27, 0.335) * (1 - phase(p, 0.425, 0.475))).toFixed(3),
      );
      const chapter = Math.max(
        0,
        bounds.findIndex((b, i) => p >= b && p < bounds[i + 1]),
      );
      if (chapter !== previousChapter) {
        stage.dataset.chapter = String(chapter);
        if (counter) counter.textContent = `0${chapter + 1} / 07`;
        previousChapter = chapter;
      }
      chapterNodes.forEach((node, i) => {
        const fadeIn =
          i === 0
            ? 1
            : i === 6
              ? phase(p, 0.9, 0.92)
              : phase(p, bounds[i], bounds[i] + 0.026);
        const opacity =
          fadeIn * (1 - phase(p, bounds[i + 1] - 0.008, bounds[i + 1]));
        const hidden = opacity <= 0.01;
        write(node, "opacity", opacity.toFixed(3));
        write(node, "visibility", hidden ? "hidden" : "visible");
        write(
          node,
          "transform",
          `translate3d(0, ${((1 - fadeIn) * 22).toFixed(2)}px, 0)`,
        );
        if (node.getAttribute("aria-hidden") !== String(hidden)) {
          node.setAttribute("aria-hidden", String(hidden));
          node.inert = hidden;
        }
      });
    }
    function render() {
      if (!renderer || !scene || !camera || !model || contextLost || disposed)
        return;
      applyStory(current, model.root, model.groups, mobile);
      if (shadow) {
        shadow.visible = current < 0.14 || current > 0.89;
        shadow.position.x = model.root.position.x;
        shadow.position.y = model.root.position.y - model.root.scale.x * 1.57;
        shadow.scale.setScalar(model.root.scale.x);
      }
      renderer.render(scene, camera);
      if (!stage!.classList.contains("webgl-ready"))
        stage!.classList.add("webgl-ready");
    }
    function tick(time: number) {
      raf = 0;
      if (disposed || document.hidden || !visible || viewerActive) return;
      const dt = Math.min(0.25, (time - last) / 1000) || 1 / 60;
      last = time;
      current += (target - current) * (1 - Math.exp(-12 * dt));
      if (Math.abs(target - current) < 0.00008) current = target;
      updateDOM(current);
      render();
      if (current !== target) raf = requestAnimationFrame(tick);
    }
    function wake() {
      if (!raf && !disposed && !document.hidden && visible && !viewerActive) {
        last = performance.now();
        raf = requestAnimationFrame(tick);
      }
    }
    function resize() {
      if (!host) return;
      // All layout reads stay in ResizeObserver, never in the animation loop.
      width = Math.max(1, host.clientWidth);
      height = Math.max(1, host.clientHeight);
      mobile = width < 700;
      if (renderer && camera) {
        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
      }
      wake();
    }
    const trigger = ScrollTrigger.create({
      trigger: track,
      start: "top top",
      end: "bottom bottom",
      onUpdate: (s) => {
        target = s.progress;
        wake();
      },
      onRefresh: (s) => {
        target = s.progress;
        current = target;
        wake();
      },
    });
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(host);
    const intersection = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) wake();
    });
    intersection.observe(stage);
    const visibility = () => {
      if (!document.hidden) wake();
    };
    const viewer = (event: Event) => {
      viewerActive = Boolean((event as CustomEvent).detail);
      if (!viewerActive) wake();
    };
    const lost = (event: Event) => {
      event.preventDefault();
      contextLost = true;
      stage.classList.remove("webgl-ready");
      stage.classList.add("story-fallback");
    };
    const restored = () => {
      if (renderer && scene) {
        lighting?.dispose();
        lighting = createStudioLighting(renderer, scene);
      }
      contextLost = false;
      stage.classList.remove("story-fallback");
      wake();
    };
    document.addEventListener("visibilitychange", visibility);
    window.addEventListener("didban-viewer", viewer);
    updateDOM(trigger.progress);
    resize();

    // Give the HTML heading and poster an actual paint before compiling shaders.
    initRaf = requestAnimationFrame(() => {
      initRaf = requestAnimationFrame(() => {
        if (disposed) return;
        try {
          renderer = new T.WebGLRenderer({
            antialias: true,
            alpha: true,
            powerPreference: "high-performance",
          });
          renderer.setPixelRatio(
            Math.min(devicePixelRatio, mobile ? 1.25 : 1.5),
          );
          scene = new T.Scene();
          camera = new T.PerspectiveCamera(31, width / height, 0.1, 60);
          camera.position.set(0, 0.05, 10.9);
          camera.lookAt(0, 0, 0);
          lighting = createStudioLighting(renderer, scene);
          model = makeCamera();
          scene.add(model.root);
          const shadowCanvas = document.createElement("canvas");
          shadowCanvas.width = shadowCanvas.height = 128;
          const ctx = shadowCanvas.getContext("2d")!;
          const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 62);
          gradient.addColorStop(0, "rgba(18,21,17,.25)");
          gradient.addColorStop(0.4, "rgba(18,21,17,.12)");
          gradient.addColorStop(1, "rgba(18,21,17,0)");
          ctx.fillStyle = gradient;
          ctx.fillRect(0, 0, 128, 128);
          shadow = new T.Mesh(
            new T.PlaneGeometry(4.2, 0.65),
            new T.MeshBasicMaterial({
              map: new T.CanvasTexture(shadowCanvas),
              transparent: true,
              depthWrite: false,
              toneMapped: false,
            }),
          );
          shadow.position.z = -0.4;
          scene.add(shadow);
          renderer.domElement.addEventListener("webglcontextlost", lost);
          renderer.domElement.addEventListener(
            "webglcontextrestored",
            restored,
          );
          renderer.setSize(width, height, false);
          host.appendChild(renderer.domElement);
          wake();
        } catch {
          stage.classList.add("story-fallback");
          renderer?.dispose();
          renderer = undefined;
        }
      });
    });
    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      cancelAnimationFrame(initRaf);
      trigger.kill();
      resizeObserver.disconnect();
      intersection.disconnect();
      document.removeEventListener("visibilitychange", visibility);
      window.removeEventListener("didban-viewer", viewer);
      renderer?.domElement.removeEventListener("webglcontextlost", lost);
      renderer?.domElement.removeEventListener(
        "webglcontextrestored",
        restored,
      );
      const geos = new Set<T.BufferGeometry>(),
        mats = new Set<T.Material>(),
        textures = new Set<T.Texture>();
      scene?.traverse((object) => {
        if (!(object instanceof T.Mesh)) return;
        if (object instanceof T.InstancedMesh) object.dispose();
        geos.add(object.geometry);
        (Array.isArray(object.material)
          ? object.material
          : [object.material]
        ).forEach((material) => {
          mats.add(material);
          Object.values(material).forEach((value) => {
            if (value instanceof T.Texture) textures.add(value);
          });
        });
      });
      geos.forEach((geometry) => geometry.dispose());
      mats.forEach((material) => material.dispose());
      textures.forEach((texture) => texture.dispose());
      lighting?.dispose();
      renderer?.dispose();
      renderer?.domElement.remove();
      stage.classList.remove("webgl-ready", "story-fallback");
    };
  }, [reducedMotion]);
  return (
    <section
      ref={trackRef}
      className="story-track"
      aria-label="داستان دوربین دیدبان"
    >
      <div ref={stageRef} className="story-stage" data-chapter="0">
        <div className="story-graphite" />
        <div className="story-installation">
          <img src="/assets/store.png" alt="نمای مفهومی ورودی فروشگاه" />
          <div className="story-night" />
          <div className="installation-lines">
            <span />
            <span />
            <span />
          </div>
          <div className="installation-person" />
        </div>
        <div className="story-bone" />
        <div ref={canvasRef} className="story-canvas">
          <img
            className="story-poster"
            src="/assets/camera-poster.webp"
            alt="دوربین نظارتی عاجی دیدبان"
          />
        </div>
        <div className="story-chapters">
          {chapters.map((chapter, i) => (
            <article
              className={`chapter-copy chapter-${i}`}
              key={i}
              style={i ? { opacity: 0, visibility: "hidden" } : undefined}
            >
              <span className="chapter-eyebrow">{chapter.tag}</span>
              {i === 0 ? <h1>{chapter.title}</h1> : <h2>{chapter.title}</h2>}
              <p>{chapter.copy}</p>
              <img
                className="reduced-chapter-image"
                src={
                  i === 0
                    ? "/assets/camera-turret.webp"
                    : i === 1
                      ? "/assets/story-macro.webp"
                      : i === 2
                        ? "/assets/story-exploded.webp"
                        : i < 6
                          ? "/assets/store.png"
                          : "/assets/camera-turret.webp"
                }
                alt={
                  i === 2
                    ? "نمای مفهومی اجزای جداشده دوربین"
                    : i < 3
                      ? "نمای مفهومی فرم دوربین"
                      : "نمای تصویری فضای نصب و انتخاب دوربین"
                }
                loading="lazy"
              />
              {i === 0 && (
                <div className="story-actions">
                  <a href="#catalog" className="story-primary">
                    مشاهده محصولات <span>←</span>
                  </a>
                  <a href="#guide" className="story-secondary">
                    راهنمای انتخاب ↙
                  </a>
                </div>
              )}
              {i === 4 && (
                <div className="story-day-labels">
                  <span>روز</span>
                  <span>شب</span>
                </div>
              )}
              {i === 6 && (
                <a className="story-primary" href="#types">
                  فرم مناسب را کشف کنید ←
                </a>
              )}
            </article>
          ))}
        </div>
        <div className="explosion-labels">
          <span>لنز</span>
          <span>مادون قرمز</span>
          <span>حسگر</span>
          <span>بدنه</span>
          <span>پایه</span>
        </div>
        <div className="story-phone">
          <span dir="ltr">19:24</span>
          <div className="story-notification">
            <i /> <b>ورودی فروشگاه</b>
            <small>رویداد نمونه · اکنون</small>
            <img src="/assets/store.png" alt="تصویر نمونه ورودی" />
          </div>
        </div>
        <span className="story-concept">نمایش مفهومی</span>
        <div className="story-bottom">
          <span>طراحی برای دیدن آنچه اهمیت دارد.</span>
          <a href="#types">
            برای کشف جزئیات، اسکرول کنید <i>↓</i>
          </a>
          <span className="story-counter" dir="ltr">
            01 / 07
          </span>
        </div>
        <a className="story-skip" href="#catalog">
          عبور از داستان
        </a>
      </div>
    </section>
  );
}
