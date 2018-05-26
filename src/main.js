import Vue from 'vue';
import store from './store';
import AppComponent from './components/app.vue';

new Vue({
	el: '#app',
	store,
	render: function(createElement) {
		return createElement(AppComponent);
	}
});
