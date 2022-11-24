#define GLSLIFY 1
precision highp float;
varying vec2 vTextureCoord;
uniform sampler2D uSampler;
uniform float value;
const float epsilon = 0.000001;
const float mx = 1.0 - epsilon;
const mat3 matRGBtoROMM = mat3(0.5293459296226501, 0.3300727903842926, 0.14058130979537964, 0.09837432950735092, 0.8734610080718994, 0.028164653107523918, 0.01688321679830551, 0.11767247319221497, 0.8654443025588989);
const mat3 matROMMtoRGB = mat3(2.0340757369995117, -0.727334201335907, -0.3067416846752167, -0.22881317138671875, 1.2317301034927368, -0.0029169507324695587, -0.008569774217903614, -0.1532866358757019, 1.1618564128875732);
float ramp(in float t){
    t *= 2.0;
    if (t >= 1.0) {
        t -= 1.0;
        t = log(0.5) / log(0.5*(1.0-t) + 0.9332*t);
    }
    return clamp(t, 0.001, 10.0);
}
vec3 rgb2hsv(in vec3 c) {
    vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
    vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
    vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));
    float d = q.x - min(q.w, q.y);
    float e = 1.0e-10;
    return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
}
vec3 hsv2rgb(in vec3 c) {
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}
vec3 setHue(in vec3 res, in vec3 base) {
    vec3 hsv = rgb2hsv(base);
    vec3 res_hsv = rgb2hsv(res);
    return hsv2rgb(vec3(hsv.x, res_hsv.y, res_hsv.z));
}
void main() {
    lowp vec4 col = texture2D(uSampler, vTextureCoord.xy);
    vec3 base = col.rgb * matRGBtoROMM;
    float a = abs(value) * col.a + epsilon;
    float v = pow(2.0, a*2.0+1.0)-2.0;
    float m = mx - exp(-v);
    vec3 res = (value > 0.0) ? (1.0 - exp(-v*base)) / m : log(1.0-base*m) / -v;
    res = mix(base, res, min(a*100.0, 1.0));
    res = setHue(res, base);
    res = pow(res, vec3(ramp(1.0 - (0.0 * col.a + 1.0) / 2.0)));
    res = res * matROMMtoRGB;
    gl_FragColor = vec4(res, col.a);
}
