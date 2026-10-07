/** Editable storefront data. Directory membership does not imply stock or representation. */
export const brands =
  "Hikvision,Dahua,Uniview,Axis,Bosch,Hanwha Vision,Tiandy,Vivotek,Milesight,Mobotix,i-PRO,Pelco,Honeywell,FLIR,Hikmicro,Ubiquiti,Reolink,TP-Link VIGI,EZVIZ,Imou,Tapo,Eufy Security,Arlo,Ring,Google Nest,Lorex,Swann,Zmodo,Annke,Amcrest,Foscam,Provision-ISR,TVT,Tenda,D-Link,Panasonic,Sony,ACTi,Avigilon,GeoVision,Arecont Vision,Costar,Digital Watchdog,Speco Technologies,IC Realtime,LTS Security,ENS Security,InVid Tech,CP Plus,Grandstream".split(
    ",",
  );
export type Brand = { id: string; name: string; directoryOnly: true };
export const brandRecords: Brand[] = brands.map((name) => ({
  id: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
  name,
  directoryOnly: true,
}));
export const categories = [
  "تورت",
  "بولت",
  "دام",
  "اسپیددام",
  "داخلی / وای‌فای",
  "باتری‌خور",
  "خورشیدی / 4G",
  "پانوراما",
  "زنگ تصویری",
  "حرارتی",
];
export const equipmentCategories = [
  "دوربین بیرونی",
  "دوربین وای‌فای",
  "دوربین 4G",
  "ضبط‌کننده NVR / DVR",
  "کیت کامل",
  "شبکه و PoE",
  "ذخیره‌سازی نظارتی",
  "پایه، کابل و لوازم نصب",
];
export type Product = {
  id: number;
  slug: string;
  nameFa: string;
  name: string;
  modelCode: string;
  brandId: string | null;
  primaryCategory: string;
  category: string;
  capabilityTags: string[];
  connection: string;
  space: string;
  imageUrls: string[];
  model3dId?: string;
  verifiedSpecs: Record<string, string>;
  sourceUrl: string | null;
  priceToman: number | null;
  availability: "unknown" | "inquiry" | "inStock";
  isDemo: boolean;
  assetLicense: string;
  description: string;
  intendedUse: string;
  planningNotes: string;
  conceptShape: string;
  visualVariant: {
    finish: "ivory" | "graphite";
    mount: "wall" | "ceiling" | "surface";
    orientation: "straight" | "angled" | "downward";
  };
};

// These are 100 distinct installation briefs, not manufactured SKUs or verified specifications.
// Each brief has a different viewing/installation constraint. Camera selection requires a real model.
const groups: {
  key: string;
  short: string;
  scenarios: string[];
  planning: string;
}[] = [
  {
    key: "turret",
    short: "TR",
    scenarios: [
      "ورودی تک‌در فروشگاه",
      "پیشخوان صندوق",
      "راهروی باریک اداری",
      "پارکینگ با سقف کوتاه",
      "آستانه در حیاط",
      "راه‌پله مجتمع",
      "پاگرد آسانسور",
      "کنار در انبار",
      "راهروی قفسه‌های فروشگاه",
      "محوطه بارگیری سرپوشیده",
      "ورودی کارگاه",
      "سالن انتظار",
      "راهروی طبقه همکف",
      "پشت پیشخوان خدمات",
      "فضای دریافت مرسوله",
      "ورودی جانبی ساختمان",
      "گذرگاه میان دو اتاق",
      "کنج سالن کوچک",
      "بالای در دفتر",
      "ورودی پارکینگ زیرزمین",
    ],
    planning:
      "ارتفاع سقف، جهت ورود نور و فاصله تا نقطه موردنظر باید پیش از انتخاب مدل بررسی شود.",
  },
  {
    key: "bullet",
    short: "BL",
    scenarios: [
      "دروازه رو به خیابان",
      "مسیر پیاده باغ",
      "رمپ ورود خودرو",
      "نمای جانبی ساختمان",
      "درب پشتی کارگاه",
      "دیوار طولی محوطه",
      "حیاط با ورودی مورب",
      "مسیر کنار انبار",
      "درگاه بارانداز",
      "ورودی پارکینگ روباز",
      "سردر فروشگاه",
      "حاشیه گذر خصوصی",
      "مسیر میان دو ساختمان",
      "راه دسترسی سوله",
      "ورودی باغچه کوچک",
      "گیت خروج خودرو",
      "محل تحویل بیرونی",
      "کنار در مجتمع",
      "مرز حیاط و کوچه",
      "مسیر خدمات ساختمان",
    ],
    planning:
      "فاصله سوژه، امکان کابل‌کشی و شرایط باران و تابش مستقیم، مبنای انتخاب مدل واقعی هستند.",
  },
  {
    key: "dome",
    short: "DM",
    scenarios: [
      "لابی با سقف کاذب",
      "تالار کوچک پذیرش",
      "راهروی چنددر",
      "سقف مرکز خدمات",
      "فضای صف مراجعه",
      "اتاق جلسه مشترک",
      "راهروی نمایشگاه",
      "گوشه سالن آموزشی",
      "ورودی داخلی بانک اطلاعات",
      "راهروی مرکز اداری",
      "سقف سالن فروش",
      "محوطه پذیرش مجتمع",
      "مسیر خروج داخلی",
      "لابی چندمسیره",
      "راهروی دسترسی انبار",
    ],
    planning:
      "جای نصب روی سقف، بازتاب سطوح و مسیر عبور افراد باید با حریم خصوصی سنجیده شوند.",
  },
  {
    key: "ptz",
    short: "PT",
    scenarios: [
      "محوطه با چند ورودی",
      "حیاط مجموعه صنعتی",
      "فضای تحویل چندمسیره",
      "پارکینگ با مسیر متقاطع",
      "محوطه باز کارگاه",
      "حیاط انبار مرکزی",
      "میدان ورود مجتمع",
      "محل بارگیری گسترده",
      "گذرگاه محیطی ساختمان",
      "فضای بیرونی نمایشگاه",
    ],
    planning:
      "کنترل جهت، نقاط ثابت مکمل و نیاز به اپراتور در طرح نصب بررسی می‌شوند؛ قابلیت حرکت وابسته به مدل نهایی است.",
  },
  {
    key: "indoor",
    short: "IN",
    scenarios: [
      "ورودی اتاق کار",
      "گوشه نشیمن",
      "کتابخانه خانگی",
      "دفتر کوچک مشترک",
      "راهروی آپارتمان",
      "فضای بسته‌بندی خانه",
      "اتاق نگهداری وسایل",
      "میز پذیرش کوچک",
      "کنار پنجره دفتر",
      "گوشه استودیوی خانگی",
    ],
    planning:
      "پوشش شبکه بی‌سیم، برق در محل نصب و رعایت حریم خصوصی پیش از انتخاب بررسی می‌شوند.",
  },
  {
    key: "battery",
    short: "BT",
    scenarios: [
      "ورودی بدون کابل آماده",
      "در حیاط کم‌تردد",
      "درب جانبی خانه",
      "محل تحویل بسته",
      "ورودی ساختمان موقت",
      "راه دسترسی باغ",
      "گوشه ایوان",
      "درگاه انبار کوچک",
    ],
    planning:
      "امکان شارژ، میزان رفت‌وآمد و نوع ضبط باید بررسی شود؛ دوام باتری برای این نمونه تعیین نشده است.",
  },
  {
    key: "solar",
    short: "SL",
    scenarios: [
      "ورودی باغ دور از شبکه",
      "دروازه زمین محصور",
      "مسیر دسترسی خارج شهر",
      "محوطه بدون برق ثابت",
      "انبار مستقل بیرونی",
    ],
    planning:
      "تابش محل، برق موردنیاز و پوشش اپراتور باید جداگانه بررسی شوند؛ پنل و ارتباط همراه الزاماً در هر مدل وجود ندارند.",
  },
  {
    key: "panoramic",
    short: "PN",
    scenarios: [
      "مرکز سالن چهارگوش",
      "سقف فضای پذیرش باز",
      "تقاطع راهروها",
      "وسط سالن نمایش",
      "فضای مشترک چندمسیره",
    ],
    planning:
      "ارتفاع نصب، شکل فضا و روش نمایش تصویر گسترده به مدل و ضبط‌کننده انتخابی وابسته است.",
  },
  {
    key: "doorbell",
    short: "DB",
    scenarios: [
      "در واحد آپارتمان",
      "درب ورودی حیاط",
      "درگاه دفتر کوچک",
      "ورودی خانه با ایوان",
    ],
    planning:
      "نوع تغذیه، عرض چارچوب، شبکه و سازگاری زنگ موجود باید پیش از انتخاب بررسی شوند.",
  },
  {
    key: "thermal",
    short: "TH",
    scenarios: ["پایش محیط صنعتی", "مرز محوطه در تاریکی", "بررسی محیط تجهیزات"],
    planning:
      "هدف پایش و محدودیت محیط باید با متخصص بررسی شود؛ هیچ دقت اندازه‌گیری یا کاربرد پزشکی برای این نمونه ادعا نمی‌شود.",
  },
];

let nextId = 0;
export const products: Product[] = groups.flatMap((group, categoryIndex) =>
  group.scenarios.map((scenario, index) => {
    const id = ++nextId;
    const category = categories[categoryIndex];
    const name = `دوربین ${category} — ${scenario}`;
    const imageShape = group.key === "panoramic" ? "panorama" : group.key;
    const variant = (index % 4 === 3 ? 3 : 0) + (index % 3);
    const connection =
      categoryIndex === 4
        ? "وای‌فای"
        : categoryIndex === 5 || categoryIndex === 8
          ? "وابسته به مدل"
          : categoryIndex === 6
            ? "4G"
            : "شبکه";
    const space =
      categoryIndex === 4 || categoryIndex === 2 || categoryIndex === 7
        ? "داخلی"
        : categoryIndex === 0
          ? "داخلی / بیرونی"
          : "بیرونی";
    return {
      id,
      slug: `demo-${group.key}-${String(index + 1).padStart(2, "0")}`,
      nameFa: name,
      name,
      modelCode: `DEMO-${group.short}-${String(index + 1).padStart(2, "0")}`,
      brandId: null,
      primaryCategory: category,
      category,
      capabilityTags: [category, space, connection],
      connection,
      space,
      imageUrls: [
        `/assets/camera-${imageShape}-v${variant}.webp`,
        `/assets/camera-${imageShape}-v${variant}-side.webp`,
      ],
      model3dId: group.key === "panoramic" ? "panorama" : group.key,
      verifiedSpecs: {},
      sourceUrl: null,
      priceToman: null,
      availability: "inquiry",
      isDemo: true,
      assetLicense:
        "Original DIDBAN conceptual illustration; not a manufacturer product photograph.",
      intendedUse: scenario,
      planningNotes: group.planning,
      conceptShape: group.key === "panoramic" ? "panorama" : group.key,
      visualVariant: {
        finish: index % 4 === 3 ? "graphite" : "ivory",
        mount: ["dome", "panoramic", "turret"].includes(group.key)
          ? "ceiling"
          : group.key === "indoor"
            ? "surface"
            : "wall",
        orientation:
          index % 3 === 0
            ? "straight"
            : index % 3 === 1
              ? "angled"
              : "downward",
      },
      description: `طرح مفهومی ${category} برای ${scenario}. این رکورد، محصول واقعی یا مشخصات تأییدشده یک سازنده نیست. ${group.planning}`,
    };
  }),
);

export const businessConfig = {
  phone: "",
  email: "",
  whatsapp: "",
  instagram: "",
  address: "",
  hours: "",
};
export const normalize = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFKC")
    .replace(/ي|ى/g, "ی")
    .replace(/ك/g, "ک")
    .replace(/[\u200c\u200e\u200f]/g, " ")
    .replace(/[۰-۹]/g, (digit) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit)))
    .replace(/[٠-٩]/g, (digit) => String("٠١٢٣٤٥٦٧٨٩".indexOf(digit)))
    .replace(/\s+/g, " ")
    .trim();
