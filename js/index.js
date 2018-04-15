(function() {
	var toggleBtn = function() {
		if (slideshow.isFullscreen) {
			classie.add(btnSwitch, 'view-maxi');
		} else {
			classie.remove(btnSwitch, 'view-maxi');
		}
	},
	toggleCtrls = function() {
		if (!slideshow.isContent) {
			classie.add(header, 'hide');
		}
	},
	toggleCompleteCtrls = function() {
		if (!slideshow.isContent) {
			classie.remove(header, 'hide');
		}
	},
	toggleSlideshow = function() {
		slideshow.toggle();
		toggleBtn();
	},
	slideshow = new DragSlideshow(document.querySelector('.slideshow'), {
		// Toggle between fullscreen & minimized slideshow
		onToggle: toggleBtn,
		// Toggle the main image & the content view
		onToggleContent: toggleCtrls,
		// Toggle the main image & the content view
		// (triggered after the animation ends)
		onToggleContentComplete: toggleCompleteCtrls
	}),
	btnSwitch = document.querySelector('button.slider-switch');
	btnSwitch.addEventListener('click', toggleSlideshow);

	document.querySelectorAll('.subtitle').forEach(function(el) {
		el.innerHTML += moment().startOf('year').fromNow();
	});
} ());
