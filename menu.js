class Menu {
    constructor(options = []) {
        this.selectedIndex = 0;
        this.isOpen = false;
    }
    open() { this.isOpen = true; }
    close() { this.isOpen = false; }

    draw(ctx) {
    }
}
