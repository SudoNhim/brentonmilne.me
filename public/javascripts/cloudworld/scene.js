var scene, camera, renderer;
var geometry, material, mesh;

var px = window.innerWidth / 2.0, py = window.innerHeight / 2.0; /*SCREEN*/
var mouseX = 0, mouseY = 0, mouseDown = false; /*MOUSE*/
document.addEventListener('mousemove', function (event) {
	mouseX = event.clientX;
	mouseY = event.clientY;
}, false);
document.body.addEventListener("mousedown", function (event) {
	mouseDown = true
	px = event.clientX;
	py = event.clientY;
}, false);
document.body.addEventListener("mouseup", function (event) {
	mouseDown = false
}, false);

var vertexShaderText = [
	"varying vec3 fragPosition;",
	"void main() {",
	"   fragPosition = position / 10000.0;",
	"	fragPosition.y += 100.0 / 10000.0;",
	"	gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);",
	"}"
].join("\n");

var fragmentShaderText = [
	"varying vec3 fragPosition;",
	"uniform sampler2D skydome;",
	"void main() {",
	"	vec2 uv = (fragPosition.xz + 0.5) * 0.5 + 0.25;",
	"	float uvy = (0.5 - abs(fragPosition.y)) * 0.5;",
	"	if (abs(fragPosition.x) > abs(fragPosition.z)) uv.x += uvy * sign(fragPosition.x);",
	"	else uv.y += uvy * sign(fragPosition.z);",
	"	vec3 color = texture2D(skydome, uv).rgb;",
	"	gl_FragColor = vec4(color.rgb, 1.0);",
	"}"
].join("\n");

function init(parent) {
	scene = new THREE.Scene();
	
	var width = parent.clientWidth;
	var height = parent.clientHeight;
	
	camera = new THREE.PerspectiveCamera(90, width / height, 0.1, 10000);
	
	geometry = new THREE.BoxGeometry(10000, 5000, 10000);
	geometry.applyMatrix(new THREE.Matrix4().makeTranslation(0, 2400, 0));
	
	var skyboxTex = THREE.ImageUtils.loadTexture("images/cloudworld/skydome.jpg");
	skyboxTex.generateMipmaps = false;
	skyboxTex.magFilter = THREE.LinearFilter;
	skyboxTex.minFilter = THREE.LinearFilter;
	material = new THREE.ShaderMaterial({
		uniforms: {
			resolution : { type : "v2", value : new THREE.Vector2(width, height) },
			skydome: { type: "t", value: skyboxTex}
		},
		vertexShader : vertexShaderText,
		fragmentShader : fragmentShaderText
	});
	
	mesh = new THREE.Mesh(geometry, material);
	mesh.material.side = THREE.BackSide;
	scene.add(mesh);
	
	renderer = new THREE.WebGLRenderer();
	renderer.setSize(parent.clientWidth, parent.clientHeight);
	
	parent.appendChild(renderer.domElement);
}

function animate() {
	requestAnimationFrame(animate);

	if (mouseDown) {
		mesh.rotation.x += (mouseY - py) / 4000;
		mesh.rotation.y += (mouseX - px) / 4000;
	}

	renderer.render(scene, camera);
}

function makeScene(parent) {
	init(parent);
	animate();
}