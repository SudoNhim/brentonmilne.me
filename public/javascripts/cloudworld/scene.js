var scene, camera, renderer, clock, skyboxUniforms;
var geometry, material, mesh;
var islandHeightMap, islandHeightMapTarget, heightMapScene, heightMapRenderer, heightMapUniforms, gridRes;
var islandGeo, islandMat, islandMesh, islandUniforms;

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


function init(parent) {
	scene = new THREE.Scene();
	
	clock = new THREE.Clock(true);
	
	var width = parent.clientWidth;
	var height = parent.clientHeight;
	
	camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 10000);
	
	// BEGIN SKY/WATER ///////////////////////////////////////////////////////////////

	geometry = new THREE.BoxGeometry(10000, 5000, 10000);
	geometry.applyMatrix(new THREE.Matrix4().makeTranslation(0, 2500, 0));
	
	// Generate noise texture
	var noiseSize = 256;
	var size = noiseSize * noiseSize;
	var data = new Uint8Array(4 * size);
	for (var i = 0; i < size * 4; i++) {
		data[ i ] = Math.random() * 255 | 0;
	}
	var noiseTex = new THREE.DataTexture(data, noiseSize, noiseSize, THREE.RGBAFormat);
	noiseTex.wrapS = THREE.RepeatWrapping;
	noiseTex.wrapT = THREE.RepeatWrapping;
	noiseTex.minFilter = THREE.LinearFilter;
	noiseTex.magFilter = THREE.LinearFilter;
	noiseTex.needsUpdate = true;
	
	// Load skybox texture
	var skyboxTex = THREE.ImageUtils.loadTexture("images/cloudworld/skydome.jpg");
	skyboxTex.generateMipmaps = false;
	skyboxTex.magFilter = THREE.LinearFilter;
	skyboxTex.minFilter = THREE.LinearFilter;
	
	// Set uniforms for the skybox and ocean shader
	skyboxUniforms = {
		resolution : { type : "v2", value : new THREE.Vector2(width, height) },
		skydome: { type: "t", value: skyboxTex },
		noise256: { type: "t", value: noiseTex },
		time : { type: "f", value: 1.0 }
	};
	
	// Create Material to use for skybox and ocean
	material = new THREE.ShaderMaterial({
		uniforms: skyboxUniforms,
		vertexShader : document.getElementById('skybox-shader-vs').innerHTML,
		fragmentShader : document.getElementById('skybox-shader-fs').innerHTML,
	});
	
	mesh = new THREE.Mesh(geometry, material);
	mesh.material.side = THREE.BackSide;
	scene.add(mesh);
	
	// END SKY/WATER //////////////////////////////////////////////////////////////
	
	// BEGIN HEIGHTMAP ////////////////////////////////////////////////////////////

	gridRes = 64;
	var heightMap = new Uint8Array(4 * gridRes * gridRes);
	islandHeightMap = new THREE.DataTexture(heightMap, gridRes, gridRes, THREE.RGBAFormat);
	islandHeightMap.needsUpdate = true;
	
	var rTOptions = {
		minFilter: THREE.NearestFilter,
		magFilter: THREE.NearestFilter,
		depthBuffer: false,
		stencilBuffer: false,
		generateMipMaps: false
	};
	islandHeightMapTarget = new THREE.WebGLRenderTarget(gridRes, gridRes, rTOptions);
	
	heightMapUniforms = {
		heightMap: { type: 't', value: islandHeightMap },
		time: { type: 'f', value: 1.0 },
		timeDelta: { type: 'f', value: 0.0 }
	};
	
	var heightMapGeo = new THREE.PlaneGeometry(20.0, 20.0);
	var heightMapMaterial = new THREE.ShaderMaterial({
		uniforms: heightMapUniforms,
		vertexShader: document.getElementById('heightmap-shader-vs').innerHTML,
		fragmentShader: document.getElementById('heightmap-shader-fs').innerHTML
	});
	
	heightMapCamera = new THREE.OrthographicCamera(-1.0, 1.0, -1.0, 1.0, -1000.0, 1000.0);
	heightMapScene = new THREE.Scene();
	var heightMapMesh = new THREE.Mesh(heightMapGeo, heightMapMaterial);
	heightMapMesh.material.side = THREE.BackSide;
	heightMapScene.add(heightMapMesh);
	
	
	
	// END HEIGHTMAP //////////////////////////////////////////////////////////////

	// BEGIN ISLAND ///////////////////////////////////////////////////////////////
	
	var islandSize = 1250;
	var islandHeight = 800.0;

	islandGeo = new THREE.PlaneGeometry(islandSize, islandSize, gridRes-1, gridRes-1);
	islandGeo.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI / 2));
	
	islandUniforms = {
		cellSize: { type: "f", value: islandSize / gridRes },
		noise256: { type: "t", value: noiseTex },
		islandSize: { type: "f", value: islandSize },
		islandHeight: { type: "f", value: islandHeight },
		heightMap: { type: "t", value: islandHeightMapTarget },
		time : { type: "f", value: 1.0 }
	};
	
	islandMat = new THREE.ShaderMaterial({
		uniforms: islandUniforms,
		vertexShader : document.getElementById('island-shader-vs').innerHTML,
		fragmentShader : document.getElementById('island-shader-fs').innerHTML,
	});
	
	islandMesh = new THREE.Mesh(islandGeo, islandMat);
	scene.add(islandMesh);
	
	// END ISLAND /////////////////////////////////////////////////////////////////
	
	renderer = new THREE.WebGLRenderer({ antialias: true });
	renderer.setSize(parent.clientWidth, parent.clientHeight);
	
	parent.appendChild(renderer.domElement);
}

var camElevation = 60.0;
var camRotZ = 0.0;

var prevTime = 0.0;

function animate() {
	requestAnimationFrame(animate);

	if (mouseDown) {
		camElevation += (mouseY - py) / 40;
		camRotZ -= (mouseX - px) / 4000;
	}
	
	if (camElevation < 10.0) camElevation = 10.0;
	if (camElevation > 5000.0) camElevation = 5000.0;
	
	camera.position.x = Math.sin(camRotZ) * 1000.0;
	camera.position.z = Math.cos(camRotZ) * 1000.0;
	camera.position.y = camElevation;
	
	camera.up = new THREE.Vector3(0, 1, 0);
	camera.lookAt(new THREE.Vector3(0,0,0));
	
	var newTime = clock.getElapsedTime();
	skyboxUniforms.time.value = newTime;
	islandUniforms.time.value = newTime;
	heightMapUniforms.time.value = newTime;
	heightMapUniforms.timeDelta.value = newTime - prevTime;
	prevTime = newTime;
	
	renderer.clear();
	
	// Render the heightmap
	renderer.render(heightMapScene, heightMapCamera, islandHeightMapTarget, true);
	
	// Read back the result
	var gl = renderer.getContext();
	gl.readPixels(0, 0, gridRes, gridRes, gl.RGBA, gl.UNSIGNED_BYTE, islandHeightMap.image.data);
	islandHeightMap.needsUpdate = true;
	
	// Render the scene
	renderer.render(scene, camera);
}

function makeScene(parent) {
	init(parent);
	camera.position.y += 100;
	animate();
}