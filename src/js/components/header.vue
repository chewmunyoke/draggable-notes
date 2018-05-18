<template>
	<header class="header" :class="headerClass">
		<h1>{{ appTitle }}</h1>
		<span class="message">{{ appMessage }}</span>
		<button class="dragger-switch"
			:class="draggerButtonClass"
			@click="draggerClickHandler">
			Switch view
		</button>
	</header>
</template>

<script>
	import { mapState, mapGetters, mapMutations } from 'vuex';

	export default {
		computed: {
			...mapState([
				'appTitle',
				'appMessage'
			]),
			...mapGetters([
				'headerClass',
				'draggerButtonClass'
			])
		},
		methods: {
			...mapMutations([
				'draggerClickHandler'
			])
		}
	};
</script>
