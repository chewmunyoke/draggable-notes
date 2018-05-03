<template id="header-component">
	<header id="header" class="header" :class="headerClass">
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
		props: ['state'],
		data() {
			return {
				appTitle: 'Draggable Notes',
				appMessage: 'This mobile version does not have the slideshow switch'
			}
		},
		computed: {
			headerClass: function() {
				return {
					'hide': this.state.appIsShowContent
				};
			},
			draggerButtonClass: function() {
				return {
					'view-max': this.state.draggerButtonIsToggled
				}
			}
		},
		methods: {
			draggerClickHandler: function(event) {
				app.toggle();
			}
		}
	}
</script>
