import * as T from "three";
import { mergeVertices } from "three/addons/utils/BufferGeometryUtils.js";
import { makeCamera } from "./CameraModel";

/** Original, unbranded product studies. Dimensions and engineering details are illustrative. */
export function makeCatalogModel(shape: string, finish = "ivory") {
  if (shape === "turret") {
    const model = makeCamera().root;
    if (finish === "graphite") model.traverse((object) => {
      if (!(object instanceof T.Mesh)) return;
      const materials = Array.isArray(object.material) ? object.material : [object.material];
      materials.forEach((material) => {
        if (material instanceof T.MeshStandardMaterial && material.color.getHexString() === "dedbd0") material.color.set("#353936");
      });
    });
    return model;
  }
  const root = new T.Group();
  root.name = `Original ${shape} camera study`;
  // Owned by this model, shared across its castings; normal viewer disposal also
  // releases these maps. No module-global texture survives a product change.
  const pixels = new Uint8Array(128 * 128 * 4);
  let seed = 79;
  for (let i = 0; i < 128 * 128; i++) {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    const n = 108 + (seed >>> 25);
    pixels.set([n, n, n, 255], i * 4);
  }
  const texture = new T.DataTexture(pixels, 128, 128, T.RGBAFormat);
  texture.wrapS = texture.wrapT = T.RepeatWrapping;
  texture.repeat.set(7, 7);
  texture.magFilter = T.LinearFilter;
  texture.minFilter = T.LinearMipmapLinearFilter;
  texture.generateMipmaps = true;
  texture.needsUpdate = true;
  const paint = new T.MeshStandardMaterial({ color: finish === "graphite" ? "#353936" : "#e3e1d9", roughness: 0.58, metalness: 0.06, bumpMap: texture, bumpScale: 0.0028 });
  const black = new T.MeshStandardMaterial({ color: "#111414", roughness: 0.35, metalness: 0.18 });
  const gasket = new T.MeshStandardMaterial({ color: "#141616", roughness: 0.84, metalness: 0 });
  const metal = new T.MeshStandardMaterial({ color: "#767b79", roughness: 0.3, metalness: 0.94 });
  const barrel = new T.MeshStandardMaterial({ color: "#242827", roughness: 0.29, metalness: 0.76 });
  const optical = new T.MeshPhysicalMaterial({ color: "#121b20", roughness: 0.035, metalness: 0.18, clearcoat: 1, clearcoatRoughness: 0.025, ior: 1.52, envMapIntensity: 1.25, specularColor: new T.Color("#bbc5ce") });
  const cover = new T.MeshPhysicalMaterial({ color: "#202525", roughness: 0.075, metalness: 0.1, clearcoat: 1, clearcoatRoughness: 0.06, transparent: true, opacity: 0.24, depthWrite: false, envMapIntensity: 0.9 });
  const ir = new T.MeshPhysicalMaterial({ color: "#252729", roughness: 0.16, metalness: 0.14, clearcoat: 0.9, clearcoatRoughness: 0.09 });
  function mesh(geometry: T.BufferGeometry, material: T.Material, x = 0, y = 0, z = 0, parent: T.Object3D = root) {
    const object = new T.Mesh(geometry, material);
    object.position.set(x, y, z); parent.add(object); return object;
  }
  function turned(points: number[][], material: T.Material, x = 0, y = 0, z = 0, axis: "y" | "z" = "z", parent: T.Object3D = root) {
    const signedArea = points.reduce((area, point, index) => { const next = points[(index + 1) % points.length]; return area + point[0] * next[1] - next[0] * point[1]; }, 0);
    const profile = signedArea < 0 ? [...points].reverse() : points;
    const object = mesh(new T.LatheGeometry(profile.map(([r, d]) => new T.Vector2(r, d)), 72), material, x, y, z, parent);
    if (axis === "z") object.rotation.x = Math.PI / 2;
    return object;
  }
  function disc(r: number, d: number, material: T.Material, x = 0, y = 0, z = 0, parent: T.Object3D = root) {
    const object = mesh(new T.CylinderGeometry(r, r, d, 48), material, x, y, z, parent);
    object.rotation.x = Math.PI / 2; return object;
  }
  function ring(outer: number, inner: number, depth: number, material: T.Material, x = 0, y = 0, z = 0, parent: T.Object3D = root) {
    return turned([[inner, -depth / 2], [outer - 0.007, -depth / 2], [outer, -depth / 2 + 0.007], [outer, depth / 2 - 0.007], [outer - 0.007, depth / 2], [inner, depth / 2], [inner, -depth / 2]], material, x, y, z, "z", parent);
  }
  function rounded(w: number, h: number, d: number, radius: number, material: T.Material, x = 0, y = 0, z = 0, parent: T.Object3D = root) {
    const outline = new T.Shape(), a = w / 2, b = h / 2, r = Math.min(radius, a, b);
    outline.moveTo(-a + r, -b); outline.lineTo(a - r, -b);
    outline.quadraticCurveTo(a, -b, a, -b + r); outline.lineTo(a, b - r);
    outline.quadraticCurveTo(a, b, a - r, b); outline.lineTo(-a + r, b);
    outline.quadraticCurveTo(-a, b, -a, b - r); outline.lineTo(-a, -b + r);
    outline.quadraticCurveTo(-a, -b, -a + r, -b);
    const bevel = Math.min(0.035, d * 0.22);
    const geometry = new T.ExtrudeGeometry(outline, { depth: d - bevel * 2, bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 3, curveSegments: 12, steps: 1 });
    geometry.translate(0, 0, -d / 2 + bevel);
    geometry.deleteAttribute("normal");
    const smoothGeometry = mergeVertices(geometry);
    smoothGeometry.computeVertexNormals();
    geometry.dispose();
    return mesh(smoothGeometry, material, x, y, z, parent);
  }
  type Pose = { x: number; y: number; z: number; rx?: number; ry?: number; rz?: number };
  function instances(geometry: T.BufferGeometry, material: T.Material, poses: Pose[], parent: T.Object3D = root) {
    const objects = new T.InstancedMesh(geometry, material, poses.length), dummy = new T.Object3D();
    poses.forEach((p, i) => {
      dummy.position.set(p.x, p.y, p.z); dummy.rotation.set(p.rx ?? 0, p.ry ?? 0, p.rz ?? 0);
      dummy.updateMatrix(); objects.setMatrixAt(i, dummy.matrix);
    });
    objects.instanceMatrix.needsUpdate = true; parent.add(objects); return objects;
  }
  function circular(count: number, radius: number, x: number, y: number, z: number, offset = 0): Pose[] {
    return Array.from({ length: count }, (_, i) => {
      const angle = i * Math.PI * 2 / count + offset;
      return { x: x + Math.cos(angle) * radius, y: y + Math.sin(angle) * radius, z, rx: Math.PI / 2 };
    });
  }
  function screws(poses: Pose[], parent: T.Object3D = root) {
    instances(new T.CylinderGeometry(0.028, 0.032, 0.018, 16), metal, poses, parent);
    const recess = new T.Shape();
    for (let i = 0; i < 24; i++) {
      const a = i * Math.PI / 12, r = i % 4 === 0 || i % 4 === 3 ? 0.012 : 0.0085;
      if (i === 0) recess.moveTo(Math.cos(a) * r, Math.sin(a) * r);
      else recess.lineTo(Math.cos(a) * r, Math.sin(a) * r);
    }
    recess.closePath();
    const geometry = new T.ShapeGeometry(recess);
    geometry.rotateX(-Math.PI / 2);
    instances(geometry, black, poses.map(p => ({ ...p, y: p.y + (p.rx ? 0 : 0.01), z: p.z + (p.rx ? 0.01 : 0) })), parent);
  }
  function lens(radius: number, x: number, y: number, z: number, parent: T.Object3D = root) {
    // The barrel encloses layered convex optics; studio reflections are real.
    ring(radius, radius * 0.77, 0.105, black, x, y, z, parent);
    ring(radius * 0.91, radius * 0.775, 0.016, barrel, x, y, z + 0.048, parent);
    ring(radius * 0.78, radius * 0.695, 0.018, gasket, x, y, z + 0.055, parent);
    turned([[0, 0.024], [radius * 0.2, 0.02], [radius * 0.45, 0.007], [radius * 0.69, -0.025], [radius * 0.7, -0.047], [0, -0.047]], optical, x, y, z + 0.075, "z", parent);
    disc(radius * 0.24, 0.002, black, x, y, z + 0.101, parent);
    // An outer optical surface catches wide softbox reflections over the pupil.
    turned([[0, 0.05], [radius * 0.28, 0.046], [radius * 0.53, 0.032], [radius * 0.7, 0.005]], cover, x, y, z + 0.08, "z", parent);
  }
  function emitters(count: number, radius: number, x: number, y: number, z: number, parent: T.Object3D = root) {
    const poses = circular(count, radius, x, y, z, Math.PI / count);
    instances(new T.CylinderGeometry(0.041, 0.048, 0.025, 20), barrel, poses, parent);
    instances(new T.SphereGeometry(0.032, 16, 10), ir, poses.map(p => ({ ...p, z: p.z + 0.012 })), parent);
  }
  function bracket(x = 0, y = -0.55, z = -0.48) {
    const joint = mesh(new T.SphereGeometry(0.17, 32, 20), paint, x, y, z);
    joint.scale.y = 0.85;
    const arm = mesh(new T.CylinderGeometry(0.1, 0.13, 0.64, 32), paint, x, y - 0.18, z - 0.265);
    arm.rotation.x = 0.974;
    turned([[0, -0.055], [0.32, -0.055], [0.36, -0.035], [0.365, 0.025], [0.34, 0.055], [0, 0.055]], paint, x, y - 0.36, z - 0.53);
    disc(0.338, 0.012, gasket, x, y - 0.36, z - 0.591);
    screws(circular(3, 0.275, x, y - 0.36, z - 0.471, Math.PI / 6));
  }

  if (shape === "bullet" || shape === "thermal") {
    turned([[0, -1.17], [0.52, -1.17], [0.64, -1.12], [0.665, -1.04], [0.665, 0.57], [0.65, 0.625], [0.59, 0.635], [0.585, 0.565], [0.61, 0.54], [0.61, -1.03], [0, -1.085]], paint, 0, 0.13, 0);
    ring(0.67, 0.657, 0.018, gasket, 0, 0.13, -0.91);
    ring(0.662, 0.586, 0.065, paint, 0, 0.13, 0.64);
    ring(0.592, 0.573, 0.018, gasket, 0, 0.13, 0.682);
    disc(0.578, 0.026, black, 0, 0.13, 0.628);
    lens(shape === "thermal" ? 0.355 : 0.285, 0, 0.13, 0.65);
    if (shape === "bullet") emitters(12, 0.445, 0, 0.13, 0.655);
    else {
      lens(0.103, 0.38, 0.34, 0.65);
      rounded(0.19, 0.1, 0.009, 0.024, ir, -0.36, -0.12, 0.654);
    }
    // Thin, separate cast sun shield; open underneath like a real weather hood.
    const hood = new T.CylinderGeometry(0.709, 0.725, 1.88, 48, 1, true, -Math.PI / 2, Math.PI);
    hood.rotateX(Math.PI / 2);
    hood.rotateZ(Math.PI);
    const shield = mesh(hood, paint, 0, 0.17, -0.11);
    shield.material = paint;
    paint.side = T.DoubleSide;
    screws(circular(3, 0.62, 0, 0.13, 0.683, Math.PI / 6));
    bracket(0, -0.53, -0.44);
  } else if (shape === "dome" || shape === "panorama") {
    turned([[0, -0.01], [0.96, -0.01], [1.01, 0.02], [1.025, 0.1], [1.025, 0.24], [0.99, 0.285], [0, 0.285]], paint, 0, 0.39, 0, "y");
    turned([[0.79, -0.1], [0.87, -0.1], [0.965, 0.04], [1.004, 0.12], [1.004, 0.19], [0.985, 0.205], [0.945, 0.19], [0.82, 0.015], [0.79, -0.1]], paint, 0, 0.25, 0, "y");
    mesh(new T.CylinderGeometry(0.989, 0.989, 0.018, 72), gasket, 0, 0.465, 0);
    mesh(new T.CylinderGeometry(0.79, 0.79, 0.035, 64), black, 0, 0.198, 0);
    const inner = mesh(new T.SphereGeometry(0.6, 48, 32), black, 0, -0.035, 0);
    inner.scale.set(0.98, 0.85, 0.88);
    lens(shape === "panorama" ? 0.315 : 0.26, 0, -0.095, 0.487);
    if (shape !== "panorama") emitters(8, 0.377, 0, -0.095, 0.429);
    const domeGeometry = new T.SphereGeometry(0.79, 64, 32, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2);
    mesh(domeGeometry, cover, 0, 0.205, 0).renderOrder = 2;
    const poses = Array.from({ length: 3 }, (_, i) => {
      const a = i * Math.PI * 2 / 3 + Math.PI / 6;
      return { x: Math.cos(a) * 0.92, y: 0.679, z: Math.sin(a) * 0.92 };
    });
    screws(poses);
  } else if (shape === "ptz") {
    // Smooth cast bell with a distinct pan bearing and recessed optical head.
    turned([[0, 1.22], [0.31, 1.22], [0.37, 1.18], [0.395, 1.035], [0.44, 0.985], [0.52, 0.79], [0.61, 0.455], [0.68, 0.28], [0.685, 0.17], [0.66, 0.12], [0.595, 0.12], [0.59, 0.21], [0.43, 0.8], [0, 0.8]], paint, 0, 0, 0, "y");
    mesh(new T.CylinderGeometry(0.665, 0.665, 0.024, 64), gasket, 0, 0.122, 0);
    turned([[0.55, -0.08], [0.63, -0.08], [0.666, -0.01], [0.667, 0.095], [0.64, 0.117], [0.55, 0.117]], paint, 0, 0, 0, "y");
    const ball = mesh(new T.SphereGeometry(0.635, 56, 36), black, 0, -0.3, 0);
    ball.scale.y = 1.04;
    lens(0.265, 0, -0.365, 0.59);
    for (const side of [-1, 1]) rounded(0.08, 0.2, 0.015, 0.035, ir, side * 0.325, -0.37, 0.543);
    const arm = rounded(0.24, 0.21, 0.93, 0.055, paint, 0, 1.16, -0.47);
    arm.rotation.x = -0.1;
    rounded(0.57, 0.64, 0.1, 0.06, paint, 0, 1.04, -0.985);
    screws([{ x: -0.21, y: 1.25, z: -0.922, rx: Math.PI / 2 }, { x: 0.21, y: 1.25, z: -0.922, rx: Math.PI / 2 }, { x: -0.21, y: 0.83, z: -0.922, rx: Math.PI / 2 }, { x: 0.21, y: 0.83, z: -0.922, rx: Math.PI / 2 }]);
  } else if (shape === "indoor") {
    // A compact pan/tilt camera, with a recessed moving optical insert.
    const body = mesh(new T.SphereGeometry(0.625, 56, 36), paint, 0, 0.1, -0.02);
    body.scale.set(1, 1.08, 0.88);
    rounded(0.66, 0.89, 0.12, 0.29, black, 0, 0.15, 0.475);
    lens(0.228, 0, 0.3, 0.543);
    rounded(0.2, 0.075, 0.012, 0.025, ir, 0, -0.08, 0.541);
    disc(0.013, 0.008, ir, 0, -0.185, 0.543);
    turned([[0, -0.1], [0.4, -0.1], [0.5, -0.06], [0.53, 0.01], [0.49, 0.14], [0.39, 0.23], [0, 0.23]], paint, 0, -0.72, -0.035, "y");
    mesh(new T.CylinderGeometry(0.44, 0.45, 0.022, 48), gasket, 0, -0.812, -0.035);
    const holes = Array.from({ length: 21 }, (_, i) => ({ x: ((i % 7) - 3) * 0.037, y: -0.655 + Math.floor(i / 7) * 0.035, z: 0.461, rx: Math.PI / 2 }));
    instances(new T.CylinderGeometry(0.006, 0.006, 0.01, 8), black, holes);
  } else if (shape === "doorbell") {
    rounded(0.77, 1.83, 0.29, 0.19, paint, 0, 0, -0.035);
    rounded(0.729, 1.77, 0.026, 0.17, gasket, 0, 0, 0.124);
    rounded(0.707, 1.745, 0.033, 0.16, black, 0, 0, 0.147);
    lens(0.237, 0, 0.447, 0.185);
    rounded(0.23, 0.1, 0.012, 0.043, ir, 0, 0.06, 0.17);
    disc(0.179, 0.018, barrel, 0, -0.405, 0.178);
    ring(0.154, 0.144, 0.011, metal, 0, -0.405, 0.19);
    disc(0.142, 0.022, black, 0, -0.405, 0.191);
    const holes = Array.from({ length: 18 }, (_, i) => ({ x: ((i % 6) - 2.5) * 0.041, y: -0.707 + Math.floor(i / 6) * 0.033, z: 0.168, rx: Math.PI / 2 }));
    instances(new T.CylinderGeometry(0.007, 0.007, 0.009, 8), gasket, holes);
    rounded(0.59, 1.61, 0.04, 0.12, gasket, 0, 0, -0.201);
  } else if (shape === "battery" || shape === "solar") {
    rounded(0.97, 1.23, 0.98, 0.34, paint, 0, 0.1, -0.1);
    rounded(0.925, 1.185, 0.027, 0.32, gasket, 0, 0.1, 0.405);
    rounded(0.895, 1.155, 0.055, 0.31, black, 0, 0.1, 0.432);
    lens(0.242, 0, 0.31, 0.478);
    rounded(0.43, 0.22, 0.04, 0.09, ir, 0, -0.23, 0.472);
    rounded(0.4, 0.082, 0.02, 0.035, cover, 0, 0.57, 0.477);
    disc(0.013, 0.007, ir, 0, -0.047, 0.466);
    bracket(0, -0.34, -0.42);
    if (shape === "solar") {
      const panel = new T.Group(); root.add(panel);
      panel.position.set(1.01, 0.26, -0.6); panel.rotation.set(-0.18, -0.34, 0);
      rounded(0.85, 1.24, 0.065, 0.045, barrel, 0, 0, 0, panel);
      rounded(0.788, 1.17, 0.009, 0.025, gasket, 0, 0, 0.039, panel);
      const cell = new T.MeshPhysicalMaterial({ color: "#161d24", roughness: 0.22, metalness: 0.38, clearcoat: 0.65 });
      const cells = Array.from({ length: 12 }, (_, i) => ({ x: (i % 3 - 1) * 0.253, y: (Math.floor(i / 3) - 1.5) * 0.283, z: 0.047 }));
      instances(new T.BoxGeometry(0.24, 0.269, 0.006), cell, cells, panel);
      const contacts = Array.from({ length: 36 }, (_, i) => ({ x: ((i % 9) - 4) * 0.084, y: (Math.floor(i / 9) - 1.5) * 0.283, z: 0.053 }));
      instances(new T.BoxGeometry(0.0018, 0.26, 0.001), metal, contacts, panel);
      const stand = mesh(new T.CylinderGeometry(0.043, 0.055, 0.61, 20), barrel, 0, -0.49, -0.18, panel); stand.rotation.x = 0.48;
      const cable = new T.CatmullRomCurve3([new T.Vector3(0.78, -0.12, -0.67), new T.Vector3(0.75, -0.75, -0.82), new T.Vector3(0.42, -0.8, -0.83), new T.Vector3(0.29, -0.29, -0.61)]);
      mesh(new T.TubeGeometry(cable, 24, 0.018, 6, false), gasket);
    }
  }
  return root;
}
