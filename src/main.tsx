import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  lazy,
  Suspense,
} from "react";
import { createRoot } from "react-dom/client";
import {
  Search,
  ShoppingBag,
  ArrowLeft,
  ArrowUpLeft,
  X,
  Plus,
  Minus,
  Phone,
  Mail,
  MapPin,
  Instagram,
  Clock,
  Menu,
  Scale,
  SlidersHorizontal,
  Check,
} from "lucide-react";
import {
  brands,
  categories,
  products,
  normalize,
  Product,
  businessConfig,
} from "./data";
import StoryStage from "./StoryStage";
import FAQ from "./FAQ";
import ProductCard from "./ProductCard";
import "./style.css";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);
const Product3DViewer = lazy(() => import("./Product3DViewer"));
const fa = (n: number) => n.toLocaleString("fa-IR");
type Filters = {
  q: string;
  category: string;
  brand: string;
  space: string;
  connection: string;
  sort: string;
  page: number;
};
const readFilters = (): Filters => {
  const u = new URLSearchParams(location.search);
  const requestedPage = Number(u.get("page"));
  return {
    q: u.get("q") || "",
    category: u.get("category") || "",
    brand: u.get("brand") || "",
    space: u.get("space") || "",
    connection: u.get("connection") || "",
    sort: u.get("sort") || "",
    page: Number.isFinite(requestedPage)
      ? Math.max(1, Math.trunc(requestedPage))
      : 1,
  };
};
const emptyFilters: Filters = {
  q: "",
  category: "",
  brand: "",
  space: "",
  connection: "",
  sort: "",
  page: 1,
};
const media = (p: Product) =>
  (p as any).imageUrls?.[0] ||
  `/assets/camera-${["turret", "bullet", "dome", "ptz", "indoor", "battery", "solar", "panorama", "doorbell", "thermal"][categories.indexOf(p.category)] || "bullet"}.png`;
const price = (p: Product) =>
  p.priceToman === null ? "استعلام قیمت" : `${fa(p.priceToman)} تومان`;

function App() {
  const [f, setF] = useState<Filters>(readFilters),
    [route, setRoute] = useState(location.pathname === "/products"),
    [more, setMore] = useState(12),
    [panel, setPanel] = useState(""),
    [detail, setDetail] = useState<Product | null>(null),
    [compare, setCompare] = useState<number[]>([]),
    [basket, setBasket] = useState<Record<string, number>>(() => {
      try {
        const v = JSON.parse(localStorage.getItem("didban-basket") || "{}");
        return Object.fromEntries(
          Object.entries(v).filter(
            ([id, n]) =>
              products.some((p) => p.id === +id) &&
              typeof n === "number" &&
              n > 0,
          ),
        ) as Record<string, number>;
      } catch {
        return {};
      }
    }),
    [brandQ, setBrandQ] = useState(""),
    [allBrands, setAllBrands] = useState(false),
    [gallery, setGallery] = useState(0),
    [viewer, setViewer] = useState(false),
    [formSummary, setFormSummary] = useState(""),
    [guide, setGuide] = useState({
      space: "",
      light: "",
      connection: "",
      power: "",
    }),
    [compareNote, setCompareNote] = useState("");
  const drawer = useRef<HTMLElement>(null);
  const open = !!(panel || detail);
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = gsap.context(() => {
      document
        .querySelectorAll(
          ".section-heading h2,.selection h2,.about h2,.faq h2,.contact h2",
        )
        .forEach((el) => {
          gsap.fromTo(
            el,
            { y: 22, clipPath: "inset(0% 0% 100% 0%)" },
            {
              y: 0,
              clipPath: "inset(0% 0% 0% 0%)",
              duration: 0.8,
              ease: "power3.out",
              scrollTrigger: { trigger: el, start: "top 92%", once: true },
            },
          );
        });
      gsap.fromTo(
        ".selection-photo img",
        { scale: 1.07 },
        {
          scale: 1,
          ease: "none",
          scrollTrigger: {
            trigger: ".selection-photo",
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        },
      );
    });
    return () => ctx.revert();
  }, [route]);
  useEffect(() => {
    localStorage.setItem("didban-basket", JSON.stringify(basket));
  }, [basket]);
  useEffect(() => {
    const pop = () => {
      setRoute(location.pathname === "/products");
      setF(readFilters());
      setPanel("");
      setDetail(null);
    };
    addEventListener("popstate", pop);
    return () => removeEventListener("popstate", pop);
  }, []);
  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focus = () =>
      drawer.current?.querySelector<HTMLElement>("button")?.focus();
    const timer = setTimeout(focus, 20);
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setPanel("");
        setDetail(null);
      }
      if (e.key === "Tab") {
        const nodes = Array.from(
          drawer.current?.querySelectorAll<HTMLElement>(
            'button:not([disabled]),a[href],input,textarea,select,[tabindex="0"]',
          ) || [],
        );
        const first = nodes[0],
          last = nodes[nodes.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };
    document.addEventListener("keydown", key);
    return () => {
      clearTimeout(timer);
      document.body.style.overflow = overflow;
      document.removeEventListener("keydown", key);
      prev?.focus();
    };
  }, [open]);
  const update = (patch: Partial<Filters>, catalog = route) => {
    const next = { ...f, ...patch, page: patch.page ?? 1 };
    setF(next);
    setMore(12);
    if (catalog) {
      const u = new URLSearchParams();
      Object.entries(next).forEach(([k, v]) => {
        if (v && !(k === "page" && v === 1)) u.set(k, String(v));
      });
      history.pushState({}, "", `/products${u.size ? "?" + u : ""}`);
      setRoute(true);
    }
  };
  const goHome = (anchor = "") => {
    history.pushState({}, "", "/" + anchor);
    setRoute(false);
    setPanel("");
    setDetail(null);
    setTimeout(
      () =>
        anchor
          ? document
              .querySelector(anchor)
              ?.scrollIntoView({ behavior: "smooth" })
          : window.scrollTo({ top: 0 }),
      30,
    );
  };
  const filtered = useMemo(() => {
    const list = products.filter(
      (p) =>
        (!f.q ||
          normalize(
            `${p.name} ${p.modelCode} ${p.category} ${p.brandId || ""} ${p.description}`,
          ).includes(normalize(f.q))) &&
        (!f.category || p.category === f.category) &&
        (!f.brand || String(p.brandId) === f.brand) &&
        (!f.space || p.space.includes(f.space)) &&
        (!f.connection || p.connection === f.connection),
    );
    // Interleave the merchandising groups so the opening showcase lets visitors
    // compare forms immediately, rather than repeating one archetype twenty times.
    const editorialOrder = (p: Product) =>
      (Number(p.modelCode.split("-").at(-1)) - 1) * categories.length +
      categories.indexOf(p.category);
    list.sort((a, b) => editorialOrder(a) - editorialOrder(b));
    if (f.sort === "low" || f.sort === "high")
      list.sort((a, b) =>
        a.priceToman === null
          ? b.priceToman === null
            ? 0
            : 1
          : b.priceToman === null
            ? -1
            : (a.priceToman - b.priceToman) * (f.sort === "low" ? 1 : -1),
      );
    return list;
  }, [f]);
  const pages = Math.max(1, Math.ceil(filtered.length / 24)),
    page = Math.min(f.page, pages),
    visible = route
      ? filtered.slice((page - 1) * 24, page * 24)
      : filtered.slice(0, more),
    count = Object.values(basket).reduce((a, b) => a + b, 0),
    selected = compare
      .map((id) => products.find((p) => p.id === id)!)
      .filter(Boolean),
    basketRows = Object.entries(basket)
      .map(([id, n]) => ({ p: products.find((p) => p.id === +id)!, n }))
      .filter((v) => v.p),
    pricedTotal = basketRows.reduce(
      (t, { p, n }) => t + (p.priceToman || 0) * n,
      0,
    );
  const close = () => {
    setPanel("");
    setDetail(null);
    setViewer(false);
  };
  const showDetail = (p: Product) => {
    setGallery(0);
    setViewer(false);
    setPanel("");
    setDetail(p);
  };
  const add = (p: Product) => {
    setBasket((b) => ({ ...b, [p.id]: (b[p.id] || 0) + 1 }));
    setDetail(null);
    setPanel("basket");
  };
  const toggleCompare = (id: number) => {
    if (compare.includes(id)) {
      setCompare(compare.filter((x) => x !== id));
      setCompareNote("");
    } else if (compare.length < 3) {
      setCompare([...compare, id]);
      setCompareNote("");
    } else
      setCompareNote(
        "حداکثر سه نمونه را می‌توانید مقایسه کنید. یکی از انتخاب‌ها را حذف کنید.",
      );
  };
  const catalogLink = (patch: Partial<Filters> = {}) => {
    update(patch, true);
    setPanel("");
    setTimeout(
      () =>
        document
          .getElementById("catalog")
          ?.scrollIntoView({ behavior: "smooth" }),
      20,
    );
  };
  const thumb = (p: Product, cls = "") => (
    <img
      className={cls}
      src={media(p)}
      loading="lazy"
      width="600"
      height="420"
      alt={p.name}
      onError={(e) => {
        e.currentTarget.src = "/assets/camera-bullet.png";
        e.currentTarget.onerror = null;
      }}
    />
  );
  const card = (p: Product) => (
    <ProductCard
      key={p.id}
      product={p}
      compared={compare.includes(p.id)}
      onDetail={showDetail}
      onAdd={add}
      onCompare={toggleCompare}
    />
  );
  return (
    <>
      <a className="skip-link" href="#catalog">
        عبور از روایت و مشاهده محصولات
      </a>
      <header className="site-header" inert={open}>
        <a
          className="wordmark"
          href="/"
          onClick={(e) => {
            e.preventDefault();
            goHome();
          }}
        >
          دیدبان
        </a>
        <nav aria-label="فهرست اصلی">
          <button onClick={() => catalogLink()}>محصولات</button>
          <button onClick={() => goHome("#brands")}>برندها</button>
          <button onClick={() => setPanel("guide")}>راهنمای انتخاب</button>
          <button onClick={() => goHome("#services")}>خدمات</button>
          <button onClick={() => goHome("#about")}>درباره ما</button>
          <button onClick={() => goHome("#contact")}>تماس با ما</button>
        </nav>
        <div className="header-tools">
          <form
            className="header-search"
            onSubmit={(e) => {
              e.preventDefault();
              catalogLink();
            }}
          >
            <Search size={16} />
            <input
              aria-label="جستجوی محصولات"
              placeholder="جستجوی محصول، برند یا مدل..."
              value={f.q}
              onChange={(e) => update({ q: e.target.value })}
            />
          </form>
          <button
            className="icon-button"
            aria-label={`سبد درخواست، ${fa(count)} مورد`}
            onClick={() => setPanel("basket")}
          >
            <ShoppingBag size={20} />
            {count > 0 && <span className="basket-count">{fa(count)}</span>}
          </button>
          <button
            className="icon-button mobile-menu"
            aria-label="باز کردن فهرست"
            onClick={() => setPanel("menu")}
          >
            <Menu />
          </button>
        </div>
      </header>
      <main inert={open}>
        {!route && (
          <>
            <StoryStage />
            <section className="types section wrap" id="types">
              <div className="section-heading">
                <div>
                  <h2>برای فضای شما.</h2>
                  <p>
                    هر فضا، زاویه و نیاز خودش را دارد. از شکل دوربین شروع کنید.
                  </p>
                </div>
                <button className="text-link" onClick={() => setPanel("guide")}>
                  راهنمای انتخاب <ArrowUpLeft size={18} />
                </button>
              </div>
              <div className="type-grid">
                {[0, 1, 2, 3, 4, 8].map((i) => (
                  <button
                    key={i}
                    className="type-item"
                    onClick={() => catalogLink({ category: categories[i] })}
                  >
                    {thumb(products.find((p) => p.category === categories[i])!)}
                    <h3>دوربین {categories[i]}</h3>
                    <p>
                      {
                        [
                          "دید دقیق در ورودی و محوطه",
                          "بدنه کشیده برای فضای بیرونی",
                          "فرم جمع‌وجور برای سقف و راهرو",
                          "برای بررسی میدان دید متغیر",
                          "برای اتاق و فضای داخلی",
                          "نگاهی به ورودی خانه",
                        ][[0, 1, 2, 3, 4, 8].indexOf(i)]
                      }
                    </p>
                    <span>
                      مشاهده نمونه‌ها <ArrowLeft size={15} />
                    </span>
                  </button>
                ))}
              </div>
              <div className="equipment-index">
                <span>همه نیازهای یک سیستم نظارتی</span>
                {[
                  "NVR / DVR",
                  "کیت کامل",
                  "شبکه و PoE",
                  "حافظه نظارتی",
                  "پایه، کابل و لوازم",
                ].map((t) => (
                  <button
                    key={t}
                    onClick={() => {
                      setPanel("inquiry");
                      setFormSummary(`موضوع درخواست: ${t}`);
                    }}
                  >
                    {t}
                    <ArrowUpLeft size={15} />
                  </button>
                ))}
              </div>
            </section>
            <section className="brands-section section wrap" id="brands">
              <div className="section-heading">
                <div>
                  <h2>۵۰ برند، یک نگاه تخصصی.</h2>
                  <p>
                    دایرکتوری سازندگان تجهیزات؛ حضور در این فهرست به معنی موجودی
                    یا نمایندگی نیست.
                  </p>
                </div>
                <label className="small-search">
                  <Search size={17} />
                  <input
                    aria-label="جستجوی برند"
                    placeholder="جستجوی برند"
                    value={brandQ}
                    onChange={(e) => setBrandQ(e.target.value)}
                  />
                </label>
              </div>
              <div className="brand-grid" dir="ltr">
                {brands
                  .filter((b) => normalize(b).includes(normalize(brandQ)))
                  .slice(0, allBrands || brandQ ? 50 : 12)
                  .map((b) => (
                    <button
                      key={b}
                      onClick={() =>
                        catalogLink({
                          brand: b.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
                        })
                      }
                    >
                      {b}
                    </button>
                  ))}
              </div>
              {!brandQ && (
                <button
                  className="text-link brand-more"
                  onClick={() => setAllBrands(!allBrands)}
                >
                  {allBrands ? "نمایش کوتاه‌تر" : "مشاهده همه ۵۰ برند"}{" "}
                  <ArrowLeft size={16} />
                </button>
              )}
            </section>
          </>
        )}
        <section
          className={`catalog section wrap ${route ? "catalog-route" : ""}`}
          id="catalog"
        >
          <div className="section-heading">
            <div>
              {route && (
                <button
                  className="text-link breadcrumb"
                  onClick={() => goHome()}
                >
                  دیدبان / محصولات
                </button>
              )}
              <h2>{route ? "دوربین‌ها، از نزدیک." : "ویترین دوربین‌ها"}</h2>
              <p>
                نمونه‌ها را بررسی کنید، مقایسه کنید و برای انتخاب مدل واقعی
                درخواست بدهید.
              </p>
            </div>
            <span className="result-count">
              {fa(filtered.length)} نمونه از {fa(products.length)}
            </span>
          </div>
          <p className="catalog-note">
            تمام دوربین‌های این ویترین نمونه‌های مفهومی DEMO و بدون برند هستند.
            تصاویر، نمایش عمومی فرم دوربین‌اند؛ مشخصات، قیمت و موجودی مدل واقعی
            تأیید نشده است.
          </p>
          <div className="filter-bar">
            <label className="catalog-search">
              <Search size={19} />
              <input
                placeholder="نام، گروه یا کد نمونه..."
                aria-label="جستجوی ویترین"
                value={f.q}
                onChange={(e) => update({ q: e.target.value })}
              />
            </label>
            {(
              [
                ["category", "همه گروه‌ها", categories],
                ["brand", "همه برندها", brands],
                ["space", "همه فضاها", ["داخلی", "بیرونی"]],
                ["connection", "همه اتصال‌ها", ["شبکه", "وای‌فای", "4G"]],
              ] as const
            ).map(([key, label, options]) => (
              <label className="filter-select" key={key}>
                <span className="sr-only">{label}</span>
                <select
                  value={f[key]}
                  onChange={(e) => update({ [key]: e.target.value })}
                >
                  <option value="">{label}</option>
                  {options.map((v) => (
                    <option
                      key={v}
                      value={
                        key === "brand"
                          ? v.toLowerCase().replace(/[^a-z0-9]+/g, "-")
                          : v
                      }
                    >
                      {v}
                    </option>
                  ))}
                </select>
              </label>
            ))}
            <label className="filter-select">
              <span className="sr-only">مرتب‌سازی</span>
              <select
                value={f.sort}
                onChange={(e) => update({ sort: e.target.value })}
              >
                <option value="">ترتیب ویترین</option>
                <option value="low">قیمت: کم به زیاد</option>
                <option value="high">قیمت: زیاد به کم</option>
              </select>
            </label>
            <button
              className="reset-button"
              onClick={() => update(emptyFilters)}
            >
              <SlidersHorizontal size={16} /> بازنشانی
            </button>
          </div>
          {f.sort && (
            <p className="filter-hint">
              نمونه‌های بدون قیمت پس از محصولات قیمت‌دار قرار می‌گیرند.
            </p>
          )}
          {visible.length ? (
            <div className="product-grid">{visible.map(card)}</div>
          ) : (
            <div className="empty-state">
              <h3>برای این ترکیب، نمونه‌ای نداریم.</h3>
              <p>
                {f.brand
                  ? "دایرکتوری برندها مستقل از نمونه‌های بدون برند است. برای این برند، درخواست بررسی مدل واقعی آماده کنید."
                  : "یک فیلتر را تغییر دهید یا راهنمای انتخاب را باز کنید."}
              </p>
              <button
                className="button dark"
                onClick={() => update(emptyFilters)}
              >
                بازنشانی فیلترها
              </button>
              <button className="text-link" onClick={() => goHome("#contact")}>
                درخواست بررسی <ArrowLeft size={17} />
              </button>
            </div>
          )}
          <div className="catalog-bottom">
            {route ? (
              <nav className="pagination" aria-label="صفحات ویترین">
                {Array.from({ length: pages }, (_, i) => (
                  <button
                    key={i}
                    aria-current={page === i + 1 ? "page" : undefined}
                    className={page === i + 1 ? "active" : ""}
                    onClick={() => {
                      update({ page: i + 1 }, true);
                      document
                        .getElementById("catalog")
                        ?.scrollIntoView({ behavior: "smooth" });
                    }}
                  >
                    {fa(i + 1)}
                  </button>
                ))}
              </nav>
            ) : (
              <>
                <button
                  className="button outline"
                  disabled={more >= filtered.length}
                  onClick={() => setMore(more + 12)}
                >
                  نمایش بیشتر <Plus size={16} />
                </button>
                <button className="text-link" onClick={() => catalogLink()}>
                  مشاهده تمام دوربین‌ها <ArrowLeft size={17} />
                </button>
              </>
            )}
            <span>
              {fa(
                route
                  ? (page - 1) * 24 + Math.min(24, visible.length)
                  : visible.length,
              )}{" "}
              از {fa(filtered.length)} نمونه
            </span>
          </div>
          {compareNote && <p role="status">{compareNote}</p>}
          {selected.length > 0 && (
            <div className="compare-bar">
              <span>{fa(selected.length)} انتخاب برای مقایسه</span>
              <button
                className="button dark"
                onClick={() => setPanel("compare")}
              >
                مقایسه انتخاب‌ها <Scale size={17} />
              </button>
              <button className="text-link" onClick={() => setCompare([])}>
                پاک کردن
              </button>
            </div>
          )}
        </section>
        {!route && (
          <>
            <section className="spaces section">
              <div className="space-tile business">
                <div>
                  <h2>برای کسب‌وکارها</h2>
                  <p>از پیشخوان و ورودی تا مسیرهای رفت‌وآمد.</p>
                  <button
                    className="button light"
                    onClick={() => {
                      setGuide({ ...guide, space: "بیرونی" });
                      setPanel("guide");
                    }}
                  >
                    راهنمای فضا <ArrowLeft size={16} />
                  </button>
                </div>
              </div>
              <div className="space-tile home">
                <div>
                  <h2>برای خانه</h2>
                  <p>انتخابی متناسب با ورودی، اتاق و حیاط.</p>
                  <button
                    className="button light"
                    onClick={() => {
                      setGuide({ ...guide, space: "داخلی" });
                      setPanel("guide");
                    }}
                  >
                    راهنمای فضا <ArrowLeft size={16} />
                  </button>
                </div>
              </div>
            </section>
            <section className="selection section wrap" id="guide">
              <div>
                <h2>
                  انتخاب دقیق.
                  <br />
                  همراهی مطمئن.
                </h2>
                <p>
                  پیش از انتخاب دوربین، از محیط شروع کنید. نور، مسیر کابل و برق،
                  فاصله سوژه و هدف مشاهده، مسیر انتخاب را روشن می‌کنند.
                </p>
                <button
                  className="button olive"
                  onClick={() => setPanel("guide")}
                >
                  شروع راهنمای انتخاب <ArrowLeft size={18} />
                </button>
              </div>
              <div className="selection-photo">
                <img
                  src="/assets/installation-editorial.png"
                  alt="نمای مفهومی نصب یک دوربین در ورودی ساختمان"
                  loading="lazy"
                />
                <span>نمای مفهومی نصب</span>
              </div>
            </section>
            <section className="about section wrap" id="about">
              <div className="section-heading">
                <h2>
                  دیدن بهتر،
                  <br />
                  از انتخاب آگاهانه شروع می‌شود.
                </h2>
                <p>
                  دیدبان، یک ویترین برای شناخت شکل‌ها، کاربردها و تفاوت‌های
                  تجهیزات نظارتی است. این نسخه برای بررسی مسیر انتخاب طراحی شده؛
                  اطلاعات واقعی فروشگاه پس از تأیید اضافه می‌شود.
                </p>
              </div>
              <div className="services" id="services">
                {[
                  [
                    "مشاوره انتخاب",
                    "شرایط فضا و هدف مشاهده را در درخواست خود بنویسید تا بررسی مدل واقعی ممکن شود.",
                  ],
                  [
                    "بررسی نصب",
                    "محل نصب، نور، برق و مسیر شبکه باید پیش از انتخاب نهایی بررسی شوند.",
                  ],
                  [
                    "نگهداری و پشتیبانی",
                    "دامنه خدمات، هزینه و شرایط پشتیبانی هنوز تنظیم نشده و باید از فروشگاه استعلام شود.",
                  ],
                ].map(([title, copy]) => (
                  <article key={title}>
                    <h3>{title}</h3>
                    <p>{copy}</p>
                    <button
                      className="text-link"
                      onClick={() => goHome("#contact")}
                    >
                      آماده‌سازی درخواست <ArrowUpLeft size={17} />
                    </button>
                  </article>
                ))}
              </div>
            </section>
            <FAQ />
          </>
        )}
        <section className="contact section" id="contact">
          <div className="contact-inner wrap">
            <div>
              <h2>
                برای انتخاب بهتر،
                <br />
                با ما در تماس باشید.
              </h2>
              <p>
                درخواست خود را آماده کنید. کانال‌های ارتباطی فروشگاه هنوز تنظیم
                نشده‌اند.
              </p>
              <div className="contact-details">
                {(
                  [
                    [Phone, "تلفن", businessConfig.phone, "شماره فروشگاه"],
                    [
                      Phone,
                      "واتس‌اپ",
                      businessConfig.whatsapp,
                      "شماره فروشگاه",
                    ],
                    [Mail, "ایمیل", businessConfig.email, "ایمیل فروشگاه"],
                    [
                      Instagram,
                      "اینستاگرام",
                      businessConfig.instagram,
                      "حساب فروشگاه",
                    ],
                    [MapPin, "نشانی", businessConfig.address, "نشانی فروشگاه"],
                    [
                      Clock,
                      "ساعات کاری",
                      businessConfig.hours,
                      "ساعات فروشگاه",
                    ],
                  ] as const
                ).map(([Icon, label, value, placeholder]) => (
                  <div key={label}>
                    <Icon size={18} />
                    <span>
                      {label}: {value || `[${placeholder}]`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                setFormSummary(
                  `نام: ${fd.get("name")}\nشماره تماس: ${fd.get("phone")}\nموضوع: ${fd.get("subject")}\nپیام: ${fd.get("message")}${basketRows.length ? "\nانتخاب‌ها:\n" + basketRows.map(({ p, n }) => `${p.modelCode} × ${fa(n)}`).join("\n") : ""}`,
                );
              }}
            >
              <label>
                <span>نام شما</span>
                <input
                  name="name"
                  autoComplete="name"
                  required
                  placeholder="نام و نام خانوادگی"
                />
              </label>
              <label>
                <span>شماره تماس</span>
                <input
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  pattern="[+]?(?:[0-9۰-۹٠-٩] *){8,15}"
                  required
                  placeholder="شماره برای هماهنگی"
                />
              </label>
              <label>
                <span>محصول یا موضوع</span>
                <input
                  name="subject"
                  required
                  placeholder="مثلاً انتخاب دوربین ورودی"
                />
              </label>
              <label>
                <span>پیام</span>
                <textarea
                  name="message"
                  rows={4}
                  required
                  placeholder="فضا، نور و نیاز خود را توضیح دهید."
                />
              </label>
              <button className="button vermilion" type="submit">
                آماده‌سازی درخواست مشاوره <ArrowLeft size={18} />
              </button>
              <small>
                این فرم خلاصه را روی دستگاه شما آماده می‌کند. ارسال آنلاین و
                پرداخت فعال نیستند.
              </small>
              {formSummary && (
                <div className="request-summary" role="status">
                  <strong>درخواست آماده شد؛ پیامی ارسال نشده است.</strong>
                  <pre>{formSummary}</pre>
                  <button
                    type="button"
                    className="text-link"
                    onClick={() => {
                      const blob = new Blob([formSummary], {
                          type: "text/plain;charset=utf-8",
                        }),
                        url = URL.createObjectURL(blob),
                        a = document.createElement("a");
                      a.href = url;
                      a.download = "didban-request.txt";
                      a.click();
                      URL.revokeObjectURL(url);
                    }}
                  >
                    دریافت خلاصه درخواست <ArrowLeft size={16} />
                  </button>
                </div>
              )}
            </form>
          </div>
        </section>
      </main>
      <footer className="site-footer wrap">
        <div className="footer-main">
          <div>
            <button className="wordmark" onClick={() => goHome()}>
              دیدبان
            </button>
            <p>
              راهکارهای نظارتی،
              <br />
              برای یک نگاه آگاهانه.
            </p>
          </div>
          <div>
            <h3>محصولات</h3>
            {categories.slice(0, 4).map((c) => (
              <button key={c} onClick={() => catalogLink({ category: c })}>
                دوربین {c}
              </button>
            ))}
            <button onClick={() => catalogLink(emptyFilters)}>
              همه دوربین‌ها
            </button>
          </div>
          <div>
            <h3>راهنمای انتخاب</h3>
            <button onClick={() => setPanel("guide")}>
              برای خانه و کسب‌وکار
            </button>
            <button onClick={() => setPanel("compare")}>مقایسه محصولات</button>
            <button onClick={() => goHome("#faq")}>شناخت اتصال‌ها</button>
          </div>
          <div>
            <h3>درباره دیدبان</h3>
            <button onClick={() => goHome("#about")}>درباره ما</button>
            <button onClick={() => goHome("#services")}>
              خدمات و پشتیبانی
            </button>
            <button onClick={() => goHome("#brands")}>دایرکتوری برندها</button>
          </div>
          <div>
            <h3>ارتباط</h3>
            <button onClick={() => goHome("#contact")}>درخواست مشاوره</button>
            <button onClick={() => goHome("#faq")}>پرسش‌های متداول</button>
            <button onClick={() => setPanel("privacy")}>
              حریم خصوصی این نسخه
            </button>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {fa(1405)} دیدبان</span>
          <span>ویترین مفهومی · قیمت و موجودی نیازمند استعلام</span>
          <span dir="ltr">A considered perspective.</span>
        </div>
      </footer>
      {open && (
        <div
          className="modal-backdrop"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) close();
          }}
        >
          <section
            ref={drawer}
            className={`drawer ${panel === "compare" ? "wide-drawer" : ""}`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="drawer-title"
          >
            <button
              className="close icon-button"
              aria-label="بستن پنل"
              onClick={close}
            >
              <X />
            </button>
            {detail ? (
              <>
                <div className="detail-media">
                  {viewer ? (
                    <Suspense
                      fallback={<p>در حال آماده‌سازی نمای سه‌بعدی...</p>}
                    >
                      <Product3DViewer
                        category={detail.conceptShape}
                        finish={detail.visualVariant.finish}
                        orientation={detail.visualVariant.orientation}
                      />
                    </Suspense>
                  ) : (
                    <img
                      src={
                        (detail as any).imageUrls?.[gallery] || media(detail)
                      }
                      alt={detail.name}
                    />
                  )}
                </div>
                <div className="gallery-controls">
                  {((detail as any).imageUrls || [media(detail)]).map(
                    (src: string, i: number) => (
                      <button
                        className={gallery === i && !viewer ? "active" : ""}
                        key={src}
                        onClick={() => {
                          setGallery(i);
                          setViewer(false);
                        }}
                        aria-label={`نمای ${fa(i + 1)}`}
                      >
                        <img src={src} alt="" />
                      </button>
                    ),
                  )}
                  <button
                    className="text-link"
                    onClick={() => setViewer(!viewer)}
                  >
                    {viewer ? "نمای ثابت" : "نمای سه‌بعدی مفهومی"}
                  </button>
                </div>
                <span className="demo-note">نمونه مفهومی DEMO · بدون برند</span>
                <h2 id="drawer-title">{detail.name}</h2>
                <p className="model-code" dir="ltr">
                  {detail.modelCode}
                </p>
                <p>{detail.description}</p>
                <dl className="spec-list">
                  <div>
                    <dt>گروه</dt>
                    <dd>{detail.category}</dd>
                  </div>
                  <div>
                    <dt>فضا</dt>
                    <dd>{detail.space}</dd>
                  </div>
                  <div>
                    <dt>مسیر اتصال پیشنهادی</dt>
                    <dd>{detail.connection}</dd>
                  </div>
                  <div>
                    <dt>وضوح، لنز و حفاظت</dt>
                    <dd>تأیید نشده؛ نیازمند انتخاب مدل واقعی</dd>
                  </div>
                  <div>
                    <dt>قیمت و موجودی</dt>
                    <dd>{price(detail)} · تأیید نشده</dd>
                  </div>
                </dl>
                <p className="fine-print">
                  تصویر و مدل سه‌بعدی، فرم عمومی این گروه را نشان می‌دهند و مدل
                  دقیق یک سازنده نیستند.
                </p>
                <button
                  className="button olive full"
                  onClick={() => add(detail)}
                >
                  افزودن به سبد درخواست <Plus size={17} />
                </button>
                <h3 className="related-title">نمونه‌های نزدیک</h3>
                <div className="related-products">
                  {products
                    .filter(
                      (p) =>
                        p.category === detail.category && p.id !== detail.id,
                    )
                    .slice(0, 3)
                    .map((p) => (
                      <button key={p.id} onClick={() => showDetail(p)}>
                        {thumb(p)}
                        <span>{p.name}</span>
                      </button>
                    ))}
                </div>
              </>
            ) : panel === "basket" ? (
              <>
                <h2 id="drawer-title">سبد درخواست</h2>
                <p>انتخاب‌های شما برای بررسی مدل واقعی.</p>
                {basketRows.length ? (
                  basketRows.map(({ p, n }) => (
                    <div className="basket-row" key={p.id}>
                      {thumb(p)}
                      <div>
                        <h3>{p.name}</h3>
                        <span>{price(p)}</span>
                        <div className="quantity">
                          <button
                            aria-label="کاهش تعداد"
                            disabled={n === 1}
                            onClick={() =>
                              setBasket({ ...basket, [p.id]: n - 1 })
                            }
                          >
                            <Minus size={15} />
                          </button>
                          <span>{fa(n)}</span>
                          <button
                            aria-label="افزایش تعداد"
                            onClick={() =>
                              setBasket({ ...basket, [p.id]: n + 1 })
                            }
                          >
                            <Plus size={15} />
                          </button>
                          <button
                            aria-label={`حذف ${p.name}`}
                            onClick={() =>
                              setBasket((b) => {
                                const next = { ...b };
                                delete next[p.id];
                                return next;
                              })
                            }
                          >
                            <X size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="empty-state">
                    <h3>سبد شما هنوز خالی است.</h3>
                    <p>از ویترین، نمونه‌ای برای بررسی انتخاب کنید.</p>
                  </div>
                )}
                {pricedTotal > 0 && (
                  <p>جمع اقلام قیمت‌دار: {fa(pricedTotal)} تومان</p>
                )}
                <p>
                  {fa(
                    basketRows
                      .filter((v) => v.p.priceToman === null)
                      .reduce((a, v) => a + v.n, 0),
                  )}{" "}
                  مورد نیازمند استعلام قیمت
                </p>
                <p className="fine-print">
                  این سبد، درخواست بررسی است. پرداخت آنلاین و ثبت سفارش فعال
                  نیستند.
                </p>
                <button
                  className="button olive full"
                  disabled={!basketRows.length}
                  onClick={() => goHome("#contact")}
                >
                  آماده‌سازی درخواست <ArrowLeft size={17} />
                </button>
              </>
            ) : panel === "compare" ? (
              <>
                <h2 id="drawer-title">مقایسه انتخاب‌ها</h2>
                <p>
                  تا سه نمونه را کنار هم بررسی کنید. مشخصات نامعلوم، تأیید نشده
                  باقی می‌مانند.
                </p>
                {selected.length ? (
                  <div className="table-scroll">
                    <table className="comparison-table">
                      <thead>
                        <tr>
                          <th>ویژگی</th>
                          {selected.map((p) => (
                            <th key={p.id}>
                              {thumb(p)}
                              <h3>{p.name}</h3>
                              <button
                                className="text-link"
                                onClick={() => toggleCompare(p.id)}
                              >
                                حذف <X size={14} />
                              </button>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          ["کد نمونه", (p: Product) => p.modelCode],
                          ["گروه", (p: Product) => p.category],
                          ["فضا", (p: Product) => p.space],
                          ["اتصال پیشنهادی", (p: Product) => p.connection],
                          ["وضوح / لنز", () => "تأیید نشده"],
                          ["دید در شب", () => "نیازمند بررسی مدل واقعی"],
                          ["قیمت", (p: Product) => price(p)],
                        ].map(([label, get]) => (
                          <tr key={label as string}>
                            <th>{label as string}</th>
                            {selected.map((p) => (
                              <td key={p.id}>
                                {(get as (p: Product) => string)(p)}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p>از دکمه ترازو در کارت‌ها، نمونه انتخاب کنید.</p>
                )}
              </>
            ) : panel === "guide" ? (
              <>
                <h2 id="drawer-title">برای کدام فضا؟</h2>
                <p>
                  چهار پرسش کوتاه برای محدود کردن گزینه‌ها. این راهنما جایگزین
                  طراحی و بازدید فنی نیست.
                </p>
                {(
                  [
                    ["space", "فضای نصب", ["داخلی", "بیرونی"]],
                    [
                      "light",
                      "نور محیط",
                      ["نور کافی", "نور کم در شب", "نور متغیر"],
                    ],
                    ["connection", "شبکه در محل", ["شبکه", "وای‌فای", "4G"]],
                    [
                      "power",
                      "برق و کابل‌کشی",
                      [
                        "برق و کابل شبکه فراهم است",
                        "برق هست، کابل شبکه ممکن نیست",
                        "برق ثابت در دسترس نیست",
                      ],
                    ],
                  ] as const
                ).map(([key, label, opts]) => (
                  <label className="guide-label" key={key}>
                    {label}
                    <select
                      value={guide[key]}
                      onChange={(e) =>
                        setGuide({ ...guide, [key]: e.target.value })
                      }
                    >
                      <option value="">انتخاب کنید</option>
                      {opts.map((v) => (
                        <option key={v}>{v}</option>
                      ))}
                    </select>
                  </label>
                ))}
                <div className="guide-advice">
                  <h3>پیش از انتخاب نهایی</h3>
                  <p>
                    {guide.light === "نور کم در شب"
                      ? "نور کم: قابلیت شب، روشنایی مکمل و فاصله سوژه را در مدل واقعی بررسی کنید."
                      : "نور و زاویه تابش در ساعات مختلف روز باید بررسی شود."}
                  </p>
                  <p>
                    {guide.power === "برق ثابت در دسترس نیست"
                      ? "گروه باتری‌خور یا خورشیدی نقطه شروع است؛ دوام باتری و توان خورشیدی بدون بررسی محل قابل تعیین نیست."
                      : guide.connection === "وای‌فای"
                        ? "کیفیت سیگنال و دسترسی به برق باید در محل نصب بررسی شود."
                        : guide.connection === "4G"
                          ? "پوشش اپراتور، مصرف داده و تغذیه مستقل باید بررسی شود."
                          : "مسیر کابل، طول مسیر و سازگاری PoE نیازمند بررسی فنی است."}
                  </p>
                </div>
                <button
                  className="button olive full"
                  onClick={() => {
                    catalogLink({
                      space: guide.space,
                      connection: guide.connection,
                      category:
                        guide.power === "برق ثابت در دسترس نیست"
                          ? "باتری‌خور"
                          : "",
                      q: "",
                      brand: "",
                    });
                    close();
                  }}
                >
                  دیدن نمونه‌های مرتبط <ArrowLeft size={17} />
                </button>
              </>
            ) : panel === "privacy" ? (
              <>
                <h2 id="drawer-title">حریم خصوصی این نسخه</h2>
                <p>
                  سبد درخواست در حافظه محلی مرورگر شما ذخیره می‌شود. فرم،
                  خلاصه‌ای محلی ایجاد می‌کند و هیچ پیامی به فروشگاه ارسال
                  نمی‌کند. این نسخه سرویس پرداخت، رهگیری بازدید یا حساب کاربری
                  ندارد.
                </p>
                <button
                  className="button outline"
                  onClick={() => {
                    localStorage.removeItem("didban-basket");
                    setBasket({});
                  }}
                >
                  پاک کردن سبد محلی
                </button>
              </>
            ) : panel === "inquiry" ? (
              <>
                <h2 id="drawer-title">درخواست تجهیزات</h2>
                <p>{formSummary}</p>
                <p>
                  تجهیزات ضبط، شبکه و نصب به بررسی سازگاری با مدل واقعی نیاز
                  دارند. در این ویترین، موجودی آن‌ها تأیید نشده است.
                </p>
                <button
                  className="button olive"
                  onClick={() => goHome("#contact")}
                >
                  ادامه در فرم درخواست <ArrowLeft size={17} />
                </button>
              </>
            ) : (
              <>
                <h2 id="drawer-title">دیدبان</h2>
                <nav className="mobile-nav">
                  <button
                    onClick={() => {
                      catalogLink();
                      close();
                    }}
                  >
                    محصولات
                  </button>
                  <button onClick={() => goHome("#brands")}>برندها</button>
                  <button onClick={() => setPanel("guide")}>
                    راهنمای انتخاب
                  </button>
                  <button onClick={() => goHome("#about")}>درباره ما</button>
                  <button onClick={() => goHome("#contact")}>تماس با ما</button>
                </nav>
              </>
            )}
          </section>
        </div>
      )}
    </>
  );
}
createRoot(document.getElementById("root")!).render(<App />);
