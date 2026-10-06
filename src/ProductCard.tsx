import { Check, Plus, Scale } from "lucide-react";
import type { Product } from "./data";
export default function ProductCard({
  product: p,
  compared,
  onDetail,
  onAdd,
  onCompare,
}: {
  product: Product;
  compared: boolean;
  onDetail: (p: Product) => void;
  onAdd: (p: Product) => void;
  onCompare: (id: number) => void;
}) {
  return (
    <article className="product-card">
      <button
        className="product-visual"
        onClick={() => onDetail(p)}
        aria-label={`جزئیات ${p.name}`}
      >
        <img
          src={p.imageUrls[0]}
          loading="lazy"
          width="600"
          height="420"
          alt={p.name}
        />
        <span>نمونه مفهومی</span>
      </button>
      <div className="product-info">
        <h3>
          <button onClick={() => onDetail(p)}>{p.name}</button>
        </h3>
        <p className="model-code" dir="ltr">
          {p.modelCode}
        </p>
        <p>
          {p.space} · {p.connection}
        </p>
        <strong>
          {p.priceToman === null
            ? "استعلام قیمت"
            : `${p.priceToman.toLocaleString("fa-IR")} تومان`}
        </strong>
        <div className="card-actions">
          <button onClick={() => onAdd(p)}>
            افزودن به درخواست <Plus size={14} />
          </button>
          <button
            className={compared ? "selected" : ""}
            aria-label={`مقایسه ${p.name}`}
            aria-pressed={compared}
            onClick={() => onCompare(p.id)}
          >
            {compared ? <Check size={16} /> : <Scale size={16} />}
          </button>
        </div>
      </div>
    </article>
  );
}
