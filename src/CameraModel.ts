import * as T from "three";
/** Original procedural concept model: no branded geometry or claimed engineering specifications. */
export function makeCamera() {
  const root = new T.Group(),
    groups: T.Group[] = [];
  const ivory = new T.MeshStandardMaterial({
      color: "#dedbd0",
      roughness: 0.43,
      metalness: 0.16,
    }),
    dark = new T.MeshStandardMaterial({
      color: "#171b19",
      roughness: 0.3,
      metalness: 0.25,
    }),
    metal = new T.MeshStandardMaterial({
      color: "#73796f",
      roughness: 0.32,
      metalness: 0.7,
    }),
    glass = new T.MeshPhysicalMaterial({
      color: "#102a32",
      roughness: 0.12,
      metalness: 0.65,
      clearcoat: 1,
    });
  const addPart = () => {
    const g = new T.Group();
    root.add(g);
    groups.push(g);
    return g;
  };
  function mesh(
    g: T.Group,
    geo: T.BufferGeometry,
    mat: T.Material,
    x = 0,
    y = 0,
    z = 0,
  ) {
    const m = new T.Mesh(geo, mat);
    m.position.set(x, y, z);
    g.add(m);
    return m;
  }
  const disc = (
    g: T.Group,
    r: number,
    h: number,
    mat: T.Material,
    z = 0,
    x = 0,
    y = 0,
  ) => {
    const m = mesh(g, new T.CylinderGeometry(r, r, h, 64), mat, x, y, z);
    m.rotation.x = Math.PI / 2;
    return m;
  };
  const housing = addPart();
  const profile = [
    new T.Vector2(0, -1.22),
    new T.Vector2(0.4, -1.17),
    new T.Vector2(0.85, -0.97),
    new T.Vector2(1.13, -0.64),
    new T.Vector2(1.29, -0.2),
    new T.Vector2(1.3, 0.06),
    new T.Vector2(1.19, 0.3),
  ];
  const shell = mesh(housing, new T.LatheGeometry(profile, 80), ivory);
  shell.rotation.x = Math.PI / 2;
  disc(housing, 1.16, 0.08, ivory, 0.19);
  mesh(housing, new T.TorusGeometry(1.19, 0.06, 12, 80), ivory, 0, 0, 0.31);
  const mount = addPart();
  mesh(
    mount,
    new T.CylinderGeometry(1.2, 1.29, 0.3, 64),
    ivory,
    0,
    -1.37,
    -0.22,
  );
  mesh(
    mount,
    new T.CylinderGeometry(0.91, 1.02, 0.33, 64),
    ivory,
    0,
    -1.11,
    -0.22,
  );
  mesh(
    mount,
    new T.TorusGeometry(1.22, 0.018, 8, 64),
    metal,
    0,
    -1.35,
    -0.22,
  ).rotation.x = Math.PI / 2;
  for (let i = 0; i < 3; i++) {
    const a = (i * Math.PI * 2) / 3;
    mesh(
      mount,
      new T.CylinderGeometry(0.046, 0.046, 0.025, 12),
      metal,
      Math.cos(a) * 1.04,
      -1.2,
      -0.22 + Math.sin(a) * 1.04,
    );
  }
  const board = addPart();
  mesh(
    board,
    new T.BoxGeometry(0.9, 0.9, 0.045),
    new T.MeshStandardMaterial({ color: "#756e41", roughness: 0.7 }),
    0,
    0,
    0.08,
  );
  mesh(board, new T.BoxGeometry(0.31, 0.31, 0.06), dark, 0, 0, 0.13);
  for (let i = 0; i < 8; i++) {
    mesh(
      board,
      new T.BoxGeometry(0.09, 0.1, 0.035),
      metal,
      ((i % 4) - 1.5) * 0.2,
      i < 4 ? 0.36 : -0.36,
      0.12,
    );
  }
  const optical = addPart();
  disc(optical, 1.035, 0.15, dark, 0.4);
  disc(optical, 0.57, 0.37, dark, 0.55);
  for (let i = 0; i < 4; i++)
    mesh(
      optical,
      new T.TorusGeometry(0.56 - i * 0.042, 0.016, 8, 64),
      dark,
      0,
      0,
      0.74 + i * 0.015,
    );
  disc(optical, 0.35, 0.025, glass, 0.81);
  disc(optical, 0.17, 0.028, dark, 0.831);
  const reflection = mesh(
    optical,
    new T.SphereGeometry(0.105, 20, 12),
    glass,
    -0.09,
    0.1,
    0.848,
  );
  reflection.scale.set(1, 0.4, 0.07);
  const infrared = addPart();
  mesh(infrared, new T.TorusGeometry(0.8, 0.11, 12, 72), dark, 0, 0, 0.5);
  const ledGeo = new T.CylinderGeometry(0.075, 0.075, 0.065, 14),
    leds = new T.InstancedMesh(ledGeo, metal, 18),
    matrix = new T.Matrix4(),
    q = new T.Quaternion().setFromEuler(new T.Euler(Math.PI / 2, 0, 0));
  for (let i = 0; i < 18; i++) {
    const a = (i * Math.PI * 2) / 18;
    matrix.compose(
      new T.Vector3(Math.cos(a) * 0.81, Math.sin(a) * 0.81, 0.655),
      q,
      new T.Vector3(1, 1, 1),
    );
    leds.setMatrixAt(i, matrix);
  }
  leds.instanceMatrix.needsUpdate = true;
  infrared.add(leds);
  const ledGlass = new T.InstancedMesh(
    new T.CylinderGeometry(0.044, 0.044, 0.016, 12),
    glass,
    18,
  );
  for (let i = 0; i < 18; i++) {
    const a = (i * Math.PI * 2) / 18;
    matrix.compose(
      new T.Vector3(Math.cos(a) * 0.81, Math.sin(a) * 0.81, 0.702),
      q,
      new T.Vector3(1, 1, 1),
    );
    ledGlass.setMatrixAt(i, matrix);
  }
  ledGlass.instanceMatrix.needsUpdate = true;
  infrared.add(ledGlass);
  const front = addPart();
  mesh(front, new T.TorusGeometry(1.05, 0.075, 16, 96), metal, 0, 0, 0.57);
  mesh(front, new T.TorusGeometry(1.155, 0.045, 12, 80), ivory, 0, 0, 0.48);
  for (let i = 0; i < 4; i++) {
    const a = (i * Math.PI) / 2 + 0.78;
    disc(
      front,
      0.038,
      0.03,
      metal,
      0.52,
      Math.cos(a) * 1.14,
      Math.sin(a) * 1.14,
    );
  }
  // A local canvas wordmark on the housing — never external network texture.
  if (typeof document !== "undefined") {
    const c = document.createElement("canvas");
    c.width = 512;
    c.height = 160;
    const ctx = c.getContext("2d")!;
    ctx.fillStyle = "#282c27";
    ctx.font = "bold 78px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("دیدبان", 256, 110);
    const map = new T.CanvasTexture(c);
    map.colorSpace = T.SRGBColorSpace;
    const label = mesh(
      housing,
      new T.PlaneGeometry(0.57, 0.18),
      new T.MeshBasicMaterial({ map, transparent: true, depthWrite: false }),
      -0.74,
      0.04,
      0.51,
    );
    label.rotation.y = -0.52;
  }
  const base = addPart();
  const baseMesh = mount.children[0];
  base.attach(baseMesh);
  mesh(housing, new T.TorusGeometry(1.26, 0.016, 8, 80), metal, 0, 0, -0.18);
  return { root, groups };
}

export function makeArchetype(index: number) {
  const camera = makeCamera();
  if (index === 0) return camera;
  const { root, groups } = camera;
  const mat = new T.MeshStandardMaterial({
      color: "#dddcd4",
      roughness: 0.42,
      metalness: 0.12,
    }),
    black = new T.MeshStandardMaterial({ color: "#202622", roughness: 0.24 });
  groups[0].visible = false;
  groups[1].visible = false;
  groups[6].visible = false;
  const body = new T.Group();
  root.add(body);
  function add(geo: T.BufferGeometry, material = mat, x = 0, y = 0, z = 0) {
    const m = new T.Mesh(geo, material);
    m.position.set(x, y, z);
    body.add(m);
    return m;
  }
  if (index === 1 || index === 9) {
    const tube = add(
      new T.CylinderGeometry(0.81, 0.81, 2.2, 48),
      mat,
      0,
      0,
      -0.62,
    );
    tube.rotation.x = Math.PI / 2;
    add(new T.BoxGeometry(0.4, 0.7, 0.4), mat, 0, -0.65, -1.2);
    const b = add(
      new T.CylinderGeometry(0.65, 0.65, 0.16, 40),
      mat,
      0,
      -1.1,
      -1.2,
    );
    b.rotation.x = 0;
    groups.slice(2, 6).forEach((g) => g.scale.setScalar(0.7));
  } else if (index === 2 || index === 3 || index === 7) {
    add(
      new T.SphereGeometry(1.02, 48, 28),
      index === 2 ? black : mat,
      0,
      -0.1,
      -0.22,
    );
    add(new T.CylinderGeometry(1.18, 1.2, 0.3, 48), mat, 0, 0.68, -0.22);
    if (index === 3) {
      add(new T.CylinderGeometry(0.62, 0.78, 0.95, 48), mat, 0, 1.21, -0.22);
      add(new T.BoxGeometry(0.3, 0.35, 1.15), mat, 0, 1.68, -0.7);
    }
    groups.slice(2, 6).forEach((g) => {
      g.scale.setScalar(0.63);
      g.position.y = -0.15;
    });
  } else {
    add(
      new T.BoxGeometry(
        index === 8 ? 0.61 : 1.12,
        index === 8 ? 1.95 : 1.68,
        0.61,
      ),
      mat,
      0,
      0,
      -0.2,
    );
    groups.slice(2, 6).forEach((g) => {
      g.scale.setScalar(index === 8 ? 0.31 : 0.45);
      g.position.y = 0.3;
    });
    if (index === 4)
      add(new T.CylinderGeometry(0.72, 0.82, 0.14, 40), mat, 0, -1.02, -0.2);
    if (index === 6) {
      const panel = add(
        new T.BoxGeometry(1.42, 1.7, 0.08),
        black,
        1.22,
        0.52,
        -0.2,
      );
      panel.rotation.y = -0.25;
      panel.rotation.x = -0.3;
      add(new T.BoxGeometry(0.1, 0.6, 0.1), mat, 0.9, -0.4, -0.2);
    }
  }
  return camera;
}
