import * as T from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

/** One calibrated product-photography rig for the story, viewer and catalog. */
export function createStudioLighting(
  renderer: T.WebGLRenderer,
  scene: T.Scene,
) {
  renderer.outputColorSpace = T.SRGBColorSpace;
  renderer.toneMapping = T.NeutralToneMapping;
  renderer.toneMappingExposure = 1;

  const pmrem = new T.PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  const environment = pmrem.fromScene(room, 0.035);
  room.dispose();
  pmrem.dispose();
  scene.environment = environment.texture;
  scene.environmentIntensity = 0.62;
  scene.environmentRotation.y = 0.45;

  // Broad environment reflections define the finish. Restrained direct light
  // retains the distinction between powder coat, machined metal and dark glass.
  const fill = new T.HemisphereLight(0xfaf7f0, 0x353b38, 0.24);
  const key = new T.DirectionalLight(0xfff7e9, 2.1);
  key.position.set(-3.5, 5, 4);
  const rim = new T.DirectionalLight(0xe5edff, 1.15);
  rim.position.set(4, 2, -3);
  scene.add(fill, key, rim);

  return {
    dispose() {
      scene.remove(fill, key, rim);
      scene.environment = null;
      environment.dispose();
    },
  };
}
