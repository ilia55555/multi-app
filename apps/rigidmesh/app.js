import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { TransformControls } from 'three/addons/controls/TransformControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';

const MAX_FILE_SIZE = 50 * 1024 * 1024;
const viewport = document.querySelector('#viewport');
const meshList = document.querySelector('#meshList');
const fileInput = document.querySelector('#fileInput');
const loading = document.querySelector('#loading');
const emptyState = document.querySelector('#emptyState');
const undoStack = [];
const redoStack = [];
let selected = null;
let modelRoot = null;
let outline = null;
let transformStart = null;
let toastTimer;
let animationMixer = null;
let animationClips = [];
let activeAction = null;
let animationPlaying = false;
const clock = new THREE.Clock();
const editorKeyframes = new Map();
let editorClip = null;
let editorFrame = 1;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1a1a18);
scene.fog = new THREE.Fog(0x1a1a18, 11, 24);
const camera = new THREE.PerspectiveCamera(38, 1, 0.01, 1000);
camera.position.set(5.5, 3.8, 7.5);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
viewport.prepend(renderer.domElement);

scene.add(new THREE.HemisphereLight(0xe9dec5, 0x32332e, 2.2));
const keyLight = new THREE.DirectionalLight(0xffe5b0, 3.2);
keyLight.position.set(4, 7, 5);
keyLight.castShadow = true;
scene.add(keyLight);
const rimLight = new THREE.DirectionalLight(0x7897c8, 1.8);
rimLight.position.set(-5, 3, -4);
scene.add(rimLight);

const grid = new THREE.GridHelper(20, 20, 0x575750, 0x30302c);
grid.position.y = -2.5;
scene.add(grid);
const ground = new THREE.Mesh(new THREE.PlaneGeometry(200, 200), new THREE.ShadowMaterial({ color: 0x000000, opacity: 0.22 }));
ground.rotation.x = -Math.PI / 2;
ground.position.y = -2.51;
ground.receiveShadow = true;
scene.add(ground);

const orbit = new OrbitControls(camera, renderer.domElement);
orbit.enableDamping = true;
orbit.target.set(0, 0.2, 0);
orbit.minDistance = 2;
orbit.maxDistance = 25;
const transform = new TransformControls(camera, renderer.domElement);
transform.setMode('translate');
transform.setSpace('local');
transform.setSize(0.75);
scene.add(transform.getHelper());
transform.addEventListener('dragging-changed', event => { orbit.enabled = !event.value; });
transform.addEventListener('mouseDown', () => { if (selected) transformStart = makeSnapshot(selected); });
transform.addEventListener('mouseUp', () => {
  if (selected && transformStart && !snapshotEquals(transformStart, makeSnapshot(selected))) pushHistory(transformStart);
  transformStart = null;
  syncInspector();
});
transform.addEventListener('objectChange', updateOutline);

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
renderer.domElement.addEventListener('pointerdown', event => {
  if (!modelRoot || transform.dragging) return;
  const rect = renderer.domElement.getBoundingClientRect();
  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);
  const hit = raycaster.intersectObjects(getMeshes(), false)[0];
  if (hit) selectMesh(hit.object);
});

function createDemoModel() {
  const root = new THREE.Group();
  root.name = 'کاراکتر نمونه';
  const material = new THREE.MeshStandardMaterial({ color: 0xc19a58, roughness: 0.72, metalness: 0.05 });
  const dark = new THREE.MeshStandardMaterial({ color: 0x302f2a, roughness: 0.8 });
  const add = (name, geometry, position, mat = material) => {
    const mesh = new THREE.Mesh(geometry, mat.clone());
    mesh.name = name; mesh.position.set(...position); mesh.castShadow = true; mesh.receiveShadow = true; root.add(mesh); return mesh;
  };
  add('بدن', new THREE.CapsuleGeometry(0.78, 1.45, 8, 20), [0, 0.25, 0]);
  add('سر', new THREE.SphereGeometry(0.57, 32, 24), [0, 1.75, 0]);
  add('بازوی چپ', new THREE.CapsuleGeometry(0.21, 1.25, 6, 14), [1.0, 0.35, 0]).rotation.z = -0.12;
  add('بازوی راست', new THREE.CapsuleGeometry(0.21, 1.25, 6, 14), [-1.0, 0.35, 0]).rotation.z = 0.12;
  add('پای چپ', new THREE.CapsuleGeometry(0.28, 1.45, 6, 14), [0.43, -1.65, 0]);
  add('پای راست', new THREE.CapsuleGeometry(0.28, 1.45, 6, 14), [-0.43, -1.65, 0]);
  add('چشم چپ', new THREE.SphereGeometry(0.075, 12, 8), [0.2, 1.86, 0.52], dark);
  add('چشم راست', new THREE.SphereGeometry(0.075, 12, 8), [-0.2, 1.86, 0.52], dark);
  return root;
}

function getMeshes() {
  const meshes = [];
  modelRoot?.traverse(child => { if (child.isMesh) meshes.push(child); });
  return meshes;
}

function getEditableObjects() {
  const objects = [];
  modelRoot?.traverse(child => { if (child.isMesh || child.isBone) objects.push(child); });
  return objects;
}

function setModel(root, name, clips = []) {
  stopAnimation();
  animationMixer?.stopAllAction();
  animationMixer = null;
  if (modelRoot) {
    scene.remove(modelRoot);
    disposeObject(modelRoot);
  }
  transform.detach();
  selected = null;
  modelRoot = root;
  modelRoot.name ||= name;
  modelRoot.userData.originalTransform = makeSnapshot(modelRoot);
  prepareModel(modelRoot);
  scene.add(modelRoot);
  animationClips = clips;
  editorKeyframes.clear();
  editorClip = null;
  editorFrame = 1;
  animationMixer = new THREE.AnimationMixer(modelRoot);
  undoStack.length = 0; redoStack.length = 0;
  document.querySelector('#projectName').textContent = name;
  frameModel();
  renderMeshList();
  selectMesh(getMeshes()[0] || null);
  updateStats();
  emptyState.hidden = getMeshes().length > 0;
  updateHistoryButtons();
  renderAnimations();
  applyViewMode(document.querySelector('[data-view].active').dataset.view);
  updateFrameEditor();
}

function prepareModel(root) {
  root.traverse(child => {
    if (!child.isMesh && !child.isBone) return;
    child.name ||= `${child.isBone ? 'استخوان' : 'مش'} ${child.id}`;
    child.userData.originalTransform = makeSnapshot(child);
    if (!child.isMesh) return;
    child.castShadow = true;
    child.receiveShadow = true;
    const materials = Array.isArray(child.material) ? child.material : [child.material];
    child.material = Array.isArray(child.material) ? materials.map(item => item.clone()) : child.material.clone();
  });
}

function frameModel() {
  const box = new THREE.Box3().setFromObject(modelRoot);
  if (box.isEmpty()) return;
  const sphere = box.getBoundingSphere(new THREE.Sphere());
  const distance = Math.max(3, sphere.radius / Math.sin(THREE.MathUtils.degToRad(camera.fov / 2)) * 1.15);
  orbit.target.copy(sphere.center);
  camera.position.copy(sphere.center).add(new THREE.Vector3(distance * .65, distance * .38, distance));
  camera.near = Math.max(0.001, distance / 1000);
  camera.far = distance * 20;
  camera.updateProjectionMatrix();
  grid.position.y = box.min.y - Math.max(.01, sphere.radius * .02);
  ground.position.y = grid.position.y - .01;
  orbit.update();
}

function renderMeshList() {
  meshList.replaceChildren();
  getEditableObjects().forEach((mesh, index) => {
    const button = document.createElement('button');
    button.type = 'button'; button.className = 'mesh-item'; button.dataset.uuid = mesh.uuid; button.setAttribute('role', 'treeitem');
    button.innerHTML = `<i>${mesh.isBone ? '↳' : '◇'}</i><span></span><small>${mesh.isBone ? 'Bone' : index + 1}</small>`;
    button.querySelector('span').textContent = mesh.name;
    button.addEventListener('click', () => selectMesh(mesh));
    meshList.append(button);
  });
}

function selectMesh(mesh) {
  selected = mesh;
  if (mesh) transform.attach(mesh); else transform.detach();
  meshList.querySelectorAll('.mesh-item').forEach(item => item.classList.toggle('active', item.dataset.uuid === mesh?.uuid));
  document.querySelector('#selectCharacter').classList.toggle('active', mesh === modelRoot);
  updateOutline();
  syncInspector();
}

function updateOutline() {
  if (outline) { scene.remove(outline); outline.geometry.dispose(); outline.material.dispose(); outline = null; }
  if (selected && !selected.isBone && document.querySelector('#outlineToggle').checked) {
    outline = new THREE.BoxHelper(selected, 0xf3bd52);
    outline.material.depthTest = false;
    outline.renderOrder = 999;
    scene.add(outline);
  }
}

function syncInspector() {
  document.querySelector('#selectedName').textContent = selected?.name || 'هیچ بخشی';
  document.querySelector('#selectedMeta').textContent = selected === modelRoot ? 'کل مدل · حرکت یکپارچه' : selected?.isBone ? 'استخوان · ساخت حالت انیمیشن' : selected ? `Mesh · ${vertexCount(selected).toLocaleString('fa-IR')} رأس` : 'یک مش یا استخوان را انتخاب کنید';
  document.querySelectorAll('.vector input').forEach(input => {
    const group = input.closest('.vector').dataset.vector;
    const axis = input.dataset.axis;
    const value = selected ? selected[group][axis] : 0;
    input.value = (group === 'rotation' ? THREE.MathUtils.radToDeg(value) : value).toFixed(2);
    input.disabled = !selected;
  });
}

function makeSnapshot(mesh) {
  return { uuid: mesh.uuid, position: mesh.position.toArray(), rotation: mesh.rotation.toArray().slice(0, 3) };
}

function snapshotEquals(a, b) {
  return a.uuid === b.uuid && [...a.position, ...a.rotation].every((value, index) => Math.abs(value - [...b.position, ...b.rotation][index]) < 1e-7);
}

function applySnapshot(snapshot) {
  const mesh = modelRoot?.uuid === snapshot.uuid ? modelRoot : getEditableObjects().find(item => item.uuid === snapshot.uuid);
  if (!mesh) return;
  mesh.position.fromArray(snapshot.position);
  mesh.rotation.set(...snapshot.rotation);
  selectMesh(mesh);
}

function pushHistory(snapshot) {
  undoStack.push(snapshot);
  if (undoStack.length > 60) undoStack.shift();
  redoStack.length = 0;
  updateHistoryButtons();
}

function undo() {
  const snapshot = undoStack.pop();
  if (!snapshot) return;
  const mesh = modelRoot?.uuid === snapshot.uuid ? modelRoot : getEditableObjects().find(item => item.uuid === snapshot.uuid);
  if (mesh) redoStack.push(makeSnapshot(mesh));
  applySnapshot(snapshot); updateHistoryButtons();
}

function redo() {
  const snapshot = redoStack.pop();
  if (!snapshot) return;
  const mesh = modelRoot?.uuid === snapshot.uuid ? modelRoot : getEditableObjects().find(item => item.uuid === snapshot.uuid);
  if (mesh) undoStack.push(makeSnapshot(mesh));
  applySnapshot(snapshot); updateHistoryButtons();
}

function updateHistoryButtons() {
  document.querySelector('#undoButton').disabled = !undoStack.length;
  document.querySelector('#redoButton').disabled = !redoStack.length;
}

function vertexCount(mesh) { return mesh.geometry?.attributes?.position?.count || 0; }
function updateStats() {
  const meshes = getMeshes();
  const vertices = meshes.reduce((sum, mesh) => sum + vertexCount(mesh), 0);
  document.querySelector('#modelStats').textContent = `${meshes.length.toLocaleString('fa-IR')} مش · ${vertices.toLocaleString('fa-IR')} رأس`;
}

async function loadFile(file) {
  if (!file) return;
  if (file.size > MAX_FILE_SIZE) return showToast('حجم فایل بیشتر از ۵۰ مگابایت است.', true);
  const extension = file.name.split('.').pop().toLowerCase();
  if (!['glb', 'gltf', 'obj'].includes(extension)) return showToast('فرمت فایل پشتیبانی نمی‌شود.', true);
  loading.hidden = false;
  try {
    const buffer = await file.arrayBuffer();
    let root;
    let clips = [];
    if (extension === 'obj') root = new OBJLoader().parse(new TextDecoder().decode(buffer));
    else {
      const data = extension === 'gltf' ? new TextDecoder().decode(buffer) : buffer;
      const gltf = await new GLTFLoader().parseAsync(data, '');
      root = gltf.scene;
      clips = gltf.animations;
    }
    if (!root.getObjectByProperty('isMesh', true)) throw new Error('no-mesh');
    setModel(root, file.name.replace(/\.[^.]+$/, ''), clips);
    showToast(`${getMeshes().length.toLocaleString('fa-IR')} بخش مش با موفقیت وارد شد.`);
  } catch (error) {
    console.error(error);
    showToast(extension === 'gltf' ? 'GLTF باید توکار باشد؛ برای فایل‌های چندبخشی از GLB استفاده کنید.' : 'فایل خوانده نشد یا مدل مش معتبری ندارد.', true);
  } finally { loading.hidden = true; fileInput.value = ''; }
}

async function exportGLB() {
  if (!modelRoot) return showToast('مدلی برای خروجی وجود ندارد.', true);
  try {
    const result = await new GLTFExporter().parseAsync(modelRoot, { binary: true, onlyVisible: false, animations: animationClips });
    const blob = new Blob([result], { type: 'model/gltf-binary' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${document.querySelector('#projectName').textContent || 'rigid-model'}.glb`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(link.href), 1000);
    showToast('فایل GLB آماده و دانلود شد.');
  } catch (error) { console.error(error); showToast('ساخت خروجی GLB ممکن نشد.', true); }
}

function disposeObject(root) {
  root.traverse(child => {
    child.geometry?.dispose();
    const materials = Array.isArray(child.material) ? child.material : [child.material];
    materials.forEach(material => material?.dispose());
  });
}

function showToast(message, error = false) {
  const toast = document.querySelector('#toast');
  toast.textContent = message; toast.style.color = error ? '#ef8b82' : '#d8c394'; toast.hidden = false;
  clearTimeout(toastTimer); toastTimer = setTimeout(() => { toast.hidden = true; }, 3200);
}

function applyViewMode(mode) {
  getMeshes().forEach(mesh => {
    const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    materials.forEach(material => {
      if (!material.userData.rigidmeshDisplay) {
        material.userData.rigidmeshDisplay = {
          color: material.color?.getHex(),
          map: material.map || null,
          wireframe: Boolean(material.wireframe)
        };
      }
      const original = material.userData.rigidmeshDisplay;
      if (material.color && original.color !== undefined) material.color.setHex(mode === 'material' ? original.color : 0xb8b5aa);
      material.map = mode === 'material' ? original.map : null;
      material.wireframe = mode === 'wire' ? true : original.wireframe;
      material.needsUpdate = true;
    });
  });
}

function formatTime(seconds) {
  const safe = Number.isFinite(seconds) ? Math.max(0, seconds) : 0;
  const minutes = Math.floor(safe / 60);
  return `${minutes.toLocaleString('fa-IR')}:${Math.floor(safe % 60).toLocaleString('fa-IR', { minimumIntegerDigits: 2 })}`;
}

function editorSettings() {
  const fps = Math.max(1, Math.min(60, Number(document.querySelector('#animationFps').value) || 24));
  const duration = Math.max(0.1, Math.min(120, Number(document.querySelector('#animationDuration').value) || 2));
  const highestKey = Math.max(1, ...[...editorKeyframes.values()].flatMap(keys => [...keys.keys()]));
  return { fps, duration, maxFrame: Math.max(Math.round(fps * duration), highestKey) };
}

function findAnimatedObject(uuid) {
  if (modelRoot?.uuid === uuid) return modelRoot;
  let result = null;
  modelRoot?.traverse(child => { if (child.uuid === uuid) result = child; });
  return result;
}

function buildEditorClip() {
  const tracks = [];
  const { fps, duration, maxFrame } = editorSettings();
  for (const [uuid, keys] of editorKeyframes) {
    const ordered = [...keys.entries()].sort((a, b) => a[0] - b[0]);
    if (!ordered.length || !findAnimatedObject(uuid)) continue;
    const times = ordered.map(([frame]) => (frame - 1) / fps);
    const positions = ordered.flatMap(([, snapshot]) => snapshot.position);
    const quaternions = ordered.flatMap(([, snapshot]) => new THREE.Quaternion().setFromEuler(new THREE.Euler(...snapshot.rotation)).toArray());
    tracks.push(new THREE.VectorKeyframeTrack(`${uuid}.position`, times, positions));
    tracks.push(new THREE.QuaternionKeyframeTrack(`${uuid}.quaternion`, times, quaternions));
  }
  animationClips = animationClips.filter(clip => !clip.userData?.rigidmeshEditor);
  editorClip = null;
  if (tracks.length) {
    editorClip = new THREE.AnimationClip(document.querySelector('#animationName').value.trim() || 'انیمیشن من', Math.max(duration, maxFrame / fps), tracks);
    editorClip.userData = { rigidmeshEditor: true };
    animationClips.push(editorClip);
  }
  renderAnimations(editorClip ? animationClips.length - 1 : 0);
  updateFrameEditor();
}

function updateFrameEditor() {
  const { maxFrame } = editorSettings();
  editorFrame = Math.max(1, Math.min(maxFrame, Math.round(editorFrame)));
  const frameInput = document.querySelector('#currentFrame');
  const timeline = document.querySelector('#frameTimeline');
  frameInput.max = maxFrame; frameInput.value = editorFrame;
  timeline.max = maxFrame; timeline.value = editorFrame;
  const frames = [...new Set([...editorKeyframes.values()].flatMap(keys => [...keys.keys()]))].sort((a, b) => a - b);
  const markers = document.querySelector('#keyframeMarkers');
  markers.replaceChildren();
  frames.forEach(frame => {
    const button = document.createElement('button');
    button.type = 'button'; button.textContent = `◆ ${frame.toLocaleString('fa-IR')}`;
    button.classList.toggle('current', frame === editorFrame);
    button.addEventListener('click', () => goToFrame(frame));
    markers.append(button);
  });
  const keysHere = [...editorKeyframes.values()].filter(keys => keys.has(editorFrame)).length;
  document.querySelector('#keyframeStatus').textContent = keysHere
    ? `${keysHere.toLocaleString('fa-IR')} بخش در فریم ${editorFrame.toLocaleString('fa-IR')} فریم کلیدی دارد.`
    : `فریم ${editorFrame.toLocaleString('fa-IR')} · بخشی را حرکت دهید و فریم کلیدی ثبت کنید.`;
}

function goToFrame(frame) {
  const { fps, maxFrame } = editorSettings();
  editorFrame = Math.max(1, Math.min(maxFrame, Math.round(Number(frame) || 1)));
  updateFrameEditor();
  if (!editorClip || !animationMixer) return;
  const index = animationClips.indexOf(editorClip);
  setActiveClip(index);
  document.querySelector('#clipSelect').value = String(index);
  activeAction.reset().play();
  activeAction.paused = true;
  activeAction.time = (editorFrame - 1) / fps;
  animationMixer.update(0);
  document.querySelector('#animationTime').value = activeAction.time;
  document.querySelector('#currentTime').textContent = formatTime(activeAction.time);
  updateOutline(); syncInspector();
}

function addEditorKeyframe() {
  if (!selected) return showToast('ابتدا کل کاراکتر یا یکی از بخش‌های مش را انتخاب کنید.', true);
  if (!editorKeyframes.has(selected.uuid)) editorKeyframes.set(selected.uuid, new Map());
  editorKeyframes.get(selected.uuid).set(editorFrame, makeSnapshot(selected));
  buildEditorClip();
  showToast(`فریم کلیدی ${editorFrame.toLocaleString('fa-IR')} برای «${selected.name}» ثبت شد.`);
}

function addPoseKeyframe() {
  const poseObjects = [modelRoot, ...getEditableObjects()];
  poseObjects.forEach(object => {
    if (!editorKeyframes.has(object.uuid)) editorKeyframes.set(object.uuid, new Map());
    editorKeyframes.get(object.uuid).set(editorFrame, makeSnapshot(object));
  });
  buildEditorClip();
  showToast(`حالت کامل کاراکتر در فریم ${editorFrame.toLocaleString('fa-IR')} ثبت شد.`);
}

function deleteEditorKeyframe() {
  if (!selected || !editorKeyframes.get(selected.uuid)?.has(editorFrame)) {
    return showToast('برای بخش انتخاب‌شده در این فریم کلیدی وجود ندارد.', true);
  }
  editorKeyframes.get(selected.uuid).delete(editorFrame);
  if (!editorKeyframes.get(selected.uuid).size) editorKeyframes.delete(selected.uuid);
  buildEditorClip();
  showToast('فریم کلیدی حذف شد.');
}

function deletePoseKeyframe() {
  let deleted = 0;
  for (const [uuid, keys] of editorKeyframes) {
    if (keys.delete(editorFrame)) deleted += 1;
    if (!keys.size) editorKeyframes.delete(uuid);
  }
  if (!deleted) return showToast('در این فریم حالت ثبت‌شده‌ای وجود ندارد.', true);
  buildEditorClip();
  showToast(`حالت کامل فریم ${editorFrame.toLocaleString('fa-IR')} حذف شد.`);
}

function newEditorAnimation() {
  editorKeyframes.clear(); editorFrame = 1;
  animationClips = animationClips.filter(clip => !clip.userData?.rigidmeshEditor);
  editorClip = null;
  renderAnimations(); updateFrameEditor();
  showToast('تایم‌لاین جدید آماده است.');
}

function renderAnimations(preferredIndex = 0) {
  const select = document.querySelector('#clipSelect');
  select.replaceChildren();
  if (!animationClips.length) {
    select.add(new Option('انیمیشنی موجود نیست', ''));
  } else {
    animationClips.forEach((clip, index) => select.add(new Option(clip.name || `انیمیشن ${index + 1}`, String(index))));
  }
  const enabled = animationClips.length > 0;
  select.disabled = !enabled;
  document.querySelectorAll('#playAnimation,#pauseAnimation,#stopAnimation,#animationTime').forEach(control => { control.disabled = !enabled; });
  document.querySelector('#clipCount').textContent = `${animationClips.length.toLocaleString('fa-IR')} کلیپ`;
  const selectedIndex = enabled ? Math.min(preferredIndex, animationClips.length - 1) : 0;
  select.value = enabled ? String(selectedIndex) : '';
  setActiveClip(selectedIndex);
}

function setActiveClip(index) {
  activeAction?.stop();
  animationPlaying = false;
  const clip = animationClips[index];
  activeAction = clip && animationMixer ? animationMixer.clipAction(clip) : null;
  const timeline = document.querySelector('#animationTime');
  timeline.value = 0;
  timeline.max = clip?.duration || 1;
  document.querySelector('#currentTime').textContent = formatTime(0);
  document.querySelector('#durationTime').textContent = formatTime(clip?.duration || 0);
}

function playAnimation() {
  if (!activeAction) return;
  activeAction.paused = false;
  activeAction.enabled = true;
  const repeat = document.querySelector('#loopAnimation').checked;
  activeAction.setLoop(repeat ? THREE.LoopRepeat : THREE.LoopOnce, repeat ? Infinity : 1);
  activeAction.clampWhenFinished = true;
  activeAction.play();
  animationPlaying = true;
}

function pauseAnimation() {
  if (!activeAction) return;
  activeAction.paused = !activeAction.paused;
  animationPlaying = !activeAction.paused;
}

function stopAnimation() {
  activeAction?.stop();
  animationPlaying = false;
  const timeline = document.querySelector('#animationTime');
  if (timeline) timeline.value = 0;
  const current = document.querySelector('#currentTime');
  if (current) current.textContent = formatTime(0);
}

async function loadAnimationFile(file) {
  if (!file) return;
  const extension = file.name.split('.').pop().toLowerCase();
  if (!['glb', 'gltf'].includes(extension)) return showToast('فایل انیمیشن باید GLB یا GLTF باشد.', true);
  if (file.size > MAX_FILE_SIZE) return showToast('حجم فایل بیشتر از ۵۰ مگابایت است.', true);
  loading.hidden = false;
  try {
    const buffer = await file.arrayBuffer();
    const data = extension === 'gltf' ? new TextDecoder().decode(buffer) : buffer;
    const gltf = await new GLTFLoader().parseAsync(data, '');
    if (!gltf.animations.length) throw new Error('no-animation');
    animationClips.push(...gltf.animations);
    renderAnimations();
    showToast(`${gltf.animations.length.toLocaleString('fa-IR')} کلیپ انیمیشن اضافه شد.`);
  } catch (error) {
    console.error(error);
    showToast('کلیپ انیمیشن معتبری در فایل پیدا نشد.', true);
  } finally {
    loading.hidden = true;
    document.querySelector('#animationInput').value = '';
  }
}

document.querySelector('#pickButton').addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', () => loadFile(fileInput.files[0]));
document.querySelector('#selectCharacter').addEventListener('click', () => selectMesh(modelRoot));
const dropZone = document.querySelector('#dropZone');
['dragenter', 'dragover'].forEach(type => dropZone.addEventListener(type, event => { event.preventDefault(); dropZone.classList.add('drag'); }));
['dragleave', 'drop'].forEach(type => dropZone.addEventListener(type, event => { event.preventDefault(); dropZone.classList.remove('drag'); }));
dropZone.addEventListener('drop', event => loadFile(event.dataTransfer.files[0]));
document.querySelectorAll('[data-mode]').forEach(button => button.addEventListener('click', () => {
  transform.setMode(button.dataset.mode);
  document.querySelectorAll('[data-mode]').forEach(item => item.classList.toggle('active', item === button));
}));
document.querySelector('#spaceButton').addEventListener('click', () => {
  const space = transform.space === 'local' ? 'world' : 'local'; transform.setSpace(space);
  document.querySelector('#spaceLabel').textContent = space === 'local' ? 'محلی' : 'جهانی';
});
document.querySelectorAll('.vector input').forEach(input => input.addEventListener('change', () => {
  if (!selected) return;
  const before = makeSnapshot(selected);
  const group = input.closest('.vector').dataset.vector;
  const value = Number(input.value);
  if (!Number.isFinite(value)) return syncInspector();
  selected[group][input.dataset.axis] = group === 'rotation' ? THREE.MathUtils.degToRad(value) : value;
  pushHistory(before); updateOutline(); syncInspector();
}));
document.querySelector('#resetTransform').addEventListener('click', () => {
  if (!selected) return;
  const before = makeSnapshot(selected); const original = selected.userData.originalTransform;
  selected.position.fromArray(original.position); selected.rotation.set(...original.rotation);
  if (!snapshotEquals(before, makeSnapshot(selected))) pushHistory(before);
  updateOutline(); syncInspector();
});
document.querySelector('#resetButton').addEventListener('click', () => {
  const rootOriginal = modelRoot.userData.originalTransform;
  modelRoot.position.fromArray(rootOriginal.position); modelRoot.rotation.set(...rootOriginal.rotation);
  getEditableObjects().forEach(mesh => { const original = mesh.userData.originalTransform; mesh.position.fromArray(original.position); mesh.rotation.set(...original.rotation); });
  undoStack.length = 0; redoStack.length = 0; updateHistoryButtons(); updateOutline(); syncInspector(); showToast('همه تبدیل‌ها بازنشانی شدند.');
});
document.querySelector('#undoButton').addEventListener('click', undo);
document.querySelector('#redoButton').addEventListener('click', redo);
document.querySelector('#exportButton').addEventListener('click', exportGLB);
document.querySelector('#gridToggle').addEventListener('change', event => { grid.visible = event.target.checked; });
document.querySelectorAll('[data-view]').forEach(button => button.addEventListener('click', () => {
  document.querySelectorAll('[data-view]').forEach(item => item.classList.toggle('active', item === button));
  applyViewMode(button.dataset.view);
}));
document.querySelector('#outlineToggle').addEventListener('change', updateOutline);
document.querySelector('#collapseAll').addEventListener('click', () => { meshList.hidden = !meshList.hidden; document.querySelector('#collapseAll').textContent = meshList.hidden ? '+' : '−'; });
const animationInput = document.querySelector('#animationInput');
document.querySelector('#pickAnimation').addEventListener('click', () => animationInput.click());
animationInput.addEventListener('change', () => loadAnimationFile(animationInput.files[0]));
document.querySelector('#clipSelect').addEventListener('change', event => setActiveClip(Number(event.target.value)));
document.querySelector('#playAnimation').addEventListener('click', playAnimation);
document.querySelector('#pauseAnimation').addEventListener('click', pauseAnimation);
document.querySelector('#stopAnimation').addEventListener('click', stopAnimation);
document.querySelector('#animationSpeed').addEventListener('change', event => { if (animationMixer) animationMixer.timeScale = Number(event.target.value); });
document.querySelector('#loopAnimation').addEventListener('change', () => {
  if (!activeAction) return;
  const repeat = document.querySelector('#loopAnimation').checked;
  activeAction.setLoop(repeat ? THREE.LoopRepeat : THREE.LoopOnce, repeat ? Infinity : 1);
  activeAction.clampWhenFinished = true;
});
document.querySelector('#animationTime').addEventListener('input', event => {
  if (!activeAction || !animationMixer) return;
  activeAction.paused = true;
  animationPlaying = false;
  activeAction.time = Number(event.target.value);
  animationMixer.update(0);
  document.querySelector('#currentTime').textContent = formatTime(activeAction.time);
});
document.querySelector('#addKeyframe').addEventListener('click', addEditorKeyframe);
document.querySelector('#addPoseKeyframe').addEventListener('click', addPoseKeyframe);
document.querySelector('#deleteKeyframe').addEventListener('click', deleteEditorKeyframe);
document.querySelector('#deletePoseKeyframe').addEventListener('click', deletePoseKeyframe);
document.querySelector('#newAnimation').addEventListener('click', newEditorAnimation);
document.querySelector('#previousFrame').addEventListener('click', () => goToFrame(editorFrame - 1));
document.querySelector('#nextFrame').addEventListener('click', () => goToFrame(editorFrame + 1));
document.querySelector('#frameTimeline').addEventListener('input', event => goToFrame(event.target.value));
document.querySelector('#currentFrame').addEventListener('change', event => goToFrame(event.target.value));
['animationFps', 'animationDuration'].forEach(id => document.querySelector(`#${id}`).addEventListener('change', () => {
  if (editorKeyframes.size) buildEditorClip(); else updateFrameEditor();
}));
document.querySelector('#animationName').addEventListener('change', () => { if (editorKeyframes.size) buildEditorClip(); });
window.addEventListener('keydown', event => {
  if (/input/i.test(event.target.tagName)) return;
  if (event.key.toLowerCase() === 'w') document.querySelector('[data-mode="translate"]').click();
  if (event.key.toLowerCase() === 'e') document.querySelector('[data-mode="rotate"]').click();
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'z') { event.preventDefault(); event.shiftKey ? redo() : undo(); }
});

function resize() {
  const width = viewport.clientWidth, height = viewport.clientHeight;
  if (!width || !height) return;
  camera.aspect = width / height; camera.updateProjectionMatrix(); renderer.setSize(width, height, false);
}
new ResizeObserver(resize).observe(viewport);
function animate() {
  requestAnimationFrame(animate);
  const delta = clock.getDelta();
  if (animationMixer && animationPlaying) animationMixer.update(delta);
  if (activeAction && animationPlaying) {
    document.querySelector('#animationTime').value = activeAction.time;
    document.querySelector('#currentTime').textContent = formatTime(activeAction.time);
  }
  orbit.update(); if (outline) outline.update(); renderer.render(scene, camera);
}
setModel(createDemoModel(), 'کاراکتر نمونه');
resize(); animate();
