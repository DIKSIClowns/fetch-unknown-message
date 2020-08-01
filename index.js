const { getModule } = require("powercord/webpack");
const { inject, uninject } = require("powercord/injector");
const { forceUpdateElement } = require("powercord/util");
const { Plugin } = require("powercord/entities");

function getIdFromMention(text) {
    const match = text.match(/<@!?([0-9]+)>/);
    return match ? match[1] : undefined;
}

module.exports = class FetchUnknownUsers extends Plugin {
    async startPlugin() {
        const getUser = (await getModule(["getUser"])).getUser;
        const Mention = await getModule(m => m.default && m.default.displayName == "Mention");

        inject("fetch-unknown-users", Mention, "default", function (args) {
            if (args[0] && args[0].children && args[0].children[0]
                && getIdFromMention(args[0].children[0])) {
                const id = getIdFromMention(args[0].children[0]);
                getUser(id).then((user) => {
                    if (user) {
                        args[0].children[0] = `@${user.username}`;
                        forceUpdateElement(".mention", true);
                    }
                });
            }
            return args;
        }, true);
    }

    pluginWillUnload() {
        uninject("fetch-unknown-users");
    }
};