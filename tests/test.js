import { Player } from "../packages/@minecraft/server.native.js";
import { CONTEXT } from "../packages/api.js";

CONTEXT.onInvocation("Player::sendMessage", (e, s, that, context) => {
    console.log("Sended: ", context);
    context.setResult("Test");
});
const player = Player.create();
console.log(player.sendMessage("Yes"));