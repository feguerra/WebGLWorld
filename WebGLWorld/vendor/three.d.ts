// Declaracion de tipos en Threejs, MUY simple.

declare var THREE: ThreeModule;

interface ThreeModule {
	//Cameras

	Camera(...params: any[]): any;
	OrthographicCamera(...params: any[]): any;
	PerspectiveCamera(...params: any[]): any;

	//Core

	Clock(...params: any[]): any;
	Color(...params: any[]): any;
	Face3(...params: any[]): any;
	Face4(...params: any[]): any;
	Frustum(...params: any[]): any;
	Geometry(...params: any[]): any;
	Math(...params: any[]): any;
	Matrix3(...params: any[]): any;
	Matrix4(...params: any[]): any;
	Object3D(...params: any[]): any;
	Projector(...params: any[]): any;
	Quaternion(...params: any[]): any;
	Ray(...params: any[]): any;
	Rectangle(...params: any[]): any;
	Spline(...params: any[]): any;
	UV(...params: any[]): any;
	Vector2(...params: any[]): any;
	Vector3(...params: any[]): any;
	Vector4(...params: any[]): any;

	//Lights

	Light(...params: any[]): any;
	AmbientLight(...params: any[]): any;
	DirectionalLight(...params: any[]): any;
	PointLight(...params: any[]): any;
	SpotLight(...params: any[]): any;

	//Loaders

	Loader(...params: any[]): any;
	BinaryLoader(...params: any[]): any;
	GeometryLoader(...params: any[]): any;
	ImageLoader(...params: any[]): any;
	JSONLoader(...params: any[]): any;
	LoadingMonitor(...params: any[]): any;
	SceneLoader(...params: any[]): any;
	TextureLoader(...params: any[]): any;

	//Materials

	Material(...params: any[]): any;
	LineBasicMaterial(...params: any[]): any;
	MeshBasicMaterial(...params: any[]): any;
	MeshDepthMaterial(...params: any[]): any;
	MeshFaceMaterial(...params: any[]): any;
	MeshLambertMaterial(...params: any[]): any;
	MeshNormalMaterial(...params: any[]): any;
	MeshPhongMaterial(...params: any[]): any;
	ParticleBasicMaterial(...params: any[]): any;
	ParticleCanvasMaterial(...params: any[]): any;
	ParticleDOMMaterial(...params: any[]): any;
	ShaderMaterial(...params: any[]): any;

	//Objects

	Bone(...params: any[]): any;
	Line(...params: any[]): any;
	LOD(...params: any[]): any;
	Mesh(...params: any[]): any;
	MorphAnimMesh(...params: any[]): any;
	Particle(...params: any[]): any;
	ParticleSystem(...params: any[]): any;
	Ribbon(...params: any[]): any;
	SkinnedMesh(...params: any[]): any;
	Sprite(...params: any[]): any;

	//Renderers

	CanvasRenderer(...params: any[]): any;
	DOMRenderer(...params: any[]): any;
	SVGRenderer(...params: any[]): any;
	WebGLRenderer(...params: any[]): any;
	WebGLRenderTarget(...params: any[]): any;
	WebGLRenderTargetCube(...params: any[]): any;
	WebGLShaders(...params: any[]): any;

	//Renderers / Renderables

	RenderableFace3(...params: any[]): any;
	RenderableFace4(...params: any[]): any;
	RenderableLine(...params: any[]): any;
	RenderableObject(...params: any[]): any;
	RenderableParticle(...params: any[]): any;
	RenderableVertex(...params: any[]): any;

	//Scenes

	Fog(...params: any[]): any;
	FogExp2(...params: any[]): any;
	Scene(...params: any[]): any;

	//Textures

	DataTexture(...params: any[]): any;
	Texture(...params: any[]): any;

	//Extras

	ColorUtils(...params: any[]): any;
	GeometryUtils(...params: any[]): any;
	ImageUtils(...params: any[]): any;
	SceneUtils(...params: any[]): any;
	ShaderUtils(...params: any[]): any;

	//Extras / Animation

	Animation(...params: any[]): any;
	AnimationHandler(...params: any[]): any;
	AnimationMorphTarget(...params: any[]): any;
	KeyFrameAnimation(...params: any[]): any;

	//Extras / Cameras

	CombinedCamera(...params: any[]): any;
	CubeCamera(...params: any[]): any;

	//Extras / Controls

	FirstPersonControls(...params: any[]): any;
	FlyControls(...params: any[]): any;
	PathControls(...params: any[]): any;
	RollControls(...params: any[]): any;
	TrackballControls(...params: any[]): any;

	//Extras / Core

	BufferGeometry(...params: any[]): any;
	Curve(...params: any[]): any;
	CurvePath(...params: any[]): any;
	EventTarget(...params: any[]): any;
	Gyroscope(...params: any[]): any;
	Path(...params: any[]): any;
	Shape(...params: any[]): any;
	TextPath(...params: any[]): any;

	//Extras / Geometries

	CubeGeometry(...params: any[]): any;
	CylinderGeometry(...params: any[]): any;
	ExtrudeGeometry(...params: any[]): any;
	IcosahedronGeometry(...params: any[]): any;
	LatheGeometry(...params: any[]): any;
	OctahedronGeometry(...params: any[]): any;
	PlaneGeometry(...params: any[]): any;
	PolyhedronGeometry(...params: any[]): any;
	SphereGeometry(...params: any[]): any;
	TetrahedronGeometry(...params: any[]): any;
	TextGeometry(...params: any[]): any;
	TorusGeometry(...params: any[]): any;
	TorusKnotGeometry(...params: any[]): any;

	//Extras / Helpers

	AxisHelper(...params: any[]): any;
	CameraHelper(...params: any[]): any;

	//Extras / Modifiers

	SubdivisionModifier(...params: any[]): any;

	//Extras / Objects

	LensFlare(...params: any[]): any;
	MarchingCubes(...params: any[]): any;

	//Extras / Renderers / Effects

	AnaglyphEffect(...params: any[]): any;
	CrosseyedEffect(...params: any[]): any;
	ParallaxBarrierEffect(...params: any[]): any;
	StereoEffect(...params: any[]): any;

	//Extras / Renderers / Plugins

	LensFlarePlugin(...params: any[]): any;
	ShadowMapPlugin(...params: any[]): any;
	SpritePlugin(...params: any[]): any;

	//Extras / Shaders

	ShaderFlares(...params: any[]): any;
	ShaderSprite(...params: any[]): any;

    // no documentado
    FlatShading(...params: any[]): any;
    ColladaLoader(...params: any[]): any;
}