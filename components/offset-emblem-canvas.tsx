"use client";

import { Environment, Lightformer, useGLTF } from "@react-three/drei";
import { Canvas, useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

const EMBLEM_MODEL_PATH = "/models/OFFSET_emblem_lime_chrome.glb";
const EMBLEM_TARGET_SIZE = 3.35;
const IDLE_ROTATION_SPEED = Math.PI / 10;
const DRAG_SENSITIVITY = 0.008;
const MAX_ANGULAR_SPEED = 9;

type RotationControls = {
  dragging: boolean;
  lastX: number;
  lastY: number;
  lastTime: number;
  pendingX: number;
  pendingY: number;
  velocityX: number;
  velocityY: number;
  pointerId: number | null;
};

type ReactiveMaterial = {
  material: THREE.MeshStandardMaterial;
  baseEmissiveIntensity: number;
  baseEnvironmentIntensity: number;
};

function EmblemScene({
  onDragChange,
  reducedMotion,
}: {
  onDragChange: (dragging: boolean) => void;
  reducedMotion: boolean;
}) {
  const { scene } = useGLTF(EMBLEM_MODEL_PATH);
  const canvas = useThree((state) => state.gl.domElement);
  const invalidate = useThree((state) => state.invalidate);
  const sculpture = useRef<THREE.Group>(null);
  const accentLight = useRef<THREE.PointLight>(null);
  const accentResponse = useRef(0);
  const controls = useRef<RotationControls>({
    dragging: false,
    lastX: 0,
    lastY: 0,
    lastTime: 0,
    pendingX: 0,
    pendingY: 0,
    velocityX: 0,
    velocityY: IDLE_ROTATION_SPEED,
    pointerId: null,
  });

  const { model, reactiveMaterials } = useMemo(() => {
    const clonedScene = scene.clone(true);
    const responsiveMaterials: ReactiveMaterial[] = [];

    clonedScene.traverse((object) => {
      if (!(object instanceof THREE.Mesh)) return;

      const sourceMaterials = Array.isArray(object.material) ? object.material : [object.material];
      const materials = sourceMaterials.map((sourceMaterial) => {
        const clonedMaterial = sourceMaterial.clone();

        if (clonedMaterial instanceof THREE.MeshStandardMaterial) {
          responsiveMaterials.push({
            material: clonedMaterial,
            baseEmissiveIntensity: clonedMaterial.emissiveIntensity,
            baseEnvironmentIntensity: clonedMaterial.envMapIntensity,
          });
        }

        return clonedMaterial;
      });

      object.material = Array.isArray(object.material) ? materials : materials[0];
      object.castShadow = true;
      object.receiveShadow = true;
    });

    const bounds = new THREE.Box3().setFromObject(clonedScene);
    const center = bounds.getCenter(new THREE.Vector3());
    const size = bounds.getSize(new THREE.Vector3());
    const normalizationScale = EMBLEM_TARGET_SIZE / Math.max(size.x, size.y);

    clonedScene.scale.setScalar(normalizationScale);
    clonedScene.position.copy(center).multiplyScalar(-normalizationScale);

    return {
      model: clonedScene,
      reactiveMaterials: responsiveMaterials,
    };
  }, [scene]);

  useEffect(() => {
    invalidate();
    return () => {
      model.traverse((object) => {
        if (!(object instanceof THREE.Mesh)) return;
        const materials = Array.isArray(object.material) ? object.material : [object.material];
        materials.forEach((material) => material.dispose());
      });
    };
  }, [invalidate, model]);

  const stopDragging = useCallback((pointerId?: number, releaseTime = performance.now()) => {
    const physics = controls.current;
    if (!physics.dragging) return;
    if (pointerId !== undefined && physics.pointerId !== pointerId) return;

    if (releaseTime - physics.lastTime > 90) {
      physics.velocityX *= 0.15;
      physics.velocityY *= 0.15;
    }

    physics.dragging = false;
    physics.pointerId = null;
    onDragChange(false);
  }, [onDragChange]);

  useEffect(() => {
    const handlePointerEnd = (event: PointerEvent) => stopDragging(event.pointerId, event.timeStamp);
    const handleLostCapture = (event: PointerEvent) => stopDragging(event.pointerId, event.timeStamp);
    const handleWindowBlur = () => stopDragging(undefined, performance.now());

    window.addEventListener("pointerup", handlePointerEnd, true);
    window.addEventListener("pointercancel", handlePointerEnd, true);
    window.addEventListener("blur", handleWindowBlur);
    canvas.addEventListener("lostpointercapture", handleLostCapture);

    return () => {
      window.removeEventListener("pointerup", handlePointerEnd, true);
      window.removeEventListener("pointercancel", handlePointerEnd, true);
      window.removeEventListener("blur", handleWindowBlur);
      canvas.removeEventListener("lostpointercapture", handleLostCapture);
    };
  }, [canvas, stopDragging]);

  const beginDrag = (event: ThreeEvent<PointerEvent>) => {
    if (reducedMotion || event.button !== 0) return;

    event.stopPropagation();
    event.nativeEvent.preventDefault();
    const captureTarget = event.nativeEvent.target;
    if (captureTarget instanceof Element) {
      captureTarget.setPointerCapture(event.pointerId);
    }
    const physics = controls.current;
    physics.dragging = true;
    physics.lastX = event.clientX;
    physics.lastY = event.clientY;
    physics.lastTime = event.timeStamp;
    physics.velocityX = 0;
    physics.velocityY = 0;
    physics.pointerId = event.pointerId;
    onDragChange(true);
  };

  const moveDrag = (event: ThreeEvent<PointerEvent>) => {
    const physics = controls.current;
    if (!physics.dragging || physics.pointerId !== event.pointerId) return;
    if ((event.buttons & 1) !== 1) {
      stopDragging(event.pointerId, event.timeStamp);
      return;
    }

    event.stopPropagation();
    const elapsed = Math.max((event.timeStamp - physics.lastTime) / 1000, 1 / 120);
    const deltaX = event.clientX - physics.lastX;
    const deltaY = event.clientY - physics.lastY;
    const pitch = deltaY * DRAG_SENSITIVITY;
    const yaw = deltaX * DRAG_SENSITIVITY;

    physics.pendingX += pitch;
    physics.pendingY += yaw;
    physics.velocityX = THREE.MathUtils.clamp(pitch / elapsed, -MAX_ANGULAR_SPEED, MAX_ANGULAR_SPEED);
    physics.velocityY = THREE.MathUtils.clamp(yaw / elapsed, -MAX_ANGULAR_SPEED, MAX_ANGULAR_SPEED);
    physics.lastX = event.clientX;
    physics.lastY = event.clientY;
    physics.lastTime = event.timeStamp;
  };

  const endDrag = (event: ThreeEvent<PointerEvent>) => {
    const physics = controls.current;
    if (!physics.dragging || physics.pointerId !== event.pointerId) return;

    event.stopPropagation();
    const captureTarget = event.nativeEvent.target;
    if (captureTarget instanceof Element && captureTarget.hasPointerCapture(event.pointerId)) {
      captureTarget.releasePointerCapture(event.pointerId);
    }
    stopDragging(event.pointerId, event.timeStamp);
  };

  useFrame((state, frameDelta) => {
    if (reducedMotion) return;

    const group = sculpture.current;
    const light = accentLight.current;
    if (!group || !light) return;

    const delta = Math.min(frameDelta, 0.05);
    const physics = controls.current;

    if (physics.pendingX !== 0 || physics.pendingY !== 0) {
      group.rotation.x += physics.pendingX;
      group.rotation.y += physics.pendingY;
      physics.pendingX = 0;
      physics.pendingY = 0;
    }

    if (!physics.dragging) {
      const returnToIdle = Math.exp(-1.55 * delta);
      physics.velocityX *= returnToIdle;
      physics.velocityY = IDLE_ROTATION_SPEED + (physics.velocityY - IDLE_ROTATION_SPEED) * returnToIdle;
      group.rotation.x += physics.velocityX * delta;
      group.rotation.y += physics.velocityY * delta;
    }

    const elapsed = state.clock.getElapsedTime();
    group.position.y = Math.sin(elapsed * 0.68) * 0.075;
    group.rotation.z = Math.sin(elapsed * 0.34) * 0.018;

    const angularSpeed = Math.hypot(physics.velocityX, physics.velocityY - IDLE_ROTATION_SPEED);
    const targetResponse = THREE.MathUtils.clamp(angularSpeed / 5.5, 0, 1);
    accentResponse.current = THREE.MathUtils.damp(accentResponse.current, targetResponse, 5, delta);

    reactiveMaterials.forEach(({ material, baseEmissiveIntensity, baseEnvironmentIntensity }) => {
      material.emissiveIntensity = baseEmissiveIntensity + accentResponse.current * 0.55;
      material.envMapIntensity = baseEnvironmentIntensity + accentResponse.current * 1.4;
    });
    light.intensity = 0.35 + accentResponse.current * 2.2;
  });

  return (
    <>
      <ambientLight intensity={0.22} />
      <directionalLight position={[3.5, 4, 5]} intensity={2.5} color="#f1f0e9" />
      <directionalLight position={[-4, -1.5, 2]} intensity={1.15} color="#8b938b" />
      <pointLight ref={accentLight} position={[1.8, 0.4, 2.2]} intensity={0.35} color="#c4ff38" distance={6} />

      <group
        ref={sculpture}
        rotation={[0.06, -0.35, 0]}
        scale={0.9}
        onPointerDown={beginDrag}
        onPointerMove={moveDrag}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        <mesh position={[0, 0, -0.24]}>
          <planeGeometry args={[3.8, 3.8]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
        <primitive object={model} />
      </group>

      <Environment resolution={128}>
        <Lightformer form="rect" intensity={5} color="#f1f0e9" position={[0, 4, 3]} scale={[5, 1.2, 1]} />
        <Lightformer form="rect" intensity={3} color="#ffffff" position={[-4, 0, 2]} rotation={[0, Math.PI / 2, 0]} scale={[3, 1, 1]} />
        <Lightformer form="rect" intensity={2.5} color="#c4ff38" position={[4, -1, 1]} rotation={[0, -Math.PI / 2, 0]} scale={[2.5, 0.7, 1]} />
        <Lightformer form="ring" intensity={2} color="#7d827d" position={[0, -4, -1]} scale={3} />
      </Environment>
    </>
  );
}

function ContextGuard({ onUnavailable }: { onUnavailable: () => void }) {
  const gl = useThree((state) => state.gl);

  useEffect(() => {
    const canvas = gl.domElement;
    const handleContextLost = (event: Event) => {
      event.preventDefault();
      onUnavailable();
    };

    canvas.addEventListener("webglcontextlost", handleContextLost);
    return () => canvas.removeEventListener("webglcontextlost", handleContextLost);
  }, [gl, onUnavailable]);

  return null;
}

export function OffsetEmblemCanvas({
  active,
  reducedMotion,
  onUnavailable,
}: {
  active: boolean;
  reducedMotion: boolean;
  onUnavailable: () => void;
}) {
  const [dragging, setDragging] = useState(false);

  return (
    <div
      className={`offset-emblem-canvas${dragging ? " is-dragging" : ""}`}
      onDragStart={(event) => event.preventDefault()}
      aria-hidden="true"
    >
      <Canvas
        frameloop={active && !reducedMotion ? "always" : "demand"}
        dpr={[1, 1.5]}
        camera={{ position: [0, 0, 6.3], fov: 31, near: 0.1, far: 40 }}
        gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 0);
        }}
      >
        <ContextGuard onUnavailable={onUnavailable} />
        <EmblemScene onDragChange={setDragging} reducedMotion={reducedMotion} />
      </Canvas>
    </div>
  );
}

useGLTF.preload(EMBLEM_MODEL_PATH);
