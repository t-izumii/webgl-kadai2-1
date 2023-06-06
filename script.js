// 必要なモジュールを読み込み
import * as THREE from './lib/three.module.js';
import { OrbitControls } from './lib/OrbitControls.js';

// DOM がパースされたことを検出するイベントで App3 クラスをインスタンス化する
window.addEventListener('DOMContentLoaded', () => {
  const app = new App3();
  app.init();
  app.render();
}, false);

/**
 * three.js を効率よく扱うために自家製の制御クラスを定義
 */
class App3 {
  /**
   * カメラ定義のための定数
   */
  static get CAMERA_PARAM() {
    return {
      fovy: 60,
      aspect: window.innerWidth / window.innerHeight,
      near: 0.1,
      far: 20.0,
      x: 8.0,
      y: 8.0,
      z: 10.0,
      lookAt: new THREE.Vector3(0.0, 0.0, 0.0),
    };
  }

  /**
   * レンダラー定義のための定数
   */
  static get RENDERER_PARAM() {
    return {
      clearColor: 0xcccccc,
      width: window.innerWidth,
      height: window.innerHeight,
    };
  }

  /**
   * ディレクショナルライト定義のための定数
   */
  static get DIRECTIONAL_LIGHT_PARAM() {
    return {
      color: 0xffffff, // 光の色
      intensity: 1.0,  // 光の強度
      x: 1.0,          // 光の向きを表すベクトルの X 要素
      y: 1.0,          // 光の向きを表すベクトルの Y 要素
      z: 1.0           // 光の向きを表すベクトルの Z 要素
    };
  }

  /**
   * アンビエントライト定義のための定数
   */
  static get AMBIENT_LIGHT_PARAM() {
    return {
      color: 0xffffff, // 光の色
      intensity: 0.2,  // 光の強度
    };
  }
  /**
   * マテリアル定義のための定数
   */
  static get MATERIAL_PARAM() {
    return {
      color: 0x3399ff, // マテリアルの基本色
    };
  }

  /**
   * フォグの定義のための定数
   */
  static get FOG_PARAM() {
    return {
      fogColor: 0xffffff, // フォグの色
      fogNear: 10.0,      // フォグの掛かり始めるカメラからの距離
      fogFar: 20.0        // フォグが完全に掛かるカメラからの距離
    };
  }

  /**
   * コンストラクタ
   * @constructor
   */
  constructor() {
    this.renderer;         // レンダラ
    this.scene;            // シーン
    this.camera;           // カメラ
    this.directionalLight; // ディレクショナルライト
    this.ambientLight;     // アンビエントライト
    this.material;         // マテリアル
    this.boxGeometry;      // ボックスジオメトリ
    this.cylinderGeometryWing  // サークルジオメトリ
    this.cylinderGeometryWingLod  // サークルジオメトリ
    this.cylinderGeometryMoter  // サークルジオメトリ
    this.cylinderGeometryLod  // サークルジオメトリ
    this.cylinderGeometryStand  // サークルジオメトリ
    this.controls;         // オービットコントロール
    this.axesHelper;       // 軸ヘルパー
    this.groupWing;            // グループ
    this.groupHead;            // グループ
    this.groupAll;            // グループ
    this.currentSpeed

    // 再帰呼び出しのための this 固定
    this.render = this.render.bind(this);

    // リサイズイベント
    window.addEventListener('resize', () => {
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
    }, false);
  }


  /**
   * 初期化処理
   */
  init() {
    // レンダラー
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setClearColor(new THREE.Color(App3.RENDERER_PARAM.clearColor));
    this.renderer.setSize(App3.RENDERER_PARAM.width, App3.RENDERER_PARAM.height);
    const wrapper = document.querySelector('#webgl');
    wrapper.appendChild(this.renderer.domElement);

    // シーンとフォグ
    this.scene = new THREE.Scene();
    // this.scene.fog = new THREE.Fog(
    //   App3.FOG_PARAM.fogColor,
    //   App3.FOG_PARAM.fogNear,
    //   App3.FOG_PARAM.fogFar
    // );

    // カメラ
    this.camera = new THREE.PerspectiveCamera(
      App3.CAMERA_PARAM.fovy,
      App3.CAMERA_PARAM.aspect,
      App3.CAMERA_PARAM.near,
      App3.CAMERA_PARAM.far,
    );
    this.camera.position.set(
      App3.CAMERA_PARAM.x,
      App3.CAMERA_PARAM.y,
      App3.CAMERA_PARAM.z,
    );
    this.camera.lookAt(App3.CAMERA_PARAM.lookAt);

    // ディレクショナルライト（平行光源）
    this.directionalLight = new THREE.DirectionalLight(
      App3.DIRECTIONAL_LIGHT_PARAM.color,
      App3.DIRECTIONAL_LIGHT_PARAM.intensity
    );
    this.directionalLight.position.set(
      App3.DIRECTIONAL_LIGHT_PARAM.x,
      App3.DIRECTIONAL_LIGHT_PARAM.y,
      App3.DIRECTIONAL_LIGHT_PARAM.z,
    );
    this.scene.add(this.directionalLight);

    // アンビエントライト（環境光）
    this.ambientLight = new THREE.AmbientLight(
      App3.AMBIENT_LIGHT_PARAM.color,
      App3.AMBIENT_LIGHT_PARAM.intensity,
    );
    this.scene.add(this.ambientLight);

    //material
    this.material = new THREE.MeshPhongMaterial(App3.MATERIAL_PARAM);

    // geometry
    this.boxGeometry = new THREE.BoxGeometry(1.0 ,0.1 ,2.0);
    this.cylinderGeometryWing = new THREE.CylinderGeometry(0.75 ,0.75 ,0.5, 32);
    this.cylinderGeometryWingLod = new THREE.CylinderGeometry(0.25 ,0.25 , 1.0, 32);
    this.cylinderGeometryMoter = new THREE.CylinderGeometry(1.0 ,1.0 , 1.0, 32);
    this.cylinderGeometryLod = new THREE.CylinderGeometry(0.25 ,0.25 , 5.0, 32);
    this.cylinderGeometryStand = new THREE.CylinderGeometry(2.0 ,2.0 , 0.125, 32);

    // group
    this.groupWing = new THREE.Group();
    this.groupHead = new THREE.Group();
    this.groupAll = new THREE.Group();

    // mesh
// mesh
const NUM_WINGS = 3; // 羽根の数
const RADIUS = 1.5; // 原点からの距離

for (let i = 0; i < NUM_WINGS; i++) {
  const wing = new THREE.Mesh(this.boxGeometry, this.material);

  // 角度をラジアンに変換
  const angle = i * 360 / NUM_WINGS * Math.PI / 180;

  // 直交座標への変換
  const x = RADIUS * Math.sin(angle);
  const z = RADIUS * Math.cos(angle);

  wing.position.set(x, 0, z);
  wing.rotation.set(0, angle, 0);

  // グループに対して羽根を追加
  this.groupWing.add(wing);
}

const wingCy = new THREE.Mesh(this.cylinderGeometryWing, this.material);
this.groupWing.add(wingCy);
const wingLod = new THREE.Mesh(this.cylinderGeometryWingLod, this.material);
wingLod.position.set(0.0, -0.75, 0.0);
this.groupWing.add(wingLod);
this.groupWing.position.set(0.0 , 1.5, 0.0);

const moter = new THREE.Mesh(this.cylinderGeometryMoter, this.material);
moter.position.set(0.0, 0.0, 0.0);
this.groupHead.add(moter);

this.groupHead.add(this.groupWing);
this.groupHead.rotation.x = 90 * Math.PI / 180;
this.groupAll.add(this.groupHead);

const lod = new THREE.Mesh(this.cylinderGeometryLod, this.material);
lod.position.set(0.0 , -3.0, 0.0);
this.groupAll.add(lod);

const stand = new THREE.Mesh(this.cylinderGeometryStand, this.material);
stand.position.set(0.0 , -5.5, 0.0);
this.groupAll.add(stand);
this.groupAll.position.set( 0.0, 3.0, 0.0)


// グループをシーンに追加
this.scene.add(this.groupAll);


    // コントロール
    // this.controls = new OrbitControls(this.camera, this.renderer.domElement);

    // ヘルパー
    // const axesBarLength = 5.0;
    // this.axesHelper = new THREE.AxesHelper(axesBarLength);
    // this.scene.add(this.axesHelper);

    this.LIMIT = 1.0;
    this.rotationDirection = 1;

    this.SPEEDH = 0.75;
    this.SPEEDM = 0.5;
    this.SPEEDL = 0.25;
    this.currentSpeed = this.SPEEDM

    // ボタンのクリックイベントリスナーを追加
    const highButton = document.getElementById("high");
    highButton.addEventListener("click", () => {
      this.currentSpeed = this.SPEEDH
    });

    const mediumButton = document.getElementById("medium");
    mediumButton.addEventListener("click", () => {
      this.currentSpeed = this.SPEEDM
    });

    const lowButton = document.getElementById("low");
    lowButton.addEventListener("click", () => {
      this.currentSpeed = this.SPEEDL
    });
}

// スピードの設定
// setSpeed(speed) {
//   this.currentSpeed = speed;
// }


  /**
   * 描画処理
   */
  render() {


    // 恒常ループ
    requestAnimationFrame(this.render);

    // コントロールを更新
    // this.controls.update();

    //groupを回転
    this.groupWing.rotation.y += -this.currentSpeed;

    if ( this.groupHead.rotation.z >= this.LIMIT || this.groupHead.rotation.z <= -this.LIMIT) {
      this.rotationDirection *= -1; // 方向を反転させる
    }
    this.groupHead.rotation.z += 0.005 * this.rotationDirection;


    // レンダラーで描画
    this.renderer.render(this.scene, this.camera);
  }
}

