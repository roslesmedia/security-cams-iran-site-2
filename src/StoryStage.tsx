import { useEffect, useRef } from "react";
import * as T from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { makeCamera } from "./CameraModel";
import { applyStory, phase, clamp } from "./StoryTimeline";
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
export default function StoryStage({
  onThumbs,
}: {
  onThumbs?: (v: string[]) => void;
}) {
  const trackRef = useRef<HTMLElement>(null),
    stageRef = useRef<HTMLDivElement>(null),
    canvasRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const track = trackRef.current,
      stage = stageRef.current,
      host = canvasRef.current;
    if (!track || !stage || !host) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let renderer: T.WebGLRenderer | undefined,
      scene: T.Scene,
      camera: T.PerspectiveCamera,
      root: T.Group,
      groups: T.Group[],
      environment: T.WebGLRenderTarget | undefined,
      pmrem: T.PMREMGenerator | undefined;
    let current = 0,
      target = 0,
      raf = 0,
      visible = true,
      viewerActive = false,
      disposed = false,
      last = 0;
    const labelPoint = new T.Vector3();
    let labelWidth = 0,
      labelHeight = 0,
      labelTop = 0;
    function updateDOM(p: number) {
      stage!.dataset.progress = p.toFixed(3);
      stage!.style.setProperty(
        "--graphite-rise",
        `${(1 - phase(p, 0.135, 0.205)) * 100}%`,
      );
      stage!.style.setProperty(
        "--bone-rise",
        `${(1 - phase(p, 0.84, 0.92)) * 100}%`,
      );
      stage!.style.setProperty(
        "--installation",
        String(phase(p, 0.445, 0.51) * (1 - phase(p, 0.84, 0.89))),
      );
      stage!.style.setProperty("--night", String(phase(p, 0.56, 0.65)));
      stage!.style.setProperty(
        "--wipe",
        `${(1 - phase(p, 0.56, 0.65)) * 100}%`,
      );
      stage!.style.setProperty("--plan", String(phase(p, 0.7, 0.77)));
      stage!.style.setProperty(
        "--event",
        String(phase(p, 0.733, 0.77) * (1 - phase(p, 0.84, 0.88))),
      );
      stage!.style.setProperty(
        "--engineering",
        String(phase(p, 0.27, 0.335) * (1 - phase(p, 0.425, 0.475))),
      );
      stage!.dataset.chapter = String(
        Math.max(
          0,
          bounds.findIndex((b, i) => p >= b && p < bounds[i + 1]),
        ),
      );
      stage!
        .querySelectorAll<HTMLElement>(".chapter-copy")
        .forEach((node, i) => {
          const fadeIn =
              i === 0
                ? 1
                : i === 6
                  ? phase(p, 0.9, 0.92)
                  : phase(p, bounds[i], bounds[i] + 0.026),
            fadeOut = 1 - phase(p, bounds[i + 1] - 0.008, bounds[i + 1]);
          const opacity = fadeIn * fadeOut;
          node.style.opacity = String(opacity);
          node.style.visibility = opacity > 0.01 ? "visible" : "hidden";
          if (i === 6) node.style.color = "#232722";
          node.style.transform = `translateY(${(1 - fadeIn) * 22 - fadeOut * 0}px)`;
          node.setAttribute("aria-hidden", opacity > 0.01 ? "false" : "true");
        });
      const counter = stage!.querySelector(".story-counter");
      if (counter)
        counter.textContent = `0${
          Math.max(
            0,
            bounds.findIndex((b, i) => p >= b && p < bounds[i + 1]),
          ) + 1
        } / 07`;
    }
    try {
      renderer = new T.WebGLRenderer({
        antialias: true,
        alpha: true,
        preserveDrawingBuffer: true,
        powerPreference: "high-performance",
      });
      renderer.setPixelRatio(
        Math.min(devicePixelRatio, innerWidth < 700 ? 1.25 : 1.5),
      );
      renderer.outputColorSpace = T.SRGBColorSpace;
      renderer.toneMapping = T.NeutralToneMapping;
      renderer.toneMappingExposure = 1.15;
      host.appendChild(renderer.domElement);
      scene = new T.Scene();
      camera = new T.PerspectiveCamera(31, 1, 0.1, 60);
      camera.position.set(0, 0.05, 10.9);
      camera.lookAt(0, 0, 0);
      pmrem = new T.PMREMGenerator(renderer);
      const room = new RoomEnvironment();
      environment = pmrem.fromScene(room, 0.04);
      room.dispose();
      scene.environment = environment.texture;
      scene.environmentIntensity = 0.95;
      scene.add(new T.HemisphereLight(0xfffcf2, 0x4c5550, 1.8));
      const key = new T.DirectionalLight(0xfffaf0, 3.2);
      key.position.set(-4, 5, 7);
      scene.add(key);
      const rim = new T.DirectionalLight(0xe9f1ff, 2.8);
      rim.position.set(3, 3, -3);
      scene.add(rim);
      const model = makeCamera();
      root = model.root;
      groups = model.groups;
      scene.add(root);
      const shadowCanvas = document.createElement("canvas");
      shadowCanvas.width = 256;
      shadowCanvas.height = 128;
      const ctx = shadowCanvas.getContext("2d")!,
        gradient = ctx.createRadialGradient(128, 64, 2, 128, 64, 120);
      gradient.addColorStop(0, "rgba(35,38,31,.3)");
      gradient.addColorStop(1, "rgba(35,38,31,0)");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 256, 128);
      const shadowTexture = new T.CanvasTexture(shadowCanvas);
      const shadow = new T.Mesh(
        new T.PlaneGeometry(4.4, 1.1),
        new T.MeshBasicMaterial({
          map: shadowTexture,
          transparent: true,
          depthWrite: false,
        }),
      );
      shadow.position.set(-2, -1.65, -0.3);
      scene.add(shadow);
      function render() {
        if (!renderer || disposed) return;
        const state = applyStory(
          current,
          root,
          groups,
          host!.clientWidth < 700,
        );
        shadow.visible = current < 0.14 || current > 0.89;
        shadow.position.x = root.position.x;
        shadow.scale.setScalar(root.scale.x);
        scene.environmentIntensity = 1 - 0.15 * state.explode;
        renderer.render(scene, camera);
        stage!
          .querySelectorAll<HTMLElement>(".explosion-labels span")
          .forEach((label, i) => {
            groups[[3, 4, 2, 0, 1][i]].getWorldPosition(labelPoint);
            labelPoint.project(camera);
            label.style.left = `${(labelPoint.x * 0.5 + 0.5) * labelWidth}px`;
            label.style.top = `${(-labelPoint.y * 0.5 + 0.5) * labelHeight + labelTop + 90}px`;
          });
        stage!.classList.add("webgl-ready");
      }
      function resize() {
        if (!renderer) return;
        const w = host!.clientWidth,
          h = host!.clientHeight;
        labelWidth = w;
        labelHeight = h;
        labelTop = host!.offsetTop;
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        render();
      }
      function tick(time: number) {
        raf = 0;
        if (disposed || document.hidden || !visible || viewerActive) return;
        const dt = Math.min(0.25, (time - last) / 1000) || 0.016;
        last = time;
        current += (target - current) * (1 - Math.exp(-12 * dt));
        if (Math.abs(target - current) < 0.0002) current = target;
        if (!reduced) updateDOM(current);
        render();
        if (current !== target) raf = requestAnimationFrame(tick);
      }
      const wake = () => {
        if (!raf && !disposed) {
          last = performance.now();
          raf = requestAnimationFrame(tick);
        }
      };
      const trigger = reduced
        ? null
        : ScrollTrigger.create({
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
      document.addEventListener("visibilitychange", visibility);
      const viewer = (event: Event) => {
        viewerActive = Boolean((event as CustomEvent).detail);
        if (!viewerActive) wake();
      };
      window.addEventListener("didban-viewer", viewer);
      const lost = (event: Event) => {
        event.preventDefault();
        stage.classList.remove("webgl-ready");
        stage.classList.add("story-fallback");
      };
      renderer.domElement.addEventListener("webglcontextlost", lost);
      const restored = () => {
        stage.classList.remove("story-fallback");
        wake();
      };
      renderer.domElement.addEventListener("webglcontextrestored", restored);
      resize();
      updateDOM(0);
      if (reduced) {
        track.classList.add("reduced-story");
        stage.querySelectorAll<HTMLElement>(".chapter-copy").forEach((node) => {
          node.style.opacity = "1";
          node.style.visibility = "visible";
          node.removeAttribute("aria-hidden");
        });
      }
      ScrollTrigger.refresh();
      return () => {
        disposed = true;
        cancelAnimationFrame(raf);
        trigger?.kill();
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
        scene.traverse((o) => {
          if (o instanceof T.Mesh) {
            geos.add(o.geometry);
            (Array.isArray(o.material) ? o.material : [o.material]).forEach(
              (m) => {
                mats.add(m);
                Object.values(m).forEach((v) => {
                  if (v instanceof T.Texture) textures.add(v);
                });
              },
            );
          }
        });
        geos.forEach((g) => g.dispose());
        mats.forEach((m) => m.dispose());
        textures.forEach((t) => t.dispose());
        environment?.dispose();
        pmrem?.dispose();
        renderer?.dispose();
        host.replaceChildren();
      };
    } catch {
      stage.classList.add("story-fallback");
      const trigger = reduced
        ? null
        : ScrollTrigger.create({
            trigger: track,
            start: "top top",
            end: "bottom bottom",
            onUpdate: (s) => updateDOM(s.progress),
          });
      updateDOM(0);
      if (reduced) {
        track.classList.add("reduced-story");
        stage.querySelectorAll<HTMLElement>(".chapter-copy").forEach((node) => {
          node.style.opacity = "1";
          node.style.visibility = "visible";
          node.removeAttribute("aria-hidden");
        });
      }
      return () => {
        disposed = true;
        trigger?.kill();
        renderer?.dispose();
        host.replaceChildren();
      };
    }
  }, [onThumbs]);
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
            src="/assets/camera-poster.png"
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
                    ? "/assets/camera-turret.png"
                    : i === 1
                      ? "/assets/story-macro.png"
                      : i === 2
                        ? "/assets/story-exploded.png"
                        : i < 6
                          ? "/assets/store.png"
                          : "/assets/camera-turret.png"
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
