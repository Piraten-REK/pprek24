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

function use(it, callback) {
    return callback(it);
}

class SiteNav {
    headerPadding;
    static header = document.querySelector('body > .site-header');
    static siteTitle = document.querySelector('body > .site-header > .site-title');
    static toggle = document.querySelector('body > .site-header > .site-nav-toggle');
    static nav = document.querySelector('body > .site-header > .site-nav');
    static list = document.querySelector('body > .site-header > .site-nav > ul');
    static structure = SiteNav.getStructure();
    static navWidth = SiteNav.nav.clientWidth;
    #mobile = false;
    #open = false;
    #indices = [];
    constructor(headerPadding = rem(4)) {
        this.headerPadding = headerPadding;
        window.addEventListener('resize', this.navWatcher());
        this.addClickListeners();
    }
    get mobile() {
        return this.#mobile;
    }
    set mobile(value) {
        if (value !== this.#mobile) {
            this.#mobile = value;
            document.body.setAttribute('data-mobile-nav', value.toString());
            for (const elem of SiteNav.firstLevelElements()) {
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
        return this.#open;
    }
    set open(value) {
        if (value !== this.open) {
            this.#open = value;
            setExpanded(SiteNav.toggle, value);
        }
    }
    get closed() {
        return !this.#open;
    }
    set closed(value) {
        if (value === this.#open) {
            this.#open = !value;
            setExpanded(SiteNav.toggle, !value);
        }
    }
    get indices() {
        return [...this.#indices];
    }
    get current() {
        if (this.#indices.length === 0) {
            return undefined;
        }
        let structure = SiteNav.structure;
        const idx = this.indices;
        const lastIndex = idx.pop();
        while (idx.length > 0) {
            structure = structure[idx.shift()].items;
        }
        return structure[lastIndex];
    }
    navWatcher() {
        const headerWidth = innerWidth(SiteNav.header);
        const titleWidth = SiteNav.siteTitle.clientWidth;
        const delta = headerWidth - titleWidth - this.headerPadding;
        this.mobile = SiteNav.navWidth > delta;
        return this.navWatcher.bind(this);
    }
    addClickListeners(structure = SiteNav.structure, index = []) {
        for (let idx = 0, item = structure[0]; idx < structure.length; item = structure[++idx]) {
            if (item.type === 'item') {
                continue;
            }
            item.element.addEventListener('click', () => {
                const state = toggleExpanded(item.element);
                if (state) {
                    const current = this.current;
                    if (current != null) {
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
    }
    static *firstLevelElements(list = SiteNav.list) {
        for (const child of Array.from(list.children)) {
            for (const grandchild of Array.from(child.children)) {
                if (grandchild instanceof HTMLAnchorElement || grandchild instanceof HTMLButtonElement) {
                    yield grandchild;
                }
            }
        }
    }
    static getStructure(list = SiteNav.list, toggle = SiteNav.toggle) {
        const structure = [];
        for (const item of SiteNav.firstLevelElements(list)) {
            const hasPopup = use(item.getAttribute(AriaAttributes.ARIA_HASPOPUP), it => it != null && it !== 'false');
            if (hasPopup) {
                const controls = item.getAttribute(AriaAttributes.ARIA_CONTROLS);
                if (controls == null) {
                    throw new ReferenceError(`${AriaAttributes.ARIA_CONTROLS} unset`);
                }
                const subMenu = list.querySelector(`#${controls}`);
                console.log(controls, subMenu, list);
                if (subMenu == null) {
                    throw new ReferenceError(`${AriaAttributes.ARIA_CONTROLS} "${controls}" invalid`);
                }
                structure.push({
                    type: 'toggle',
                    element: item,
                    list: subMenu,
                    toggle,
                    items: SiteNav.getStructure(subMenu, item)
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

const siteNav = new SiteNav();
console.log(siteNav);
//# sourceMappingURL=app.js.map
