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

/**
 * An `addEventListener` ponyfill, supports the `once` option
 * 
 * @param node the element
 * @param eventName the event name
 * @param handle the handler
 * @param options event options
 */
function addEventListener(node, eventName, handler, options) {
  if (options && typeof options !== 'boolean' && !onceSupported) {
    var once = options.once,
        capture = options.capture;
    var wrappedHandler = handler;

    if (!onceSupported && once) {
      wrappedHandler = handler.__once || function onceHandler(event) {
        this.removeEventListener(eventName, onceHandler, capture);
        handler.call(this, event);
      };

      handler.__once = wrappedHandler;
    }

    node.addEventListener(eventName, wrappedHandler, optionsSupported ? options : capture);
  }

  node.addEventListener(eventName, handler, options);
}

/**
 * A `removeEventListener` ponyfill
 * 
 * @param node the element
 * @param eventName the event name
 * @param handle the handler
 * @param options event options
 */
function removeEventListener(node, eventName, handler, options) {
  var capture = options && typeof options !== 'boolean' ? options.capture : options;
  node.removeEventListener(eventName, handler, capture);

  if (handler.__once) {
    node.removeEventListener(eventName, handler.__once, capture);
  }
}

function listen(node, eventName, handler, options) {
  addEventListener(node, eventName, handler, options);
  return function () {
    removeEventListener(node, eventName, handler, options);
  };
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
    return listen(doc, 'click', eventHandler, true);
}

var AriaAttributes;
(function (AriaAttributes) {
    AriaAttributes["ARIA_CONTROLS"] = "aria-controls";
    AriaAttributes["ARIA_EXPANDED"] = "aria-expanded";
    AriaAttributes["ARIA_HASPOPUP"] = "aria-haspopup";
})(AriaAttributes || (AriaAttributes = {}));
function toggleExpanded(element) {
    const current = element.getAttribute(AriaAttributes.ARIA_EXPANDED) === 'true';
    const newValue = (!current).toString();
    element.setAttribute(AriaAttributes.ARIA_EXPANDED, newValue);
    return newValue;
}
function getExpanded(element) {
    return element.getAttribute(AriaAttributes.ARIA_EXPANDED) === 'true';
}
function setExpanded(element, value) {
    element.setAttribute(AriaAttributes.ARIA_EXPANDED, value.toString());
}

function getNearestFocusable(element, tags = ['li', '*'], depth = 0, arr = []) {
    if (depth >= tags.length) {
        return arr;
    }
    for (let idx = 0, child = element.children[0]; idx < element.children.length; child = element.children[++idx]) {
        if (tags[depth] === '*' || child.tagName.toLowerCase() === tags[depth].toLowerCase()) {
            if (depth === tags.length - 1) {
                if (child.getAttribute('tabindex') === '-1') {
                    arr.push(child);
                }
            }
            getNearestFocusable(child, tags, depth + 1, arr);
        }
    }
    return arr;
}
function setUpMenuStructure(menu, toggle) {
    const structure = [];
    for (const item of getNearestFocusable(menu)) {
        const hasPopup = item.getAttribute(AriaAttributes.ARIA_HASPOPUP);
        if (hasPopup != null && hasPopup !== 'false') {
            const controls = item.getAttribute(AriaAttributes.ARIA_CONTROLS);
            if (controls == null) {
                throw new Error();
            }
            const subMenu = menu.querySelector(`#${controls}`);
            if (subMenu == null) {
                throw new Error();
            }
            structure.push({
                type: 'toggle',
                element: item,
                list: subMenu,
                items: setUpMenuStructure(subMenu, item)
            });
        }
        else {
            structure.push({
                type: 'item',
                element: item,
                list: menu,
                toggle
            });
        }
    }
    return structure;
}
function getStructureAt(structure, indices) {
    const _indices = Array.from(indices);
    const index = _indices.shift();
    const subStructure = structure.at(index);
    if (_indices.length > 0) {
        return getStructureAt(subStructure.items, _indices);
    }
    else {
        return structure;
    }
}
function setClickHandlers(structure, currentIndex, depth = 0) {
    for (let idx = 0, entry = structure[0]; idx < structure.length; entry = structure[++idx]) {
        if (entry.type === 'item') {
            continue;
        }
        entry.element.addEventListener('click', () => {
            const state = toggleExpanded(entry.element);
            currentIndex[depth] = idx;
            if (state === 'true') {
                entry.items[0].element.focus();
                currentIndex[depth + 1] = 0;
            }
            else {
                entry.element.focus();
            }
        });
        setClickHandlers(entry.items, currentIndex, depth + 1);
    }
}
function setUpMenu(menu, toggle) {
    const structure = setUpMenuStructure(menu, toggle);
    const currentIndex = [];
    toggle.addEventListener('click', () => {
        const state = toggleExpanded(toggle);
        if (state === 'true') {
            structure[0].element.focus();
            currentIndex[0] = 0;
        }
        else {
            toggle.focus();
            delete currentIndex[0];
        }
    });
    setClickHandlers(structure, currentIndex);
    menu.addEventListener('keydown', event => {
        const current = getStructureAt(structure, currentIndex);
        if ((event.key === 'Tab' && !event.shiftKey) || event.key === 'ArrowDown') {
            event.preventDefault();
            const newIndex = (currentIndex.at(-1) + 1) % current.length;
            current[newIndex].element.focus();
            currentIndex[currentIndex.length - 1] = newIndex;
        }
        else if ((event.key === 'Tab' && event.shiftKey) || event.key === 'ArrowUp') {
            event.preventDefault();
            const newIndex = (currentIndex.at(-1) + current.length - 1) % current.length;
            current[newIndex].element.focus();
            currentIndex[currentIndex.length - 1] = newIndex;
        }
        else if (event.key === 'Enter' || event.code === 'Space') {
            const currentItem = current[currentIndex.at(-1)];
            if (currentItem.type === 'toggle') {
                event.preventDefault();
                setExpanded(currentItem.element, true);
                currentItem.items[0].element.focus();
                currentIndex.push(0);
            }
        }
        else if (event.key === 'Escape') {
            event.preventDefault();
            if (currentIndex.length === 1) {
                toggle.focus();
                setExpanded(toggle, false);
                delete currentIndex[0];
            }
            else {
                const parentStructure = getStructureAt(structure, currentIndex.slice(0, -1));
                const parent = parentStructure[currentIndex.at(-2)];
                parent.element.focus();
                setExpanded(parent.element, false);
                currentIndex.pop();
            }
        }
        else if (event.key === 'ArrowRight') {
            event.preventDefault();
            const currentItem = current[currentIndex.at(-1)];
            if (currentItem.type === 'toggle') {
                setExpanded(currentItem.element, true);
                currentItem.items[0].element.focus();
                currentIndex.push(0);
            }
        }
        else if (event.key === 'ArrowLeft') {
            event.preventDefault();
            if (currentIndex.length > 1) {
                const parentStructure = getStructureAt(structure, currentIndex.slice(0, -1));
                const parent = parentStructure[currentIndex.at(-2)];
                parent.element.focus();
                setExpanded(parent.element, false);
                currentIndex.pop();
            }
        }
    });
    return {
        open() {
            setExpanded(toggle, true);
            structure[0].element.focus();
            currentIndex.splice(0, currentIndex.length, 0);
        },
        close() {
            setExpanded(toggle, false);
            toggle.focus();
            currentIndex.splice(0, currentIndex.length);
        },
        toggle() {
            const state = toggleExpanded(toggle);
            if (state === 'true') {
                structure[0].element.focus();
                currentIndex.splice(0, currentIndex.length, 0);
            }
            else {
                toggle.focus();
                currentIndex.splice(0, currentIndex.length);
            }
        },
        get status() {
            return getExpanded(toggle);
        }
    };
}

const siteNavList = document.querySelector('.site-nav');
const siteNavToggle = document.querySelector('.site-nav-toggle');
const siteNav = setUpMenu(siteNavList, siteNavToggle);
handleOutsideClick(siteNavList, event => {
    if (!siteNav.status) {
        return;
    }
    let node = event.target;
    while (node != null && node.nodeType !== Node.DOCUMENT_NODE) {
        if (node === siteNavList) {
            return;
        }
        node = node.parentElement ?? null;
    }
    siteNav.close();
});
//# sourceMappingURL=app.js.map
