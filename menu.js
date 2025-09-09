class Menu {
    constructor(options = []) {
        this.options = options;
        this.selectedIndex = 0;
        this.isOpen = false;
    }
    open() { this.isOpen = true; }
    close() { this.isOpen = false; }

    select() {
        if (this.isOpen) this.options[this.selectedIndex].action();
    }

    draw(ctx) {
    }
}
