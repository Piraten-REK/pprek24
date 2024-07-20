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
}

const siteNav = document.querySelector('.site-nav');
const siteNavToggle = document.querySelector('.site-nav-toggle');
setUpMenu(siteNav, siteNavToggle);
//# sourceMappingURL=app.js.map
