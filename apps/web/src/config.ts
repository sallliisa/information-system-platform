import mode from "./mode"

const config = {
  name: '',
  company: '',
  mode: 'EARLY_DEVELOPMENT',
  server: {
    development: 'https://trom2.hakaaston.co.id/api/',
    production: 'https://api-staging.danantara.id',
  },
  maps_api_key: {
    staging: 'AIzaSyA8VZDyjfQAW_IYWWx23whJ4LXhxTuzjKE',
    staging_hka: 'AIzaSyA8VZDyjfQAW_IYWWx23whJ4LXhxTuzjKE',
    development: 'AIzaSyA8VZDyjfQAW_IYWWx23whJ4LXhxTuzjKE',
    production: 'AIzaSyCl6I0MNIE8qT0LCM-eTu_1brcJyg0s278',
    production_v2: 'AIzaSyCl6I0MNIE8qT0LCM-eTu_1brcJyg0s278',
    demo: 'AIzaSyCl6I0MNIE8qT0LCM-eTu_1brcJyg0s278',
  },
  download: {
    android: 'https://play.google.com/store/',
    ios: 'https://www.apple.com/id/app-store/',
  },
  keys: {
    GOOGLE_OAUTH_CLIENT_ID: '1079256465255-m31t3imu19agomp32ban47lshtru6pdn.apps.googleusercontent.com',
    APP_ACCESS_USER: 'tulen_admins',
  },
}
// =========================================================
// File CUSTOM Variable SCSS
// static\assets\sass\components\_variables.demo.scss
// =========================================================

export default config
