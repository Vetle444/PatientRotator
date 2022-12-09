import { OrbitControls } from "orbitControls";
import * as THREE from "three";
import { OBJLoader } from "fbxLoader";
import { MeshBasicMaterial } from "three";
import { Color } from "three";
import { DragControls } from "dragControls";
import { CSS3DRenderer, CSS3DObject } from "css3drenderer"
import { DirectionalLight } from "three";

let cards = {};

const metaDataCard = document.getElementById("card");

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

const directionalLight = new THREE.DirectionalLight( new THREE.Color( 'rgb(233,229,229)' ), 1.3 );
const directionalLight2 = new THREE.DirectionalLight( new THREE.Color( 'rgb(233,229,229)' ), 1.3 );

directionalLight.position.set(5, 5, 5);
directionalLight2.position.set(-5, -5, -5);

scene.add( directionalLight );
scene.add( directionalLight2 );


function createSkyboxStrings() {
    const basePath = "skybox/";
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


const humanColor = new THREE.MeshPhongMaterial( { color: "rgb(130, 180, 255)" } );
let grownHuman;
let youthHuman;
let childHuman;

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

        grownHuman = object;

        human = grownHuman;

        scene.add( object );

    }
);

loader.load(
    // resource URL
    'ungdomgeir.obj',
    // called when resource is loaded
    function ( object ) {
        object.scale.set(0.25, 0.25, 0.25)
        object.position.set(0, -2, 0);
        
        object.traverse( function ( child ) {
            if ( child instanceof THREE.Mesh ) {
                child.material = humanColor;
                }
            } );

        youthHuman = object;

     //   scene.add( object );
        

    }
);

loader.load(
    // resource URL
    'babygeir.obj',
    // called when resource is loaded
    function ( object ) {
        object.scale.set(0.25, 0.25, 0.25)
        object.position.set(0, -2, 0);
        
        object.traverse( function ( child ) {
            if ( child instanceof THREE.Mesh ) {
                child.material = humanColor;
                
                }
            } );

        childHuman = object;

       // scene.add( object );
        

    }
);

function reset()
{
    scene.clear();

    scene.add(directionalLight);
    scene.add(directionalLight2);
    scene.add(skybox)

    objectsToBeRightClickRaycasted = [];
    objectsToBeLeftClickRaycasted = [];


    human.traverse( function ( child ) {
        if ( child instanceof THREE.Mesh ) {
            objectsToBeRightClickRaycasted.push(child);

            
            }
        } );

    scene.add(human);
}

document.getElementById("grown").onclick = function() {
    human = grownHuman;
    
    reset();
}

document.getElementById("youth").onclick = function() {
    human = youthHuman;
    
    reset();
}

document.getElementById("child").onclick = function() {
    human = childHuman;
    
    reset();
}

const orbitControls = new OrbitControls(camera, renderer.domElement)

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
        metaDataCard.style.display = "flex";
        
        if(selectedSpriteObject != null)
            selectedSpriteObject.material.opacity = 1;

        selectedSpriteObject = intersects[0].object;
        
        const card = cards[selectedSpriteObject.id];

        document.getElementById("cardTypeImage").src = card.imageTypePath;
        document.getElementById("cardImageValue").src = "data:image/png;base64," + card.imagebase64;
        document.getElementById("whenInsertedValue").innerHTML = card.whenInserted.replace("T", " ");
        document.getElementById("cleanOrChangeTimeValue").innerHTML = card.cleanOrChangeTime.replace("T", " ");
        document.getElementById("whenToRemoveValue").innerHTML = card.removeTime.replace("T", " ");

        document.getElementById("remove").onclick = function () {
            scene.remove(card.gameObject);
            delete cards[card];
        }

    }
    else{
        metaDataCard.style.display = "none";
        
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

            console.log(pointerY);
            console.log(window.innerHeight);

            
            let offset = 0;
            dropdown.style.display = "block";
            if(pointerY < (window.innerHeight / 2)) 
            {
                offset = dropdown.offsetHeight; 
                    console.log(dropdown.offsetHeight);
            }
            console.log(offset)

           dropdown.style.right = (window.innerWidth - pointerX) - dropdown.offsetWidth + "px";
           dropdown.style.bottom = (window.innerHeight - pointerY) - offset + "px";
           posToSetIndicator = point;
        }
    
    } else {
    
        intersectedObject = null;
    
    }
}

document.getElementById("stethoScope").onclick = function()
{
    onClickedButton("images/veneflon.png", new THREE.Vector3(0.1, 0.1, 0.1));

    return false;
}

document.getElementById("cvk").onclick = function()
{
    onClickedButton("images/cvk.png", new THREE.Vector3(0.2, 0.2, 0.2));

    return false;
}

document.getElementById("bandage").onclick = function()
{
    onClickedButton("images/bandage.png", new THREE.Vector3(0.1, 0.1, 0.1));

    return false;
}


document.getElementById("bandage2").onclick = function()
{
    onClickedButton("images/bandage2.png", new THREE.Vector3(0.1, 0.3, 0.1));

    return false;
}

document.getElementById("catheter").onclick = function()
{
    onClickedButton("images/catheter.png", new THREE.Vector3(0.2, 0.2, 0.2));

    return false;
}

document.getElementById("wound").onclick = function()
{
    onClickedButton("images/wound.png", new THREE.Vector3(0.2, 0.2, 0.2));

    return false;
}

function onClickedButton( image, scale ) {
    displayCreateCard(image, posToSetIndicator, scale)
}

function displayCreateCard(image, posToSetIndicator, scale)
{
    document.getElementById("createCard").style.display = "flex";
    document.getElementById("createCardTypeImage").src = image;

    document.getElementById("cardImageInput").
    addEventListener('change', createBase64, false);

    document.getElementById("doneButton").onclick = function() {
        loadSprite(image, posToSetIndicator, scale);
        document.getElementById("createCard").style.display = "none";
    }

}

let imagebase64Value;

var createBase64 = function(evt)
{
    var files = evt.target.files;
    var file = files[0];

    if(files && file)
    {
        var reader = new FileReader();

        reader.onload = function(readerevt) {
            var binaryString = readerevt.target.result;
            imagebase64Value = btoa(binaryString);
        }

        reader.readAsBinaryString(file);
    }
}

function loadSprite ( image, position, scale )
{
    console.log(scale);
    const map = new THREE.TextureLoader().load(image);
    const material = new THREE.SpriteMaterial({map: map, transparent: true});

    const sprite = new THREE.Sprite(material);
    scene.add( sprite );

    sprite.position.set(position.x, position.y, position.z);
    sprite.scale.set(scale.x, scale.y, scale.z);

    var dir = new THREE.Vector3();
    dir.subVectors(camera.position, sprite.getWorldPosition(dir)).normalize();
    sprite.translateOnAxis(dir, .05);

    objectsToBeLeftClickRaycasted.push(sprite);

    const imagePath = document.getElementById("cardImageInput").src;
    const cleanOrChangeTimeValue = document.getElementById("cleanOrChangeTimeInput").value;
    const removeTimeValue = document.getElementById("removeTimeInput").value;
    const whenInsertedValue = document.getElementById("insertedInput").value;


    
    cards[sprite.id] = { imagebase64: imagebase64Value,
        imageTypePath: "images/" + image,
        cleanOrChangeTime: cleanOrChangeTimeValue,
        removeTime: removeTimeValue,
        whenInserted: whenInsertedValue,
        gameObject: sprite
      };

    
    
}


render();