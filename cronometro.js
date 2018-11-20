/* global $:true */
import Constants from './constants';
import utils from './utils';

class Timer {
	/**
	 * Constructor del cronometro
	 * @param  {Object} element
	 * @param  {Object|String} config
	 */
	constructor(element, config) {
		this.element = element;
		this.originalConfig = $.extend({}, config);
		this.totalSeconds = 0;
		this.intervalId = null;
		this.html = 'html';
		if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
			// Metodo para mostrar informacion
			this.html = 'val';
		}

		this.config = utils.getDefaultConfig();

		if (config.duration) {
			config.duration = utils.durationTimeToSeconds(config.duration);
		}

		if (typeof config !== 'string') {
			this.config = $.extend(this.config, config);
		}

		if (this.config.seconds) {
			this.totalSeconds = this.config.seconds;
		}

		if (this.config.editable) {
			utils.makeEditable(this);
		}

		this.startTime = utils.unixSeconds() - this.totalSeconds;

		if (this.config.duration && this.config.repeat && this.config.updateFrequency < 1000) {
			this.config.updateFrequency = 1000;
		}

		// Configuracion de la cuenta regresiva
		if (this.config.countdown) {
			if (!this.config.duration) {
				throw new Error('La cuenta regresiva no tiene configuracion de inicio!');
			}

			if (this.config.editable) {
				throw new Error('No se pudo establecer la cuenta regresiva!');
			}
			this.config.startTime = utils.unixSeconds() - this.config.duration;
			this.totalSeconds = this.config.duration;
		}
	}

	start() {
		if (this.state !== Constants.TIMER_RUNNING) {
			utils.setState(this, Constants.TIMER_RUNNING);
			this.render();
			this.intervalId = setInterval(utils.intervalHandler.bind(null, this), this.config.updateFrequency);
		}
	}

	pause() {
		if (this.state === Constants.TIMER_RUNNING) {
			utils.setState(this, Constants.TIMER_PAUSED);
			clearInterval(this.intervalId);
		}
	}

	resume() {
		if (this.state === Constants.TIMER_PAUSED) {
			utils.setState(this, Constants.TIMER_RUNNING);
			if (this.config.countdown) {
				this.startTime = utils.unixSeconds() - this.config.duration + this.totalSeconds;
			} else {
				this.startTime = utils.unixSeconds() - this.totalSeconds;
			}
			this.intervalId = setInterval(utils.intervalHandler.bind(null, this), this.config.updateFrequency);
		}
	}

	remove() {
		clearInterval(this.intervalId);
		$(this.element).data(Constants.PLUGIN_NAME, null);
	}

	reset() {
		let element = this.element;
		let originalConfig = this.originalConfig;
		this.remove();
		$(element).timer(originalConfig);
	}

	render() {
		if (this.config.format) {
			$(this.element)[this.html](utils.secondsToFormattedTime(this.totalSeconds, this.config.format));
		} else {
			$(this.element)[this.html](utils.secondsToPrettyTime(this.totalSeconds));
		}
		// Mostrar el tiempo que hace falta
		$(this.element).data('seconds', this.totalSeconds);
	}
}

export default Timer;
