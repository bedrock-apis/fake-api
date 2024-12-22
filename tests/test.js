import { Player } from "../packages/@minecraft/server.native.js";
import { ConfigContextOptions } from "../packages/api.js";
import { CONTEXT } from "../packages/api.js";

CONTEXT.setConfigProperty(ConfigContextOptions.StrictReturnTypes, false);
CONTEXT.onInvocation("Player::sendMessage", (e, s, that, context) => {
    console.log("Sended: ", context);
    context.setResult("Test");
});
const player = Player.create();
// This should throw internal error when trying to set the value not throwing it into this context
console.log(player.sendMessage("Yes"));