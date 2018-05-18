<template>
	<section class="main" v-cloak>
		<header-component />
		<slideshow-component />
	</section>
</template>

<script>
	import { mapState } from 'vuex';
	import HeaderComponent from './header.vue';
	import SlideshowComponent from './slideshow.vue';

	export default {
		components: {
			HeaderComponent,
			SlideshowComponent
		},
		computed: {
			...mapState([
				'status',
				'user',
				'notes'
			])
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
