import * as T from "three";
import { makeCamera } from "./CameraModel";
/** Original generic camera archetypes. No branded models or technical specification claims. */
export function makeCatalogModel(shape: string, finish = "ivory") {
  const root = new T.Group();
  const ivory = new T.MeshStandardMaterial({
    color: finish === "graphite" ? "#343934" : "#e2dfd5",
    roughness: 0.4,
    metalness: 0.14,
  });
  const dark = new T.MeshStandardMaterial({
    color: "#151b19",
    roughness: 0.3,
    metalness: 0.23,
  });
  const glass = new T.MeshPhysicalMaterial({
    color: "#10251f",
    roughness: 0.1,
    metalness: 0.65,
    clearcoat: 1,
  });
  const silver = new T.MeshStandardMaterial({
    color: "#848c84",
    roughness: 0.32,
    metalness: 0.8,
  });
  function add(
    geometry: T.BufferGeometry,
    mat: T.Material,
    x = 0,
    y = 0,
    z = 0,
  ) {
    const m = new T.Mesh(geometry, mat);
    m.position.set(x, y, z);
    root.add(m);
    return m;
  }
  function disk(r: number, d: number, mat: T.Material, x = 0, y = 0, z = 0) {
    const m = add(new T.CylinderGeometry(r, r, d, 48), mat, x, y, z);
    m.rotation.x = Math.PI / 2;
    return m;
  }
  function lens(r: number, x = 0, y = 0, z = 0.5) {
    disk(r, 0.12, dark, x, y, z);
    add(new T.TorusGeometry(r * 0.8, 0.025, 8, 48), silver, x, y, z + 0.07);
    disk(r * 0.68, 0.03, glass, x, y, z + 0.075);
    disk(r * 0.3, 0.035, dark, x, y, z + 0.096);
    const glint = add(
      new T.SphereGeometry(r * 0.13, 12, 8),
      silver,
      x - r * 0.19,
      y + r * 0.19,
      z + 0.12,
    );
    glint.scale.set(1, 0.4, 0.06);
  }
  function wall() {
    const arm = add(
      new T.CylinderGeometry(0.12, 0.14, 0.8, 24),
      ivory,
      0,
      -0.57,
      -0.5,
    );
    arm.rotation.z = 0.25;
    const plate = add(
      new T.CylinderGeometry(0.47, 0.47, 0.09, 48),
      ivory,
      0,
      -0.82,
      -0.88,
    );
    plate.rotation.x = Math.PI / 2;
    for (let i = 0; i < 3; i++) {
      const a = (i * Math.PI * 2) / 3;
      disk(
        0.025,
        0.02,
        silver,
        Math.cos(a) * 0.35,
        -0.82 + Math.sin(a) * 0.35,
        -0.82,
      );
    }
  }
  if (shape === "turret") {
    const model = makeCamera().root;
    if (finish === "graphite")
      model.traverse((o) => {
        if (o instanceof T.Mesh) {
          const materials = Array.isArray(o.material)
            ? o.material
            : [o.material];
          materials.forEach((m) => {
            if (
              m instanceof T.MeshStandardMaterial &&
              m.color.getHexString() === "dedbd0"
            )
              m.color.set("#343934");
          });
        }
      });
    return model;
  }
  if (shape === "bullet" || shape === "thermal") {
    const body = add(
      new T.CylinderGeometry(0.69, 0.74, 1.85, 64),
      ivory,
      0,
      0.12,
      -0.38,
    );
    body.rotation.x = Math.PI / 2;
    const hood = add(
      new T.CylinderGeometry(0.76, 0.76, 1.8, 48, 1, true, 0, Math.PI),
      ivory,
      0,
      0.2,
      -0.25,
    );
    hood.rotation.x = Math.PI / 2;
    disk(0.65, 0.1, dark, 0, 0.12, 0.59);
    lens(shape === "thermal" ? 0.33 : 0.29, 0, 0.12, 0.68);
    if (shape === "bullet")
      for (let i = 0; i < 12; i++) {
        const a = (i * Math.PI) / 6;
        disk(
          0.035,
          0.025,
          silver,
          Math.cos(a) * 0.49,
          0.12 + Math.sin(a) * 0.49,
          0.68,
        );
      }
    add(new T.TorusGeometry(0.7, 0.012, 6, 48), silver, 0, 0.12, -1.03);
    wall();
  } else if (shape === "dome" || shape === "panorama") {
    add(new T.CylinderGeometry(1.03, 1.03, 0.24, 64), ivory, 0, 0.55, 0);
    add(new T.CylinderGeometry(0.99, 0.78, 0.28, 64), ivory, 0, 0.31, 0);
    const dome = add(
      new T.SphereGeometry(0.85, 48, 24, 0, Math.PI * 2, 0, Math.PI / 2),
      dark,
      0,
      0.2,
      0,
    );
    dome.rotation.z = Math.PI;
    lens(shape === "panorama" ? 0.36 : 0.29, 0, -0.03, 0.67);
    const seam = add(new T.TorusGeometry(1, 0.018, 8, 64), silver, 0, 0.44, 0);
    seam.rotation.x = Math.PI / 2;
    for (let i = 0; i < 3; i++) {
      const a = (i * Math.PI * 2) / 3;
      add(
        new T.CylinderGeometry(0.03, 0.03, 0.025, 10),
        silver,
        Math.cos(a) * 0.9,
        0.69,
        Math.sin(a) * 0.9,
      );
    }
  } else if (shape === "ptz") {
    add(new T.CylinderGeometry(0.56, 0.56, 0.22, 48), ivory, 0, 1.15, 0);
    add(new T.CylinderGeometry(0.51, 0.65, 0.83, 48), ivory, 0, 0.68, 0);
    add(new T.CylinderGeometry(0.65, 0.71, 0.16, 48), ivory, 0, 0.18, 0);
    const ball = add(new T.SphereGeometry(0.73, 48, 32), dark, 0, -0.28, 0);
    ball.scale.y = 1.04;
    lens(0.32, 0, -0.29, 0.66);
    const bracket = add(
      new T.BoxGeometry(0.25, 0.12, 0.9),
      ivory,
      0,
      1.28,
      -0.48,
    );
    bracket.rotation.x = -0.14;
    disk(0.33, 0.1, ivory, 0, 1.28, -0.97);
  } else if (shape === "indoor") {
    const body = add(new T.SphereGeometry(0.68, 48, 32), ivory, 0, 0.13, 0);
    body.scale.set(1, 1.12, 0.82);
    disk(0.47, 0.09, dark, 0, 0.2, 0.54);
    lens(0.24, 0, 0.28, 0.6);
    add(new T.CylinderGeometry(0.12, 0.16, 0.47, 24), ivory, 0, -0.63, -0.06);
    add(new T.CylinderGeometry(0.51, 0.57, 0.09, 48), ivory, 0, -0.9, -0.06);
  } else if (shape === "doorbell") {
    const outline = new T.Shape(),
      w = 0.76,
      h = 1.8,
      r = 0.16;
    outline.moveTo(-w / 2 + r, -h / 2);
    outline.lineTo(w / 2 - r, -h / 2);
    outline.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + r);
    outline.lineTo(w / 2, h / 2 - r);
    outline.quadraticCurveTo(w / 2, h / 2, w / 2 - r, h / 2);
    outline.lineTo(-w / 2 + r, h / 2);
    outline.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - r);
    outline.lineTo(-w / 2, -h / 2 + r);
    outline.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + r, -h / 2);
    add(
      new T.ExtrudeGeometry(outline, {
        depth: 0.25,
        bevelEnabled: true,
        bevelSegments: 3,
        steps: 1,
        bevelSize: 0.035,
        bevelThickness: 0.035,
      }),
      dark,
      0,
      0,
      -0.16,
    );
    lens(0.23, 0, 0.45, 0.17);
    disk(0.17, 0.025, silver, 0, -0.46, 0.17);
    disk(0.135, 0.03, dark, 0, -0.46, 0.19);
  } else if (shape === "battery" || shape === "solar") {
    const body = add(
      new T.CylinderGeometry(0.53, 0.53, 1.25, 48),
      ivory,
      0,
      0.05,
      -0.22,
    );
    body.rotation.x = Math.PI / 2;
    disk(0.49, 0.1, dark, 0, 0.05, 0.43);
    lens(0.23, 0, 0.1, 0.52);
    disk(0.085, 0.03, silver, 0, -0.25, 0.52);
    wall();
    if (shape === "solar") {
      const panel = new T.Group();
      root.add(panel);
      panel.position.set(1.05, 0.38, -0.55);
      panel.rotation.set(-0.2, -0.35, 0);
      const frame = new T.Mesh(new T.BoxGeometry(0.88, 1.17, 0.07), silver);
      panel.add(frame);
      const surface = new T.Mesh(
        new T.BoxGeometry(0.79, 1.08, 0.015),
        new T.MeshStandardMaterial({
          color: "#1d2933",
          roughness: 0.27,
          metalness: 0.6,
        }),
      );
      surface.position.z = 0.045;
      panel.add(surface);
      for (let i = 0; i < 4; i++) {
        const line = new T.Mesh(new T.BoxGeometry(0.003, 1.05, 0.002), silver);
        line.position.set((i - 1.5) * 0.19, 0, 0.055);
        panel.add(line);
      }
      for (let i = 0; i < 5; i++) {
        const line = new T.Mesh(new T.BoxGeometry(0.78, 0.003, 0.002), silver);
        line.position.set(0, (i - 2) * 0.2, 0.055);
        panel.add(line);
      }
    }
  }
  return root;
}
