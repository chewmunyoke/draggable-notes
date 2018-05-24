<template>
	<header id="header" class="header" :class="headerClass">
		<div>
			<h1>{{ text.appName }}</h1>
			<span>{{ text.appMessage }}</span>
		</div>
		<div>
			<button class="dragger-switch" title="Switch view"
				:class="draggerButtonClass"
				@click="draggerClickHandler"
				v-if="!status.isEmpty">
			</button>
		</div>
	</header>
</template>

<script>
	import { mapState, mapGetters, mapActions } from 'vuex';

	export default {
		computed: {
			...mapState([
				'status',
				'text'
			]),
			...mapGetters([
				'headerClass',
				'draggerButtonClass'
			])
		},
		methods: {
			...mapActions([
				'draggerClickHandler'
			])
		}
	};
</script>
