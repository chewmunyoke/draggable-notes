<template>
	<header class="header" :class="headerClass">
		<h1>{{ text.appTitle }}</h1>
		<span class="message">{{ text.appMessage }}</span>
		<button class="dragger-switch"
			:class="draggerButtonClass"
			@click="draggerClickHandler">
			Switch view
		</button>
	</header>
</template>

<script>
	import { mapState, mapGetters, mapActions } from 'vuex';

	export default {
		computed: {
			...mapState([
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
