import { OrbitControls } from "orbitControls";
import * as THREE from "three";
import { OBJLoader } from "fbxLoader";
import { MeshBasicMaterial } from "three";
import { Color } from "three";


const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 30000 );



const renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setClearColor(new THREE.Color("white"));

document.body.appendChild( renderer.domElement );

const directionalLight = new THREE.DirectionalLight( new THREE.Color( 'white' ), 1 );
const directionalLight2 = new THREE.DirectionalLight( new THREE.Color( 'white' ), 1 );

directionalLight.position.set(5, 5, 5);
directionalLight2.position.set(-5, -5, -5);

scene.add( directionalLight );
scene.add( directionalLight2 );


function createSkyboxStrings() {
    const basePath = "../skybox/";
    const fileType = ".png";
    const sides = ["Right", "Left", "Top", "Bottom", "Front", "Back"];
    const pathStrings = sides.map(side => {
        return basePath + side + fileType;
    });
    
    return pathStrings;
}

function createSkyboxMaterial() {
    const skyboxImagePaths = createSkyboxStrings();

    const materialArray = skyboxImagePaths.map(image => {
        let texture = new THREE.TextureLoader().load(image);

        return new THREE.MeshBasicMaterial({ map: texture, side: THREE.BackSide });
    });

    return materialArray;
}


const skyboxMaterials = createSkyboxMaterial();
const skyboxGeo = new THREE.BoxGeometry(10000, 10000, 10000);
const skybox = new THREE.Mesh(skyboxGeo, skyboxMaterials);
scene.add(skybox)


const humanColor = new THREE.MeshPhongMaterial( { color: "rgb(122,170,208)" } );


const loader = new OBJLoader();

loader.load(
	// resource URL
	'geir.obj',
	// called when resource is loaded
	function ( object ) {
        object.scale.set(0.25, 0.25, 0.25)
        object.position.set(0, -2, 0);
        
        object.traverse( function ( child ) {
            if ( child instanceof THREE.Mesh ) {
                child.material = humanColor;
                }
            } );

		scene.add( object );

	},
	// called when loading is in progresses
	function ( xhr ) {

		console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );

	},
	// called when loading has errors
	function ( error ) {
        console.log(error);
		console.log( 'An error happened' );

	}
);

new OrbitControls(camera, renderer.domElement)

camera.position.z = 5;

function animate() {
    requestAnimationFrame( animate );


    renderer.render( scene, camera );
    
};

animate();
