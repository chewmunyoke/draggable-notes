<template>
	<transition name="v-fade">
				<header class="header"
					v-if="!status.slideIsShow">
					<div>
						<h1>
							{{ text.appName }}
						</h1>
						<span>
							{{ text.appMessage }}
						</span>
					</div>
					<div>
						<button title="Switch view"
							class="dragger-switch"
							:class="draggerButtonClass"
							@click="draggerClickHandler"
							v-if="!status.isEmpty">
						</button>
					</div>
					<transition name="v-fade">
						<div v-if="!status.slideIsShow && !status.draggerButtonIsToggled">
							<div class="button-wrapper note-add-wrapper">
								<p v-if="status.isEmpty">
									{{ text.emptyMessage }}
								</p>
								<button class="button note-add"
									@click="noteAddHandler">
									<span>
										{{ text.emptyButton }}
									</span>
								</button>
							</div>
						</div>
					</transition>
				</header>
			</transition>
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
				'draggerButtonClass'
			])
		},
		methods: {
			...mapActions([
				'draggerClickHandler',
				'noteAddHandler'
			])
		}
	};
</script>
