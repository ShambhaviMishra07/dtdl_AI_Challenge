import { useEffect, useRef } from "react";
import * as THREE from "three";

/* ---- Tunables ---- */
const SHIFT = 0.17;   // how far right of center the network sits (fraction of width)
const SCALE = 1.2;    // overall size; larger reaches further left
const PULSE_SPEED = 22;

// Telekom magentas. Dark uses lighter shades (additive glow), light uses deeper ones.
const PALETTES = {
  dark: [0xe20074, 0xff4da6, 0xf4a6cd, 0xff6fb3, 0xb0005a],
  light: [0xe20074, 0xc70067, 0x8f0049, 0xd1006b, 0xf05aa6],
};

/* ---- Graph: layered crystalline sphere ---- */
function generateGraph(density) {
  const nodes = [{ pos: new THREE.Vector3(), level: 0, leaf: 0, size: 1.8, dist: 0 }];
  const edges = new Map();
  const link = (a, b, s) => {
    if (a === b) return;
    const k = a < b ? `${a}-${b}` : `${b}-${a}`;
    if (!edges.has(k)) edges.set(k, s);
  };
  const golden = (1 + Math.sqrt(5)) / 2;
  const layers = [[0]];

  for (let layer = 1; layer <= 5; layer++) {
    const radius = layer * 4;
    const count = Math.max(6, Math.floor(layer * 12 * density));
    const ids = [];

    for (let i = 0; i < count; i++) {
      const phi = Math.acos(1 - (2 * (i + 0.5)) / count);
      const theta = (2 * Math.PI * i) / golden;
      const pos = new THREE.Vector3(
        radius * Math.sin(phi) * Math.cos(theta),
        radius * Math.sin(phi) * Math.sin(theta),
        radius * Math.cos(phi)
      );
      const id = nodes.length;
      const leaf = layer === 5 || Math.random() < 0.3 ? 1 : 0;
      nodes.push({
        pos,
        level: layer,
        leaf,
        size: leaf ? THREE.MathUtils.randFloat(0.5, 1.0) : THREE.MathUtils.randFloat(0.8, 1.4),
        dist: radius,
      });
      ids.push(id);

      if (layer === 1) link(0, id, 0.9);
      else {
        layers[layer - 1]
          .map((j) => [j, pos.distanceTo(nodes[j].pos)])
          .sort((a, b) => a[1] - b[1])
          .slice(0, 3)
          .forEach(([j, d]) => link(id, j, Math.max(0.3, 1 - d / (radius * 2))));
      }
    }

    ids.forEach((id) => {
      ids
        .filter((j) => j !== id)
        .map((j) => [j, nodes[id].pos.distanceTo(nodes[j].pos)])
        .sort((a, b) => a[1] - b[1])
        .slice(0, 5)
        .forEach(([j, d]) => {
          if (d < radius * 0.8) link(id, j, 0.6);
        });
    });
    layers[layer] = ids;
  }
  return { nodes, edges };
}

/* ---- Shaders ---- */
const PULSE_GLSL = `
uniform float uTime;
uniform vec3 uPulsePos[3];
uniform float uPulseTimes[3];
uniform float uPulseSpeed;
float pulseAt(vec3 wp, vec3 pp, float pt) {
  float dt = uTime - pt;
  if (dt < 0.0 || dt > 4.0) return 0.0;
  float wave = abs(distance(wp, pp) - dt * uPulseSpeed);
  return smoothstep(3.0, 0.0, wave) * smoothstep(4.0, 0.0, dt);
}
float totalPulse(vec3 wp) {
  float p = 0.0;
  for (int i = 0; i < 3; i++) p += pulseAt(wp, uPulsePos[i], uPulseTimes[i]);
  return min(p, 1.0);
}`;

const NODE_VERT = `${PULSE_GLSL}
attribute float nodeSize;
attribute float nodeType;
attribute vec3 nodeColor;
attribute float distanceFromRoot;
uniform float uBaseNodeSize;
uniform float uSizeScale;
varying vec3 vColor;
varying float vPulse;
varying float vDist;
varying float vType;
void main() {
  vColor = nodeColor;
  vDist = distanceFromRoot;
  vType = nodeType;
  vec3 wp = (modelMatrix * vec4(position, 1.0)).xyz;
  vPulse = totalPulse(wp);
  float breathe = sin(uTime * 0.7 + distanceFromRoot * 0.15) * 0.15 + 0.85;
  float size = nodeSize * breathe * (1.0 + vPulse * 2.5);
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  gl_PointSize = size * uBaseNodeSize * uSizeScale * (1000.0 / -mv.z);
  gl_Position = projectionMatrix * mv;
}`;

const NODE_FRAG = `
uniform float uTime;
uniform float uLight;
uniform vec3 uAccent;
varying vec3 vColor;
varying float vPulse;
varying float vDist;
varying float vType;
void main() {
  vec2 c = 2.0 * gl_PointCoord - 1.0;
  float d = length(c);
  if (d > 1.0) discard;
  float g1 = 1.0 - smoothstep(0.0, 0.5, d);
  float g2 = 1.0 - smoothstep(0.0, 1.0, d);
  float glow = pow(g1, 1.2) + g2 * 0.3;
  vec3 col = vColor * (0.9 + 0.1 * sin(uTime * 0.6 + vDist * 0.25));
  if (vPulse > 0.0) {
    vec3 pc = mix(uLight > 0.5 ? uAccent : vec3(1.0), uAccent, 0.4);
    col = mix(col, pc, vPulse * 0.8);
    glow *= 1.0 + vPulse;
    if (uLight < 0.5) col *= 1.0 + vPulse;
  }
  float core = smoothstep(0.4, 0.0, d);
  col += (1.0 - uLight) * core * 0.3;
  float a = glow * (0.95 - 0.3 * d) * (vType > 0.5 ? 0.9 : 1.0);
  gl_FragColor = vec4(col, a);
}`;

const EDGE_VERT = `${PULSE_GLSL}
attribute vec3 startPoint;
attribute vec3 endPoint;
attribute float strength;
attribute float pathIndex;
attribute vec3 edgeColor;
varying vec3 vColor;
varying float vStrength;
varying float vPulse;
varying float vPath;
void main() {
  float t = position.x;
  vPath = t;
  vec3 dir = endPoint - startPoint;
  vec3 perp = cross(normalize(dir), vec3(0.0, 1.0, 0.0));
  if (length(perp) < 0.1) perp = vec3(1.0, 0.0, 0.0);
  perp = normalize(perp);
  vec3 mid = mix(startPoint, endPoint, 0.5) + perp * sin(t * 3.14159) * 0.15;
  vec3 p = mix(mix(startPoint, mid, t), mix(mid, endPoint, t), t);
  p += perp * sin(uTime * 0.5 + pathIndex * 1.3 + t * 4.0) * 0.12;
  vec3 wp = (modelMatrix * vec4(p, 1.0)).xyz;
  vPulse = totalPulse(wp);
  vColor = edgeColor;
  vStrength = strength;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
}`;

const EDGE_FRAG = `
uniform float uTime;
uniform vec3 uAccent;
uniform float uLineAlpha;
varying vec3 vColor;
varying float vStrength;
varying float vPulse;
varying float vPath;
void main() {
  float f1 = sin(vPath * 25.0 - uTime * 4.0) * 0.5 + 0.5;
  float f2 = sin(vPath * 15.0 - uTime * 2.5 + 1.57) * 0.5 + 0.5;
  float flow = (f1 + f2 * 0.5) / 1.5;
  vec3 col = vColor * (0.8 + 0.2 * sin(uTime * 0.6 + vPath * 12.0));
  float fi = 0.4 * flow * vStrength;
  if (vPulse > 0.0) {
    col = mix(col, uAccent * 1.2, vPulse * 0.7);
    fi += vPulse * 0.8;
  }
  col *= 0.7 + fi + vStrength * 0.5;
  float a = (0.7 * vStrength + flow * 0.3) * uLineAlpha;
  a = mix(a, min(1.0, a * 2.5), vPulse);
  gl_FragColor = vec4(col, a);
}`;

export default function NeuralNetworkBackground() {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;

   const gl =
      canvas.getContext("webgl2", { alpha: true, antialias: true, powerPreference: "high-performance" }) ||
      canvas.getContext("webgl", { alpha: true, antialias: true, powerPreference: "high-performance" });
    if (!gl) {
      console.warn("WebGL is not available, so the neural network background is skipped.");
      return;
    }

    const renderer = new THREE.WebGLRenderer({ canvas, context: gl, alpha: true, antialias: true });
    renderer.setClearColor(0x000000, 0);

    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coarse = matchMedia("(pointer: coarse)").matches || window.innerWidth < 700;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 300);
    const group = new THREE.Group();
    group.scale.setScalar(SCALE);
    scene.add(group);

    const far = new THREE.Vector3(1e3, 1e3, 1e3);
    const uniforms = {
      uTime: { value: 0 },
      uPulsePos: { value: [far.clone(), far.clone(), far.clone()] },
      uPulseTimes: { value: [-1e3, -1e3, -1e3] },
      uPulseSpeed: { value: PULSE_SPEED },
      uBaseNodeSize: { value: 0.35 },
      uSizeScale: { value: 1 },
      uLight: { value: 0 },
      uAccent: { value: new THREE.Color() },
      uLineAlpha: { value: 0.5 },
    };

    const graph = generateGraph(coarse ? 0.6 : 1);
    let nodesMesh = null;
    let edgesMesh = null;
    const isLight = () => document.documentElement.dataset.theme === "light";
    // ShaderMaterial skips output color conversion, so store raw hex components.
    const hex = (h) => new THREE.Color().setHex(h, THREE.LinearSRGBColorSpace);
    const jitter = (c) =>
      c.clone().offsetHSL(
        THREE.MathUtils.randFloatSpread(0.03),
        THREE.MathUtils.randFloatSpread(0.08),
        THREE.MathUtils.randFloatSpread(0.08)
      );

    function build() {
      [nodesMesh, edgesMesh].forEach((m) => {
        if (!m) return;
        group.remove(m);
        m.geometry.dispose();
        m.material.dispose();
      });

      const light = isLight();
      const palette = (light ? PALETTES.light : PALETTES.dark).map(hex);
      uniforms.uLight.value = light ? 1 : 0;
      uniforms.uAccent.value.copy(hex(light ? 0xe20074 : 0xff4da6));
      uniforms.uLineAlpha.value = light ? 0.55 : 0.5;
      const blending = light ? THREE.NormalBlending : THREE.AdditiveBlending;
      const { nodes, edges } = graph;

      // Nodes
      const pos = [], type = [], size = [], col = [], dist = [];
      nodes.forEach((n) => {
        pos.push(n.pos.x, n.pos.y, n.pos.z);
        type.push(n.leaf);
        size.push(n.size);
        dist.push(n.dist);
        const c = jitter(palette[Math.min(n.level, palette.length - 1)]);
        col.push(c.r, c.g, c.b);
      });
      const ng = new THREE.BufferGeometry();
      ng.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
      ng.setAttribute("nodeType", new THREE.Float32BufferAttribute(type, 1));
      ng.setAttribute("nodeSize", new THREE.Float32BufferAttribute(size, 1));
      ng.setAttribute("nodeColor", new THREE.Float32BufferAttribute(col, 3));
      ng.setAttribute("distanceFromRoot", new THREE.Float32BufferAttribute(dist, 1));
      nodesMesh = new THREE.Points(
        ng,
        new THREE.ShaderMaterial({
          uniforms, vertexShader: NODE_VERT, fragmentShader: NODE_FRAG,
          transparent: true, depthWrite: false, blending,
        })
      );
      nodesMesh.frustumCulled = false;

      // Edges: 20 vertices per edge, drawn as pairs, which gives the dashed look
      const ePos = [], eStart = [], eEnd = [], eStr = [], eCol = [], ePath = [];
      let pi = 0;
      edges.forEach((strength, key) => {
        const [a, b] = key.split("-").map(Number);
        const A = nodes[a], B = nodes[b];
        const c = jitter(palette[Math.min(Math.floor((A.level + B.level) / 2), palette.length - 1)]);
        for (let i = 0; i < 20; i++) {
          ePos.push(i / 19, 0, 0);
          eStart.push(A.pos.x, A.pos.y, A.pos.z);
          eEnd.push(B.pos.x, B.pos.y, B.pos.z);
          eStr.push(strength);
          eCol.push(c.r, c.g, c.b);
          ePath.push(pi);
        }
        pi++;
      });
      const eg = new THREE.BufferGeometry();
      eg.setAttribute("position", new THREE.Float32BufferAttribute(ePos, 3));
      eg.setAttribute("startPoint", new THREE.Float32BufferAttribute(eStart, 3));
      eg.setAttribute("endPoint", new THREE.Float32BufferAttribute(eEnd, 3));
      eg.setAttribute("strength", new THREE.Float32BufferAttribute(eStr, 1));
      eg.setAttribute("edgeColor", new THREE.Float32BufferAttribute(eCol, 3));
      eg.setAttribute("pathIndex", new THREE.Float32BufferAttribute(ePath, 1));
      edgesMesh = new THREE.LineSegments(
        eg,
        new THREE.ShaderMaterial({
          uniforms, vertexShader: EDGE_VERT, fragmentShader: EDGE_FRAG,
          transparent: true, depthWrite: false, blending,
        })
      );
      edgesMesh.frustumCulled = false;

      group.add(edgesMesh, nodesMesh);
    }

    function resize() {
      const w = canvas.clientWidth, h = canvas.clientHeight;
      if (!w || !h) return;
      const dpr = Math.min(window.devicePixelRatio || 1, coarse ? 1.5 : 2);
      renderer.setPixelRatio(dpr);
      renderer.setSize(w, h, false);
      const aspect = w / h;
      camera.aspect = aspect;
      camera.position.set(0, 0, 46 * Math.max(1, 0.95 / aspect)); // pull back on portrait screens
      const shift = w >= 1000 ? w * SHIFT : 0;
      camera.setViewOffset(w, h, -shift, 0, w, h); // slides the image right without moving the camera
      uniforms.uSizeScale.value = dpr * (h / 900);
      if (reduce) renderer.render(scene, camera);
    }

    // Pulses
    const ray = new THREE.Raycaster();
    const plane = new THREE.Plane();
    const hit = new THREE.Vector3();
    const dirv = new THREE.Vector3();
    const origin = new THREE.Vector3();
    let pulseI = 0;
    let t = 0;

    function pulse(cx, cy) {
      const r = canvas.getBoundingClientRect();
      ray.setFromCamera(
        new THREE.Vector2(((cx - r.left) / r.width) * 2 - 1, -((cy - r.top) / r.height) * 2 + 1),
        camera
      );
      camera.getWorldDirection(dirv);
      plane.setFromNormalAndCoplanarPoint(dirv, origin);
      if (ray.ray.intersectPlane(plane, hit)) {
        pulseI = (pulseI + 1) % 3;
        uniforms.uPulsePos.value[pulseI].copy(hit);
        uniforms.uPulseTimes.value[pulseI] = t;
        if (reduce) renderer.render(scene, camera);
      }
    }

    const hero = canvas.parentElement;
    const onDown = (e) => {
      if (e.target.closest("a, button, input, select, textarea, [role='button']")) return;
      pulse(e.clientX, e.clientY);
    };

    let px = 0, py = 0, tx = 0, ty = 0;
    const onMove = (e) => {
      tx = (e.clientX / window.innerWidth - 0.5) * 2;
      ty = (e.clientY / window.innerHeight - 0.5) * 2;
    };

    // Loop (paused off-screen, static for reduced motion)
    let raf = 0, last = 0, spin = 0;
    function frame(now) {
      raf = requestAnimationFrame(frame);
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      t += dt;
      uniforms.uTime.value = t;
      spin += dt * 0.05;
      px += (tx * 0.35 - px) * 0.04;
      py += (ty * 0.2 - py) * 0.04;
      group.rotation.y = spin + px;
      group.rotation.x = py;
      renderer.render(scene, camera);
    }
    const start = () => {
      if (raf || reduce) return;
      last = performance.now();
      raf = requestAnimationFrame(frame);
    };
    const stop = () => {
      cancelAnimationFrame(raf);
      raf = 0;
    };

    build();
    resize();
    if (reduce) renderer.render(scene, camera);

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? start() : stop()));
    io.observe(canvas);
    const mo = new MutationObserver(() => {
      build();
      if (reduce) renderer.render(scene, camera);
    });
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

    hero?.addEventListener("pointerdown", onDown);
    if (!coarse) window.addEventListener("pointermove", onMove, { passive: true });

    return () => {
      stop();
      ro.disconnect();
      io.disconnect();
      mo.disconnect();
      hero?.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      [nodesMesh, edgesMesh].forEach((m) => {
        if (!m) return;
        m.geometry.dispose();
        m.material.dispose();
      });
        renderer.dispose();
    };
  }, []);

  return <canvas ref={ref} className="nn" aria-hidden="true" />;
}