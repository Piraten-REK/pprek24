function innerWidth(element) {
    const outerWidth = element.clientWidth;
    const styles = getComputedStyle(element);
    const borderInline = [styles.borderInlineStartWidth, styles.borderInlineEndWidth]
        .reduce((prev, cur) => prev + parseFloat(cur), 0);
    const paddingInline = [styles.paddingInlineStart, styles.paddingInlineEnd]
        .reduce((prev, cur) => prev + parseFloat(cur), 0);
    return outerWidth - borderInline - paddingInline;
}
function em(element, value) {
    const em1 = parseFloat(getComputedStyle(element).fontSize);
    return value * em1;
}
function rem(value) {
    return em(document.documentElement, value);
}

var AriaAttributes;
(function (AriaAttributes) {
    AriaAttributes["ARIA_CONTROLS"] = "aria-controls";
    AriaAttributes["ARIA_EXPANDED"] = "aria-expanded";
    AriaAttributes["ARIA_HASPOPUP"] = "aria-haspopup";
})(AriaAttributes || (AriaAttributes = {}));
function toggleExpanded(element) {
    const current = element.getAttribute(AriaAttributes.ARIA_EXPANDED) === 'true';
    const newValue = !current;
    element.setAttribute(AriaAttributes.ARIA_EXPANDED, newValue.toString());
    return newValue;
}
function setExpanded(element, value) {
    element.setAttribute(AriaAttributes.ARIA_EXPANDED, value.toString());
}

/**
 * Returns the owner document of a given element.
 * 
 * @param node the element
 */
function ownerDocument(node) {
  return node && node.ownerDocument || document;
}

var canUseDOM = !!(typeof window !== 'undefined' && window.document && window.document.createElement);

/* eslint-disable no-return-assign */
var optionsSupported = false;
var onceSupported = false;

try {
  var options = {
    get passive() {
      return optionsSupported = true;
    },

    get once() {
      // eslint-disable-next-line no-multi-assign
      return onceSupported = optionsSupported = true;
    }

  };

  if (canUseDOM) {
    window.addEventListener('test', options, options);
    window.removeEventListener('test', options, true);
  }
} catch (e) {
  /* */
}

/* https://github.com/component/raf */
var prev = new Date().getTime();

function fallback(fn) {
  var curr = new Date().getTime();
  var ms = Math.max(0, 16 - (curr - prev));
  var handle = setTimeout(fn, ms);
  prev = curr;
  return handle;
}

var vendors = ['', 'webkit', 'moz', 'o', 'ms'];
var rafImpl = fallback; // eslint-disable-next-line import/no-mutable-exports

var getKey = function getKey(vendor, k) {
  return vendor + (!vendor ? k : k[0].toUpperCase() + k.substr(1)) + "AnimationFrame";
};

if (canUseDOM) {
  vendors.some(function (vendor) {
    var rafMethod = getKey(vendor, 'request');

    if (rafMethod in window) {
      getKey(vendor, 'cancel'); // @ts-ignore

      rafImpl = function rafImpl(cb) {
        return window[rafMethod](cb);
      };
    }

    return !!rafImpl;
  });
}

Function.prototype.bind.call(Function.prototype.call, [].slice);

Function.prototype.bind.call(Function.prototype.call, [].slice);

function handleOutsideClick(element, eventHandler) {
    const doc = ownerDocument(element);
    doc.addEventListener('click', eventHandler, true);
    return () => removeEventListener('click', eventHandler);
}

class SiteNav {
    headerPadding;
    header = document.querySelector('body > .site-header');
    siteTitle = document.querySelector('body > .site-header > .site-title');
    toggle = document.querySelector('body > .site-header > .site-nav-toggle');
    nav = document.querySelector('body > .site-header > .site-nav');
    list = document.querySelector('body > .site-header > .site-nav > ul');
    structure = this.getStructure();
    navWidth = this.nav.clientWidth;
    #mobile = false;
    #indices = [];
    constructor(headerPadding = rem(4)) {
        this.headerPadding = headerPadding;
        window.addEventListener('resize', this.navWatcher());
        this.toggle.addEventListener('click', () => {
            const state = this.toggleOpen();
            if (state) {
                this.structure[0].element.focus();
            }
        });
        this.addClickListeners();
        this.list.addEventListener('keydown', this.keyboardListener.bind(this));
    }
    get mobile() {
        return this.#mobile;
    }
    set mobile(value) {
        if (value !== this.#mobile) {
            this.#mobile = value;
            document.body.setAttribute('data-mobile-nav', value.toString());
            for (const elem of this.firstLevelElements()) {
                if (value) {
                    elem.setAttribute('tabindex', '-1');
                }
                else {
                    elem.removeAttribute('tabindex');
                }
            }
        }
    }
    get open() {
        return this.#indices.length > 0;
    }
    set open(value) {
        if (value !== this.open) {
            this.#indices = [0];
            setExpanded(this.toggle, value);
            if (!value) {
                let current = this.current;
                while (current != null) {
                    setExpanded(current.toggle, false);
                    this.#indices.pop();
                    current = this.current;
                }
            }
        }
    }
    get closed() {
        return !this.open;
    }
    set closed(value) {
        if (value === this.open) {
            setExpanded(this.toggle, !value);
            if (value) {
                let current = this.current;
                while (current != null) {
                    setExpanded(current.toggle, false);
                    this.#indices.pop();
                    current = this.current;
                }
            }
        }
    }
    get indices() {
        return [...this.#indices];
    }
    get current() {
        if (this.#indices.length === 0) {
            return undefined;
        }
        let structure = this.structure;
        const idx = this.indices;
        const lastIndex = idx.pop();
        while (idx.length > 0) {
            structure = structure[idx.shift()].items;
        }
        return structure[lastIndex];
    }
    toggleOpen() {
        this.open = this.closed;
        return this.open;
    }
    navWatcher() {
        const headerWidth = innerWidth(this.header);
        const titleWidth = this.siteTitle.clientWidth;
        const delta = headerWidth - titleWidth - this.headerPadding;
        this.mobile = this.navWidth > delta;
        return this.navWatcher.bind(this);
    }
    addClickListeners(structure = this.structure, index = []) {
        for (let idx = 0, item = structure[0]; idx < structure.length; item = structure[++idx]) {
            if (item.type === 'item') {
                continue;
            }
            item.element.addEventListener('click', () => {
                const state = toggleExpanded(item.element);
                if (state) {
                    const current = this.current;
                    if (this.#indices.length > 1 && current != null) {
                        setExpanded(current.toggle, false);
                    }
                    item.items[0].element.focus();
                    this.#indices = [...index, idx, 0];
                }
                else {
                    item.element.focus();
                    this.#indices = [...index, idx];
                }
            });
            this.addClickListeners(item.items, [...index, idx]);
        }
        handleOutsideClick(this.list, event => {
            if (this.closed) {
                return;
            }
            let node = event.target;
            while (node != null && node.nodeType !== Node.DOCUMENT_NODE) {
                if (node === this.list || node === this.toggle) {
                    return;
                }
                node = node.parentElement;
            }
            this.closed = true;
        });
    }
    keyboardListener(event) {
        if (this.indices.length === 0) {
            this.setIndicesByElement(event.target);
        }
        if (event.key === 'Tab' && !event.shiftKey) {
            if (this.indices.length === 1) {
                if (this.mobile) {
                    event.preventDefault();
                    this.incrementIndex();
                    this.current?.element?.focus();
                }
                else {
                    if (this.indices[0] === this.structure.length - 1) {
                        this.closed = true;
                    }
                    else {
                        this.incrementIndex(false);
                    }
                }
            }
            else {
                event.preventDefault();
                this.incrementIndex();
                this.current?.element?.focus();
            }
        }
        else if (event.key === 'Tab' && event.shiftKey) {
            if (this.indices.length === 1) {
                if (this.mobile) {
                    event.preventDefault();
                    this.decrementIndex();
                    this.current?.element?.focus();
                }
                else {
                    if (this.indices[0] === 0) {
                        this.closed = true;
                    }
                    else {
                        this.decrementIndex(false);
                    }
                }
            }
            else {
                event.preventDefault();
                this.decrementIndex();
                this.current?.element?.focus();
            }
        }
        else if (event.key === 'Enter' || event.code === 'Space') {
            if (this.current?.type === 'toggle') {
                event.preventDefault();
                setExpanded(this.current.element, true);
                this.current.items[0].element.focus();
                this.#indices.push(0);
            }
        }
        else if (event.key === 'Escape') {
            if (!this.mobile && this.#indices.length === 1) {
                return;
            }
            setExpanded(this.current?.toggle, false);
            this.current?.toggle?.focus();
            this.#indices.pop();
        }
        else if (event.key === 'ArrowUp') {
            if (!this.mobile && this.#indices.length === 1) {
                return;
            }
            event.preventDefault();
            this.decrementIndex();
            this.current?.element?.focus();
        }
        else if (event.key === 'ArrowDown') {
            if (!this.mobile && this.#indices.length === 1) {
                if (this.current?.type === 'toggle') {
                    event.preventDefault();
                    setExpanded(this.current.element, true);
                    this.current.items[0].element.focus();
                    this.#indices.push(0);
                }
                return;
            }
            event.preventDefault();
            this.incrementIndex();
            this.current?.element?.focus();
        }
        else if (event.key === 'ArrowRight') {
            event.preventDefault();
            if (this.current?.type !== 'toggle') {
                return;
            }
            else if (!this.mobile && this.indices.length === 1) {
                this.incrementIndex();
                this.current?.element?.focus();
                return;
            }
            setExpanded(this.current.element, true);
            this.current.items[0].element.focus();
            this.#indices.push(0);
        }
        else if (event.key === 'ArrowLeft') {
            event.preventDefault();
            if (!this.mobile && this.indices.length === 1) {
                this.decrementIndex();
                this.current?.element?.focus();
                return;
            }
            setExpanded(this.current?.toggle, false);
            this.current?.toggle?.focus();
            this.#indices.pop();
        }
    }
    incrementIndex(overflow = true) {
        if (overflow) {
            let structure = this.structure;
            const idx = this.indices.slice(0, -1);
            while (idx.length > 0) {
                structure = structure[idx.shift()].items;
            }
            this.#indices[this.#indices.length - 1] = (this.#indices[this.#indices.length - 1] + structure.length + 1) % structure.length;
        }
        else {
            this.#indices[this.#indices.length - 1]++;
        }
    }
    decrementIndex(overflow = true) {
        if (overflow) {
            let structure = this.structure;
            const idx = this.indices.slice(0, -1);
            while (idx.length > 0) {
                structure = structure[idx.shift()].items;
            }
            this.#indices[this.#indices.length - 1] = (this.#indices[this.#indices.length - 1] + structure.length - 1) % structure.length;
        }
        else {
            this.#indices[this.#indices.length - 1]--;
        }
    }
    setIndicesByElement(element, structure = this.structure, index = []) {
        for (let idx = 0, item = structure[0]; idx < structure.length; item = structure[++idx]) {
            if (item.element === element) {
                this.#indices = [...index, idx];
                return true;
            }
            if (item.type === 'toggle') {
                if (this.setIndicesByElement(item.element, item.items, [...index, idx])) {
                    return true;
                }
            }
        }
        return false;
    }
    *firstLevelElements(list = this.list) {
        for (const child of Array.from(list.children)) {
            for (const grandchild of Array.from(child.children)) {
                if (grandchild instanceof HTMLAnchorElement || grandchild instanceof HTMLButtonElement) {
                    yield grandchild;
                }
            }
        }
    }
    getStructure(list = this.list, toggle = this.toggle) {
        const structure = [];
        for (const item of this.firstLevelElements(list)) {
            const hasPopup = item.getAttribute(AriaAttributes.ARIA_EXPANDED) != null;
            if (hasPopup) {
                const controls = item.getAttribute(AriaAttributes.ARIA_CONTROLS);
                if (controls == null) {
                    throw new ReferenceError(`${AriaAttributes.ARIA_CONTROLS} unset`);
                }
                const subMenu = list.querySelector(`#${controls}`);
                if (subMenu == null) {
                    throw new ReferenceError(`${AriaAttributes.ARIA_CONTROLS} "${controls}" invalid`);
                }
                structure.push({
                    type: 'toggle',
                    element: item,
                    list: subMenu,
                    toggle,
                    items: this.getStructure(subMenu, item)
                });
            }
            else {
                structure.push({
                    type: 'item',
                    element: item,
                    list,
                    toggle
                });
            }
        }
        return Object.freeze(structure);
    }
}

new SiteNav();
//# sourceMappingURL=app.js.map
