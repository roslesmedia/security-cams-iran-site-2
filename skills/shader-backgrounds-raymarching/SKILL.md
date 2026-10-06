---
name: shader-backgrounds-raymarching
description: Fullscreen fragment-shader backgrounds — raymarched SDF blobs/metaballs, infinite tunnels, aurora, liquid chrome, plasma, grid/synthwave — rendered on a single quad with mouse/scroll uniforms. Use when a site needs a unique generative live background (Shadertoy-style) running behind content.
---

# Fullscreen shader backgrounds (Shadertoy-style)

Run any fragment shader on one fullscreen triangle. Reuse the minimal WebGL harness from `animated-gradient-mesh` (section A) or three.js:

```js
const mat = new THREE.ShaderMaterial({
  uniforms: { uTime: { value: 0 }, uRes: { value: new THREE.Vector2() }, uMouse: { value: new THREE.Vector2() }, uScroll: { value: 0 } },
  vertexShader: `void main(){ gl_Position = vec4(position.xy, 0.0, 1.0); }`,
  fragmentShader: FRAG, depthWrite: false, depthTest: false,
})
const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat); quad.frustumCulled = false
scene.add(quad)  // orthographic or any camera — vertex shader ignores it
```
Porting from Shadertoy: `iTime→uTime`, `iResolution.xy→uRes`, `fragCoord→gl_FragCoord.xy`, `fragColor→gl_FragColor`, `mainImage(...)→main()`. **Check each Shadertoy's license** — default is CC BY-NC-SA (non-commercial!). The shaders below are original and free to use.

## 1. Raymarched metaballs (liquid blobs, mouse-attracted)
```glsl
precision highp float;
uniform float uTime; uniform vec2 uRes, uMouse; uniform float uScroll;
float smin(float a, float b, float k){ float h = clamp(.5 + .5*(b-a)/k, 0., 1.); return mix(b, a, h) - k*h*(1.-h); }
float map(vec3 p){
  float d = length(p - vec3(uMouse * 2.0, 0.)) - .55;
  for (int i = 0; i < 5; i++) {
    float fi = float(i);
    vec3 c = vec3(sin(uTime*.4 + fi*1.7)*1.4, cos(uTime*.3 + fi*2.1)*.9, sin(uTime*.5 + fi)*.5);
    d = smin(d, length(p - c) - (.35 + .1*fi), .6);
  }
  return d;
}
vec3 normal(vec3 p){ vec2 e = vec2(.001, 0.); return normalize(vec3(map(p+e.xyy)-map(p-e.xyy), map(p+e.yxy)-map(p-e.yxy), map(p+e.yyx)-map(p-e.yyx))); }
void main(){
  vec2 uv = (gl_FragCoord.xy - .5*uRes) / uRes.y;
  vec3 ro = vec3(0., 0., 4.), rd = normalize(vec3(uv, -1.6));
  float t = 0.; bool hit = false;
  for (int i = 0; i < 64; i++) { float d = map(ro + rd*t); if (d < .001) { hit = true; break; } t += d; if (t > 10.) break; }
  vec3 col = vec3(.03, .02, .06) + .05 * uv.y;
  if (hit) {
    vec3 p = ro + rd*t, n = normal(p);
    float fres = pow(1. - max(dot(n, -rd), 0.), 3.);
    vec3 base = .5 + .5*cos(6.2831*(vec3(.0,.33,.67) + n.y*.3 + uTime*.05 + uScroll*.0005)); // iridescent
    col = base * (.3 + .7*max(dot(n, normalize(vec3(.5,.8,.6))), 0.)) + fres*.8;
  }
  gl_FragColor = vec4(pow(col, vec3(.4545)), 1.);
}
```

## 2. Synthwave perspective grid
```glsl
void main(){
  vec2 uv = (gl_FragCoord.xy - .5*uRes) / uRes.y;
  vec3 col = mix(vec3(.05,0.,.1), vec3(.6,.1,.5), smoothstep(-.1,.5,uv.y));
  if (uv.y < 0.) {
    vec2 g = vec2(uv.x / -uv.y, 1. / -uv.y + uTime * 2.);
    vec2 f = abs(fract(g) - .5);
    float line = smoothstep(.02 / -uv.y * 0.5, 0., min(f.x, f.y) * .1);
    col = mix(vec3(.02,0.,.05), vec3(1.,.2,.8), line) * smoothstep(-1., -.02, uv.y) + vec3(.6,.1,.5)*exp(uv.y*15.);
  }
  float sun = smoothstep(.2, .19, length(uv - vec2(0., .2))) * step(.0, sin((uv.y-.2)*80.) + uv.y*4.);
  col += sun * mix(vec3(1.,.8,.2), vec3(1.,.2,.6), smoothstep(.4,.0,uv.y));
  gl_FragColor = vec4(col, 1.);
}
```

## 3. Aurora curtains
```glsl
// needs snoise (glsl-noise-library)
void main(){
  vec2 uv = gl_FragCoord.xy / uRes;
  float n = 0.;
  for (float i = 1.; i < 4.; i++) n += snoise(vec2(uv.x * 2. * i + uTime * .05 * i, uTime * .1)) / i;
  float band = exp(-pow((uv.y - .6 - n * .15) * 6., 2.));
  vec3 col = mix(vec3(.1,.9,.6), vec3(.5,.2,1.), uv.x + n*.3) * band * 1.5 + vec3(.01,.02,.05);
  gl_FragColor = vec4(col, 1.);
}
```

## Perf rules
- Render raymarchers at 0.5x resolution into a render target, upscale (soft content hides it).
- Cap loop iterations (≤64) and use early exits.
- Pause when hero scrolls out of view; drive a `uScroll` uniform for scroll-reactive color/camera.
