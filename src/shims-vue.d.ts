declare module '*.vue' {
  import Vue from 'vue';
  export default Vue;
}
declare module "*.png" {
  const value: string;
  export default value;
}
declare module "*.mp3" {
  const value: string;
  export default value;
}

declare module 'howler' {
  const howler: any;
  export default howler;
}

declare module 'password-validator' {
  const passwordValidator: any;
  export default passwordValidator;
}

declare module 'phaser' {
  const Phaser: any;
  export default Phaser;
}
