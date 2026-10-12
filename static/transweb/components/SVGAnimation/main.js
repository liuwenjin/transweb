webCpu.regComponent("SVGAnimation", {
	
}, function (container, data, task) {
	container.innerHTML = "";

	class SVGAnimationRenderer {
		constructor(container) {
			if (!(container instanceof HTMLElement)) {
				throw new Error("container 必须是 HTMLElement");
			}
			this.container = container;
			this.svg = null;
			this.target = null;
			this.animation = null;
		}

		clear() {
			if (this.animation) {
				this.animation.cancel();
				this.animation = null;
			}
			this.container.replaceChildren();
			this.svg = null;
			this.target = null;
		}

		render(dsl) {
			this.clear();

			const width = Number(dsl.width) || 200;
			const height = Number(dsl.height) || 200;
			const shape = dsl.shape || {};
			const animation = dsl.animation || {};

			// 原生 SVG，不使用 innerHTML，避免字符串 SVG 注入及命名空间问题。
			const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
			svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
			svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
			svg.setAttribute("role", "img");

			let target;

			if (shape.type === "rect") {
				target = document.createElementNS("http://www.w3.org/2000/svg", "rect");

				target.setAttribute("x", shape.x ?? 0);
				target.setAttribute("y", shape.y ?? 0);
				target.setAttribute("width", shape.width ?? 80);
				target.setAttribute("height", shape.height ?? 80);
				target.setAttribute("rx", shape.rx ?? 0);
				target.setAttribute("fill", shape.fill ?? "#ff4757");

				// 变换中心必须明确设置。
				// 原 Lottie 示例的缩放中心是图形自身中心附近。
				const cx = (Number(shape.x) || 0) + (Number(shape.width) || 80) / 2;
				const cy = (Number(shape.y) || 0) + (Number(shape.height) || 80) / 2;
				target.style.transformBox = "fill-box";
				target.style.transformOrigin = `${cx}px ${cy}px`;

				svg.appendChild(target);
			} else {
				throw new Error(`暂不支持 shape.type="${shape.type}"`);
			}

			this.container.appendChild(svg);

			this.svg = svg;
			this.target = target;

			this.play(dsl);

			return this;
		}

		play(dsl = svgAnimationDSL) {
			if (!this.target) return;

			if (this.animation) {
				this.animation.cancel();
			}

			const frames = (dsl.animation?.keyframes || []).map(frame => ({
				transform: frame.transform || "none",
				opacity: frame.opacity ?? 1
			}));

			this.animation = this.target.animate(
				frames,
				{
					duration: Number(dsl.animation?.duration) || 1000,
					iterations: dsl.animation?.loop ? Infinity : 1,
					easing: "ease-in-out",
					fill: "both"
				}
			);

			this.animation.play();
			setStatus("SVG 动画正在播放");
		}

		pause() {
			if (this.animation) {
				this.animation.pause();
				setStatus("已暂停");
			}
		}

		restart(dsl = svgAnimationDSL) {
			this.play(dsl);
		}

		destroy() {
			if (this.animation) {
				this.animation.cancel();
				this.animation = null;
			}
			this.clear();
		}
	}
	data = data || {};
	let player = new SVGAnimationRenderer(container).render(data);


});