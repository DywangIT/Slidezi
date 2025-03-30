function Slidezi(selector, options = {}) {
    this.opt = {
        items: 1,
        loop: false,
        speed: 300,
        nav: true,
        ...options
    };

    this.container = document.querySelector(selector);
    if (!this.container) {
        console.error(`Slidezi: Container '${selector}' not found!`);
        return;
    }
    this.container.classList.add("slidezi-wrapper");

    this.slides = Array.from(this.container.children);
    this.origLength = this.slides.length;

    this._init();
    if (this.opt.loop) {
        setInterval(() => {
            this._moveSlide(1);
        }, 3000);
    }
}

Slidezi.prototype._init = function () {
    this.content = document.createElement("div"); // includes track and buttons
    this.content.classList.add("slidezi-content");

    this.track = document.createElement("div"); // track
    this.track.classList.add("slidezi-track");

    if (this.opt.loop) {
        const clone = (arr) => arr.map((node) => node.cloneNode(true));
        this.slides = [
            ...clone(this.slides.slice(-this.opt.items)),
            ...this.slides,
            ...clone(this.slides.slice(0, this.opt.items))
        ];
    }

    this.slides.forEach((slide) => {
        slide.classList.add("slidezi-slide");
        slide.style.flexBasis = 100 / this.opt.items + "%";
        this.track.appendChild(slide);
    });
    this.content.appendChild(this.track);

    this._createNavBtns(); // create
    this.firstIndex = this.opt.loop ? this.opt.items : 0;

    this.dots = document.createElement("div"); // create
    this.dots.classList.add("slidezi-dots");

    for (let i = 0; i < this.origLength; i++) {
        const dot = document.createElement("button"); // create
        dot.classList.add("slidezi-dot");
        this.dots.appendChild(dot);

        dot.onclick = () => {
            this.firstIndex = this.opt.loop
                ? i + this.opt.items
                : Math.min(i, this.origLength - this.opt.items);

            this._updatePosition();
        };
    }
    this.container.append(this.content, ...(this.opt.nav ? [this.dots] : []));

    this._updatePosition();
};

Slidezi.prototype._createNavBtns = function () {
    ["<", ">"].forEach((txt, i) => {
        const btn = document.createElement("button"); // create
        (btn.textContent = txt),
            btn.classList.add(`slidezi-${i ? "next" : "prev"}`);
        btn.onclick = () => this._moveSlide(i ? 1 : -1);
        this.content.appendChild(btn);
    });
};

Slidezi.prototype._moveSlide = function (step) {
    if (!this.opt.loop) {
        this.firstIndex = Math.min(
            Math.max(this.firstIndex + step, 0),
            this.slides.length - this.opt.items
        );
        this._updatePosition();
    } else {
        if (this._isAnimating) return;
        this._isAnimating = true;

        this.firstIndex += step;
        this._updatePosition();

        this.track.ontransitionend = () => {
            if (this.firstIndex === 0) {
                this.firstIndex = this.slides.length - this.opt.items * 2;
                this._updatePosition(true);
            } else if (
                this.firstIndex ===
                this.slides.length - this.opt.items
            ) {
                this.firstIndex = this.opt.items;
                this._updatePosition(true);
            }
            this._isAnimating = false;
        };
    }
};

Slidezi.prototype._updatePosition = function (instant = false) {
    this.track.style.transition = instant
        ? "none"
        : `transform ease ${this.opt.speed}ms`;
    const offsetLeft = (-this.firstIndex * 100) / this.opt.items + "%";
    this.track.style.transform = `translateX(${offsetLeft})`;

    const dotList = Array.from(this.dots.children);
    dotList.forEach((dot) => dot.classList.remove("active"));

    for (let i = 0; i < this.opt.items; i++) {
        const idx = i + this.firstIndex;
        const dotIdx = this.opt.loop
            ? idx < this.opt.items
                ? idx + this.origLength - this.opt.items
                : idx >= this.origLength + this.opt.items
                ? idx - this.origLength - this.opt.items
                : idx - this.opt.items
            : idx;

        dotList[dotIdx].classList.add("active");
    }
};
