import * as T from "three";
export const clamp = (v: number) => Math.min(1, Math.max(0, v));
export const phase = (p: number, a: number, b: number) => {
  const t = clamp((p - a) / (b - a));
  return t * t * (3 - 2 * t);
};
export function applyStory(
  p: number,
  root: T.Group,
  groups: T.Group[],
  mobile: boolean,
) {
  const pivot = phase(p, 0.07, 0.14),
    macro = phase(p, 0.1, 0.2),
    pull = phase(p, 0.24, 0.32),
    explode = phase(p, 0.26, 0.34) * (1 - phase(p, 0.42, 0.5)),
    mounted = phase(p, 0.43, 0.51),
    plan = phase(p, 0.69, 0.77),
    category = phase(p, 0.84, 0.92);
  const mix = T.MathUtils.lerp;
  let scale = mix(1.22, 2.3, macro);
  scale = mix(scale, 0.64, pull);
  scale = mix(scale, 0.3, mounted);
  scale = mix(scale, 0.24, plan);
  scale = mix(scale, 0.62, category);
  if (mobile) scale *= 0.83 + 0.18 * explode;
  root.scale.setScalar(scale);
  root.rotation.set(
    mix(-0.09, 0.16, mounted),
    mix(-0.43, 0, pivot) + explode * -0.9 + mounted * -0.24 + category * 0.3,
    mix(0.02, Math.PI, mounted),
  );
  root.position.set(
    mix(mobile ? 0 : -2.05, mobile ? 0 : -1.45, pull),
    mobile ? -0.4 : -0.03,
    0,
  );
  root.position.x = mix(root.position.x, mobile ? 0 : -1, macro * (1 - pull));
  root.position.x = mix(root.position.x, mobile ? 0.45 : 1.5, mounted);
  root.position.x = mix(root.position.x, mobile ? 0 : -1.8, category);
  root.position.y = mix(root.position.y, 2.05, mounted);
  root.position.y = mix(root.position.y, mobile ? -0.3 : -0.05, category);
  root.rotation.z = mix(root.rotation.z, 0.02, category);
  root.rotation.x = mix(root.rotation.x, -0.09, category);
  root.rotation.y = mix(root.rotation.y, -0.43, category);
  const distances = [-2.5, 0, -1, 0.7, 1.65, 2.65, 0];
  groups.forEach((g, i) => {
    g.position.set(
      0,
      i === 1 ? explode * -0.5 : i === 6 ? explode * -1.1 : 0,
      explode * distances[i] * (mobile ? 0.7 : 1),
    );
  });
  return { explode, mounted, plan, category };
}
