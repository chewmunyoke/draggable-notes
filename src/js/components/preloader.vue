<template>
	<transition name="v-overlay">
		<div class="overlay" 
			v-show="status.isLoading">
			<div class="preloader">
				<div>
					<div></div>
				</div>
				<div>
					<div></div>
				</div>
				<div>
					<div></div>
				</div>
				<div>
					<div></div>
				</div>
				<div>
					<div></div>
				</div>
			</div>
		</div>
	</transition>
</template>

<script>
	import { mapState } from 'vuex';

	export default {
		computed: {
			...mapState([
				'status'
			])
		}
	};

</script>
