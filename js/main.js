import { OrbitControls } from "orbitControls";
import * as THREE from "three";
import { OBJLoader } from "fbxLoader";
import { MeshBasicMaterial } from "three";
import { Color } from "three";
import { DragControls } from "dragControls";
import { CSS3DRenderer, CSS3DObject } from "css3drenderer"

let cards = {};

const card = document.getElementById("card");

const dropdown = document.getElementById("dropdown");
let pointerX;
let pointerY;

let posToSetIndicator;

let objectsToBeRightClickRaycasted = [];
let objectsToBeLeftClickRaycasted = [];

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 30000 );

const renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setSize( window.innerWidth, window.innerHeight );

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
let human;

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
                objectsToBeRightClickRaycasted.push(child);
                }
            } );

        human = object;

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

const draggableCubeGeometry = new THREE.BoxGeometry(0.2,0.2,0.2);
const draggableTexture = new THREE.MeshBasicMaterial({color: "red", transparent: true})
const draggableCube = new THREE.Mesh(draggableCubeGeometry, draggableTexture);
draggableCube.position.set(3,0 ,0)
scene.add(draggableCube);

const orbitControls = new OrbitControls(camera, renderer.domElement)
const controls = new DragControls([ draggableCube ], camera, renderer.domElement);

controls.addEventListener('dragstart', function (event) {
    orbitControls.enabled = false;
    event.object.material.opacity = 0.33;
})

controls.addEventListener('dragend', function (event) {
    orbitControls.enabled = true;
    event.object.material.opacity = 1;
})

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

window.addEventListener( 'pointermove', onPointerMove );
window.requestAnimationFrame(render);

window.addEventListener('mouseup', onPointerClick);


camera.position.z = 5;

function render() {

    requestAnimationFrame( render );

    continuousRaycast();

    renderer.render( scene, camera );

};

function onPointerMove( event ) {

	// calculate pointer position in normalized device coordinates
	// (-1 to +1) for both components

	pointer.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	pointer.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
    
    pointerX = event.clientX;
    pointerY = event.clientY;
}

function onPointerClick( event ) {
    dropdown.style.display = "none";

    if(event.button == 2)
        rightClickRaycast();

    if(event.button == 0)
    {
        leftClickRaycast();
    }
}

let hoveredSpriteObject;
function continuousRaycast()
{
    raycaster.setFromCamera(pointer, camera);
    
    const intersects = raycaster.intersectObjects( objectsToBeLeftClickRaycasted )
    
    if(intersects.length > 0)
    {
        if(hoveredSpriteObject != intersects[0].object)
        {
            hoveredSpriteObject = intersects[0].object
            hoveredSpriteObject.material.opacity = 0.33;
        }
    }
    else
    {
        if(hoveredSpriteObject == selectedSpriteObject) return;

        if(hoveredSpriteObject != null)
        {
            hoveredSpriteObject.material.opacity = 1;
        }
        
        hoveredSpriteObject = null;
    }
}

let selectedSpriteObject;
function leftClickRaycast()
{
    raycaster.setFromCamera(pointer, camera);

    const intersects = raycaster.intersectObjects( objectsToBeLeftClickRaycasted )

    if ( intersects.length > 0 ) {
        if(hoveredSpriteObject != intersects[0].object)
        {
            
        }
        card.style.display = "block";
        
        if(selectedSpriteObject != null)
            selectedSpriteObject.material.opacity = 1;

        selectedSpriteObject = intersects[0].object;
        
console.log(cards);

        document.getElementById("cardTypeImage").src = cards[selectedSpriteObject.id].imageTypePath;

    }
    else{
        card.style.display = "none";
        
        selectedSpriteObject = null;
    }
}

function rightClickRaycast()
{
    raycaster.setFromCamera(pointer, camera );

    const intersects = raycaster.intersectObjects( objectsToBeRightClickRaycasted, true );
    let intersectedObject = null;
    if ( intersects.length > 0 ) {

        if ( intersectedObject != intersects[ 0 ].object ) {
    
           intersectedObject = intersects[ 0 ].object;
           const point = intersects[0].point;

           dropdown.style.display = "block";
           dropdown.style.right = (window.innerWidth - pointerX) - 160 + "px";
           dropdown.style.bottom = (window.innerHeight - pointerY) - 220 + "px";

           posToSetIndicator = point;
        }
    
    } else {
    
        intersectedObject = null;
    
    }
}

document.getElementById("button1").onclick = function()
{
    onClickedButton("syringe.png", "card1");

    return false;
}

document.getElementById("button2").onclick = function()
{
    onClickedButton("cvk.png", "card2");

    return false;
}

document.getElementById("button3").onclick = function()
{
    onClickedButton("bandage.png", "card3");

    return false;
}

function onClickedButton( image, cardName ) {
    loadSprite(image, posToSetIndicator, cardName)
}


function loadSprite ( image, position, cardName )
{
    const map = new THREE.TextureLoader().load("../images/" + image);
    const material = new THREE.SpriteMaterial({map: map, transparent: true});

    const sprite = new THREE.Sprite(material);
    scene.add( sprite );

    sprite.position.set(position.x, position.y, position.z);
    sprite.scale.set(0.1, 0.1, 0.1);

    var dir = new THREE.Vector3();
    dir.subVectors(camera.position, sprite.getWorldPosition(dir)).normalize();
    sprite.translateOnAxis(dir, .05);

    objectsToBeLeftClickRaycasted.push(sprite);

    cards[sprite.id] = { imagePath : "../images/julebrus.png",
    imageTypePath: "../images/" + image};
}

render();
