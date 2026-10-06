---
name: animated-gradient-mesh
description: Live animated mesh-gradient backgrounds (Stripe-style flowing gradient) with a self-contained WebGL shader, plus CSS-only blurred-blob and conic alternatives and ShaderGradient. Use for soft, colorful, always-moving hero/section backgrounds.
---

# Animated gradient mesh backgrounds

## A. Self-contained WebGL flowing gradient (no deps, ~2KB)
Domain-warped noise mixing 4 brand colors — the Stripe/Linear look.
```html
<canvas id="gradient"></canvas>
<style>#gradient{position:fixed;inset:0;width:100%;height:100%;z-index:-1}</style>
<script type="module">
const canvas = document.getElementById('gradient')
const gl = canvas.getContext('webgl', { antialias: false, premultipliedAlpha: false })
const vs = `attribute vec2 p; void main(){ gl_Position = vec4(p, 0.0, 1.0); }`
const fs = `precision highp float;
uniform vec2 uRes; uniform float uTime; uniform vec2 uMouse;
uniform vec3 c1, c2, c3, c4;
// 2D simplex noise — Ashima Arts (MIT), see glsl-noise-library/resources/noise2D.glsl
vec3 mod289(vec3 x){return x-floor(x*(1./289.))*289.;} vec2 mod289(vec2 x){return x-floor(x*(1./289.))*289.;}
vec3 permute(vec3 x){return mod289(((x*34.)+10.)*x);}
float snoise(vec2 v){const vec4 C=vec4(.211324865405187,.366025403784439,-.577350269189626,.024390243902439);
vec2 i=floor(v+dot(v,C.yy));vec2 x0=v-i+dot(i,C.xx);vec2 i1=(x0.x>x0.y)?vec2(1.,0.):vec2(0.,1.);
vec4 x12=x0.xyxy+C.xxzz;x12.xy-=i1;i=mod289(i);vec3 p=permute(permute(i.y+vec3(0.,i1.y,1.))+i.x+vec3(0.,i1.x,1.));
vec3 m=max(.5-vec3(dot(x0,x0),dot(x12.xy,x12.xy),dot(x12.zw,x12.zw)),0.);m=m*m;m=m*m;
vec3 x=2.*fract(p*C.www)-1.;vec3 h=abs(x)-.5;vec3 ox=floor(x+.5);vec3 a0=x-ox;
m*=1.79284291400159-.85373472095314*(a0*a0+h*h);vec3 g;g.x=a0.x*x0.x+h.x*x0.y;g.yz=a0.yz*x12.xz+h.yz*x12.yw;return 130.*dot(m,g);}
void main(){
  vec2 uv = gl_FragCoord.xy / uRes; vec2 p = uv; p.x *= uRes.x / uRes.y;
  float t = uTime * 0.06;
  vec2 q = vec2(snoise(p * 0.55 + t), snoise(p * 0.55 - t + 3.1));
  vec2 r = vec2(snoise(p * 0.7 + q * 1.1 + t * 1.3 + uMouse * 0.3), snoise(p * 0.7 + q * 1.1 - t + 7.3));
  float n1 = smoothstep(-0.6, 0.6, r.x), n2 = smoothstep(-0.6, 0.6, r.y);
  vec3 col = mix(mix(c1, c2, n1), mix(c3, c4, n1), n2);
  col += (fract(sin(dot(gl_FragCoord.xy, vec2(12.9898,78.233))) * 43758.5453) - 0.5) * 0.04; // dither/grain
  gl_FragColor = vec4(col, 1.0);
}`
const sh = (t, s) => { const o = gl.createShader(t); gl.shaderSource(o, s); gl.compileShader(o); if (!gl.getShaderParameter(o, gl.COMPILE_STATUS)) console.error(gl.getShaderInfoLog(o)); return o }
const prog = gl.createProgram(); gl.attachShader(prog, sh(gl.VERTEX_SHADER, vs)); gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, fs)); gl.linkProgram(prog); gl.useProgram(prog)
gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer()); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 3,-1, -1,3]), gl.STATIC_DRAW)
const loc = gl.getAttribLocation(prog, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)
const U = (n) => gl.getUniformLocation(prog, n)
const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255)
;[['c1', '#0d0b1f'], ['c2', '#5b2bff'], ['c3', '#ff6ad5'], ['c4', '#ffb86b']].forEach(([n, h]) => gl.uniform3fv(U(n), hex(h)))
const mouse = [0, 0], m = [0, 0]
addEventListener('pointermove', (e) => { mouse[0] = e.clientX / innerWidth - 0.5; mouse[1] = 0.5 - e.clientY / innerHeight })
function resize() { const d = Math.min(devicePixelRatio, 1.5) * 0.5; canvas.width = innerWidth * d; canvas.height = innerHeight * d; gl.viewport(0, 0, canvas.width, canvas.height); gl.uniform2f(U('uRes'), canvas.width, canvas.height) }
addEventListener('resize', resize); resize()
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
;(function loop(t) { m[0] += (mouse[0] - m[0]) * 0.03; m[1] += (mouse[1] - m[1]) * 0.03
  gl.uniform1f(U('uTime'), reduce ? 10 : t / 1000); gl.uniform2f(U('uMouse'), m[0], m[1]); gl.drawArrays(gl.TRIANGLES, 0, 3); requestAnimationFrame(loop) })(0)
</script>
```
Rendering at half resolution (`* 0.5`) is invisible for soft gradients and saves 75% fill-rate.

## B. CSS-only blurred blobs (cheapest)
```css
.bg { position: fixed; inset: 0; z-index: -1; overflow: hidden; background: #0d0b1f; filter: blur(80px) saturate(140%); }
.bg i { position: absolute; width: 50vmax; aspect-ratio: 1; border-radius: 50%; mix-blend-mode: screen; opacity: .8; animation: drift 22s ease-in-out infinite alternate; }
.bg i:nth-child(1){ background:#5b2bff; top:-10%; left:-10% }
.bg i:nth-child(2){ background:#ff6ad5; bottom:-20%; right:-10%; animation-duration: 28s }
.bg i:nth-child(3){ background:#ffb86b; top:30%; left:40%; animation-duration: 34s }
@keyframes drift { to { transform: translate(15vw, 10vh) scale(1.3) rotate(40deg) } }
```

## C. Animated conic/aurora with @property
```css
@property --a { syntax: '<angle>'; inherits: false; initial-value: 0deg; }
.aurora { background: conic-gradient(from var(--a) at 50% 60%, #5b2bff, #ff6ad5, #2de2e6, #5b2bff); filter: blur(60px); animation: spin 18s linear infinite; }
@keyframes spin { to { --a: 360deg } }
```

## D. Libraries
- ShaderGradient (https://github.com/ruucm/shadergradient, MIT): `<ShaderGradientCanvas><ShaderGradient type="waterPlane" color1="#5b2bff" color2="#ff6ad5" color3="#ffb86b" uSpeed={0.2} /></ShaderGradientCanvas>` — 3D gradient planes/spheres with presets from shadergradient.co.
- Scroll-reactive: tween `c1..c4` uniforms per section with ScrollTrigger for color storytelling.
