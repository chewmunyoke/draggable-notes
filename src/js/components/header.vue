<template>
	<header class="header" :class="headerClass">
		<h1>{{ appTitle }}</h1>
		<span class="message">{{ appMessage }}</span>
		<button class="dragger-switch"
			:class="draggerButtonClass"
			v-on:click="draggerClickHandler">
			Switch view
		</button>
	</header>
</template>

<script>
	export default {
		name: 'header-component',
		data() {
			return {
				appTitle: this.$store.state.appTitle,
				appMessage: this.$store.state.appMessage
			}
		},
		computed: {
			headerClass: function() {
				return {
					'hide': this.$store.state.status.appIsSwitchShow
				};
			},
			draggerButtonClass: function() {
				return {
					'view-max': this.$store.state.status.draggerButtonIsToggled
				}
			}
		},
		methods: {
			draggerClickHandler: function() {
				this.$store.commit('toggle');
			}
		}
	};
</script>
