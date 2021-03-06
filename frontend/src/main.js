import Vue from 'vue';
import App from './App.vue';
import { i18n } from './plugins/i18n';
import LoadScript from 'vue-plugin-load-script';
 
Vue.use(LoadScript);

Vue.config.productionTip = false;

new Vue({
  i18n, // include localization plugin as global variable. It accessible with 'this.$i18n'
  render: h => h(App),
}).$mount('#app');
