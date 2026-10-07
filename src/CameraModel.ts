import * as T from "three";

/** Original unbranded engineering visualization; not a manufacturer's product model. */
export function makeCamera() {
  const root = new T.Group();
  const groups: T.Group[] = [];
  // A deterministic microscopic finish, shared by every painted casting. Linear maps.
  const size = 128, pixels = new Uint8Array(size * size * 4);
  let seed = 31;
  for (let i = 0; i < size * size; i++) {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    const value = 112 + ((seed >>> 24) % 33);
    pixels.set([value, value, value, 255], i * 4);
  }
  const finish = new T.DataTexture(pixels, size, size, T.RGBAFormat);
  finish.wrapS = finish.wrapT = T.RepeatWrapping;
  finish.repeat.set(7, 7);
  finish.magFilter = T.LinearFilter;
  finish.minFilter = T.LinearMipmapLinearFilter;
  finish.generateMipmaps = true;
  finish.needsUpdate = true;
  const ivory = new T.MeshStandardMaterial({
    color: "#dedbd0", roughness: 0.63, metalness: 0.08,
    bumpMap: finish, bumpScale: 0.006,
  });
  const black = new T.MeshStandardMaterial({ color: "#111313", roughness: 0.36, metalness: 0.22 });
  const rubber = new T.MeshStandardMaterial({ color: "#141615", roughness: 0.86, metalness: 0 });
  const alloy = new T.MeshStandardMaterial({ color: "#7f8481", roughness: 0.34, metalness: 0.93 });
  const edge = new T.MeshStandardMaterial({ color: "#3b403d", roughness: 0.28, metalness: 0.85 });
  const glass = new T.MeshPhysicalMaterial({
    color: "#080e12", metalness: 0.08, roughness: 0.035,
    clearcoat: 1, clearcoatRoughness: 0.025, ior: 1.52,
    specularColor: new T.Color("#a1aec3"), envMapIntensity: 1.2,
  });
  const irGlass = new T.MeshPhysicalMaterial({
    color: "#161819", roughness: 0.12, metalness: 0.13,
    clearcoat: 0.9, clearcoatRoughness: 0.08, envMapIntensity: 0.6,
  });
  const part = (name: string) => {
    const group = new T.Group(); group.name = name;
    root.add(group); groups.push(group); return group;
  };
  function mesh(g: T.Group, geometry: T.BufferGeometry, material: T.Material, x = 0, y = 0, z = 0) {
    const m = new T.Mesh(geometry, material); m.position.set(x, y, z); g.add(m); return m;
  }
  function turned(g: T.Group, points: number[][], material: T.Material, x = 0, y = 0, z = 0, segments = 96) {
    const m = mesh(g, new T.LatheGeometry(points.map(([r, depth]) => new T.Vector2(r, depth)), segments), material, x, y, z);
    m.rotation.x = Math.PI / 2; return m;
  }
  function ring(g: T.Group, outer: number, inner: number, depth: number, z: number, material: T.Material) {
    return turned(g, [[inner, z - depth / 2], [outer - 0.012, z - depth / 2], [outer, z - depth / 2 + 0.012], [outer, z + depth / 2 - 0.012], [outer - 0.012, z + depth / 2], [inner, z + depth / 2], [inner, z - depth / 2]], material);
  }
  function disc(g: T.Group, r: number, depth: number, material: T.Material, x = 0, y = 0, z = 0, segments = 64) {
    const m = mesh(g, new T.CylinderGeometry(r, r, depth, segments), material, x, y, z); m.rotation.x = Math.PI / 2; return m;
  }
  function instances(g: T.Group, geometry: T.BufferGeometry, material: T.Material, poses: { p: number[]; r?: number[] }[]) {
    const instanced = new T.InstancedMesh(geometry, material, poses.length);
    const dummy = new T.Object3D();
    poses.forEach(({ p, r }, i) => {
      dummy.position.set(p[0], p[1], p[2]);
      dummy.rotation.set(r?.[0] ?? 0, r?.[1] ?? 0, r?.[2] ?? 0);
      dummy.updateMatrix(); instanced.setMatrixAt(i, dummy.matrix);
    });
    instanced.instanceMatrix.needsUpdate = true; g.add(instanced); return instanced;
  }
  const circular = (count: number, radius: number, z: number, offset = 0) => Array.from({ length: count }, (_, i) => {
    const angle = i * Math.PI * 2 / count + offset;
    return { p: [Math.cos(angle) * radius, Math.sin(angle) * radius, z], r: [Math.PI / 2, 0, angle] };
  });
  function fasteners(g: T.Group, poses: ReturnType<typeof circular>) {
    instances(g, new T.CylinderGeometry(0.038, 0.046, 0.024, 16), alloy, poses);
    // Recessed Torx sockets, rather than large shiny dots.
    instances(g, new T.CylinderGeometry(0.015, 0.015, 0.0015, 6), black,
      poses.map(({ p, r }) => ({ p: [p[0], p[1], p[2] + 0.0128], r })));
  }

  const housing = part("cast weatherproof housing");
  const outer = new T.CatmullRomCurve3([
    new T.Vector3(0.01, -1.05, 0), new T.Vector3(0.55, -0.97, 0),
    new T.Vector3(0.91, -0.69, 0), new T.Vector3(1.125, -0.23, 0),
    new T.Vector3(1.145, 0.15, 0), new T.Vector3(1.095, 0.45, 0),
  ]).getPoints(28).map(p => [p.x, p.y]);
  turned(housing, [...outer, [1.075, 0.485], [1.03, 0.488], [1.018, 0.462], [1.055, 0.15], [1.04, -0.21], [0.82, -0.66], [0.5, -0.9], [0.01, -0.955], [0.01, -1.05]], ivory);
  // The narrow separation between the casting and threaded front bezel.
  ring(housing, 1.085, 1.005, 0.032, 0.472, rubber);
  const pivots = [-1, 1].map(side => ({ p: [side * 1.01, -0.37, -0.27], r: [0, 0, Math.PI / 2] }));
  instances(housing, new T.CylinderGeometry(0.175, 0.185, 0.15, 40), ivory, pivots);
  instances(housing, new T.CylinderGeometry(0.088, 0.094, 0.158, 32), edge, pivots);
  instances(housing, new T.CylinderGeometry(0.047, 0.047, 0.164, 6), black, pivots);

  const mount = part("tilt cradle");
  // A stout, shallow swivel casting sits inside the base; no toy-like stalk.
  mesh(mount, new T.CylinderGeometry(0.66, 0.89, 0.36, 80), ivory, 0, -1.02, -0.25);
  mesh(mount, new T.CylinderGeometry(0.78, 0.79, 0.043, 80), rubber, 0, -1.208, -0.25);
  for (const side of [-1, 1]) {
    const support = mesh(mount, new T.CapsuleGeometry(0.12, 0.51, 8, 16), ivory, side * 0.92, -0.69, -0.28);
    support.rotation.z = side * -0.16;
  }

  const board = part("sensor and signal board");
  const pcb = new T.MeshStandardMaterial({ color: "#293b30", roughness: 0.66, metalness: 0.2 });
  const copper = new T.MeshStandardMaterial({ color: "#a68b48", roughness: 0.43, metalness: 0.78 });
  mesh(board, new T.BoxGeometry(0.87, 0.92, 0.04), pcb, 0, 0, -0.06);
  mesh(board, new T.BoxGeometry(0.43, 0.44, 0.035), alloy, 0, 0, -0.018);
  mesh(board, new T.BoxGeometry(0.34, 0.35, 0.039), black, 0, 0, 0.003);
  mesh(board, new T.BoxGeometry(0.215, 0.225, 0.008), glass, 0, 0, 0.026);
  const contacts = Array.from({ length: 20 }, (_, i) => ({ p: [(i % 10 - 4.5) * 0.037, i < 10 ? 0.237 : -0.237, -0.009] }));
  instances(board, new T.BoxGeometry(0.019, 0.055, 0.025), copper, contacts);
  const chips = Array.from({ length: 12 }, (_, i) => ({ p: [(i % 6 - 2.5) * 0.117, i < 6 ? 0.365 : -0.36, -0.022], r: [0, 0, i * 0.1] }));
  instances(board, new T.BoxGeometry(0.06, 0.09, 0.034), black, chips);
  fasteners(board, circular(4, 0.48, -0.012, Math.PI / 4));

  const optical = part("multi element optical assembly");
  turned(optical, [[0.25, 0.06], [0.37, 0.06], [0.37, 0.25], [0.43, 0.27], [0.43, 0.42], [0.46, 0.43], [0.46, 0.6], [0.44, 0.64], [0.335, 0.64], [0.3, 0.57], [0.25, 0.25], [0.25, 0.06]], black);
  ring(optical, 0.445, 0.385, 0.08, 0.662, edge);
  ring(optical, 0.421, 0.337, 0.053, 0.717, black);
  for (let i = 0; i < 4; i++) ring(optical, 0.422, 0.395, 0.008, 0.688 + i * 0.012, edge);
  // Convex coated glass responds to the actual environment. No painted-on reflections.
  const lensPoints = [[0, 0.778], [0.08, 0.776], [0.16, 0.766], [0.24, 0.748], [0.315, 0.719], [0.332, 0.702], [0.33, 0.683], [0.24, 0.711], [0.12, 0.724], [0, 0.729]];
  // Lathe profiles wind from rear to front along the outer surface.
  // Reverse this axis-to-rim profile so the convex face has outward normals.
  // A recessed aperture stays visible through the coated front element without
  // a transmission render pass. Keep infrared and sensor glass opaque.
  disc(optical, 0.31, 0.008, black, 0, 0, 0.676);
  ring(optical, 0.30, 0.205, 0.01, 0.686, edge);
  ring(optical, 0.202, 0.15, 0.009, 0.697, black);
  mesh(optical, new T.RingGeometry(0.125, 0.155, 9), alloy, 0, 0, 0.706);
  const opticalGlass = glass.clone();
  opticalGlass.transparent = true;
  opticalGlass.opacity = 0.6;
  opticalGlass.depthWrite = false;
  turned(optical, lensPoints.reverse(), opticalGlass);
  ring(optical, 0.343, 0.316, 0.028, 0.711, rubber);
  // Fine focus-barrel knurling is one draw call.
  instances(optical, new T.BoxGeometry(0.009, 0.025, 0.06), edge,
    circular(56, 0.441, 0.617).map(({ p }, i) => ({ p, r: [0, 0, i * Math.PI * 2 / 56] })));

  const infrared = part("recessed infrared array");
  ring(infrared, 1.01, 0.47, 0.095, 0.506, black);
  ring(infrared, 0.986, 0.485, 0.026, 0.566, irGlass);
  const emitters = circular(24, 0.762, 0.591, Math.PI / 24);
  instances(infrared, new T.CylinderGeometry(0.052, 0.056, 0.026, 16), edge, emitters);
  instances(infrared, new T.CylinderGeometry(0.034, 0.04, 0.019, 16), irGlass,
    emitters.map(({ p, r }) => ({ p: [p[0], p[1], p[2] + 0.019], r })));
  const emitterCaps = instances(infrared, new T.SphereGeometry(0.025, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), glass,
    emitters.map(({ p }) => ({ p: [p[0], p[1], p[2] + 0.027], r: [Math.PI / 2, 0, 0] })));
  emitterCaps.name = "unlit smoked emitter optics";
  fasteners(infrared, circular(3, 0.932, 0.597, Math.PI / 6));
  disc(infrared, 0.026, 0.007, glass, 0, -0.945, 0.592, 16);

  const front = part("sealed front bezel");
  ring(front, 1.079, 0.983, 0.115, 0.57, ivory);
  ring(front, 0.994, 0.976, 0.024, 0.628, rubber);
  ring(front, 1.056, 1.036, 0.008, 0.634, alloy);
  fasteners(front, circular(4, 1.025, 0.642, Math.PI / 4));

  const base = part("mounting foot");
  // Bevelled lathed base creates a soft specular edge, not a flat oversized platter.
  const foot = turned(base, [[0, -0.143], [0.95, -0.143], [1.015, -0.115], [1.035, -0.075], [1.035, 0.073], [1.018, 0.11], [0.975, 0.133], [0, 0.133]], ivory, 0, -1.37, -0.25);
  foot.rotation.x = 0;
  mesh(base, new T.CylinderGeometry(0.99, 0.99, 0.029, 80), rubber, 0, -1.51, -0.25);
  // Top mounting screw heads and real recessed dark sockets.
  const baseScrews = Array.from({ length: 3 }, (_, i) => {
    const a = i * Math.PI * 2 / 3;
    return { p: [Math.cos(a) * 0.88, -1.224, -0.25 + Math.sin(a) * 0.88] };
  });
  instances(base, new T.CylinderGeometry(0.037, 0.044, 0.016, 16), alloy, baseScrews);
  instances(base, new T.CylinderGeometry(0.016, 0.016, 0.001, 6), black,
    baseScrews.map(({ p }) => ({ p: [p[0], p[1] + 0.009, p[2]] })));

  if (typeof document !== "undefined") {
    const canvas = document.createElement("canvas"); canvas.width = 1024; canvas.height = 256;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.fillStyle = "#363935"; ctx.textAlign = "center"; ctx.font = "600 104px sans-serif";
      ctx.fillText("دیدبان", 512, 143);
      ctx.font = "23px sans-serif"; ctx.fillStyle = "#696b64"; ctx.fillText("D I D B A N", 512, 192);
      const map = new T.CanvasTexture(canvas); map.colorSpace = T.SRGBColorSpace;
      // Decal follows the casting using a very shallow cylindrical segment.
      const geometry = new T.CylinderGeometry(1.149, 1.149, 0.21, 32, 1, true, -0.72, 0.53);
      geometry.rotateX(Math.PI / 2);
      const label = mesh(housing, geometry, new T.MeshStandardMaterial({ map, transparent: true, roughness: 0.68, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -1 }), 0, 0, 0.045);
      label.rotation.z = -Math.PI / 2;
    }
  }
  return { root, groups };
}
