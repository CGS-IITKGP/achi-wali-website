import * as THREE from "three";

export type SupportedMaterial =
  | THREE.MeshStandardMaterial
  | THREE.MeshPhysicalMaterial;

export function isSupportedMaterial(
  material: THREE.Material
): material is SupportedMaterial {
  return (
    material instanceof THREE.MeshStandardMaterial ||
    material instanceof THREE.MeshPhysicalMaterial
  );
}

export function getMaterials(
  object: THREE.Mesh
): THREE.Material[] {
  return Array.isArray(object.material)
    ? object.material
    : [object.material];
}

export function traverseMeshes(
  scene: THREE.Object3D,
  callback: (object: THREE.Mesh) => void
) {
  scene.traverse((object) => {
    if (object instanceof THREE.Mesh) {
      callback(object);
    }
  });
}

export function setReflection(
  material: SupportedMaterial,
  envMapIntensity: number
) {
  material.envMapIntensity = envMapIntensity;
  material.needsUpdate = true;
}

export function setRoughness(
  material: SupportedMaterial,
  minimumRoughness: number
) {
  material.roughness = Math.max(
    material.roughness,
    minimumRoughness
  );

  material.needsUpdate = true;
}

export function findObject(
  scene: THREE.Object3D,
  name: string
) {
  return scene.getObjectByName(name) ?? null;
}

export function findObjectsByName(
  scene: THREE.Object3D,
  names: string[]
) {
  return names
    .map((name) => scene.getObjectByName(name))
    .filter(
      (object): object is THREE.Object3D =>
        object !== undefined
    );
}