<template id="slideshow-component">
	<div class="slideshow">
		<div class="dragdealer dragger">
			<div class="handle">
				<div class="slide">
					<div class="note">
						<div class="title-container">
							<span class="title"></span>
							<span class="subtitle"></span>
							<span class="timestamp"></span>
						</div>
						<div class="content">
						</div>
					</div>
					<div class="content-switch-container">
						<div class="content-switch-wrapper">
							<button class="content-switch"></button>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
	export default {
		props: ['state', 'options', 'note'],
		name: 'slideshow-component'
	}
</script>
