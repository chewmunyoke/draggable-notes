<template>
	<section class="app" v-cloak>
		<header-component />
		<slideshow-component />
		<preloader-component />
	</section>
</template>

<script>
	import { mapState } from 'vuex';
	import HeaderComponent from './header.vue';
	import SlideshowComponent from './slideshow.vue';
	import PreloaderComponent from './preloader.vue';

	export default {
		components: {
			HeaderComponent,
			SlideshowComponent,
			PreloaderComponent
		},
		mounted: function() {
			let app = this;
			let elements = {
				slideshow: this.$el.querySelector('.slideshow'),
				dragger: this.$el.querySelector('.dragger'),
				handle: this.$el.querySelector('.handle')
			};
			window.elements = elements;

			this.$store.dispatch('fetchData').then(function() {
				app.$store.dispatch('initElements', 1).then(function() {
					app.$store.dispatch('initEvents');
				});
			});
		}
	};

</script>
