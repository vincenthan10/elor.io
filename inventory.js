class Inventory extends Menu {
    constructor(player) {
        super([]);
        this.player = player;
    }

    updateOptions() {
        this.options = Object.keys(this.player.inventory).map(key => ({
            label: `${key}: ${this.player.inventory[key]}`,
            action: () => { }
        }));
    }

    open() {
        this.updateOptions();
        super.open();
    }

    draw(ctx) {
        const invX = 140;
        const invY = canvas.height - 200;
        const invW = 210;
        const invH = 180;

        // Background box
        ctx.fillStyle = "#222";
        ctx.fillRect(invX, invY, invW, invH);
        ctx.strokeStyle = "white";
        ctx.strokeRect(invX, invY, invW, invH);
        ctx.fillStyle = "white";
        ctx.font = "18px Arial";
        ctx.fillText("Inventory", invX + 10, invY + 25);

        ctx.font = "14px Arial";


    }
}