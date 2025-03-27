import { applets } from '@web-applets/sdk';

const frame = document.querySelector('applet-frame');

document.querySelector('#execute-action').addEventListener('click', async () => {
    const applet = await applets.connect(frame.contentWindow);
    const selected = document.querySelector("#action-select").value;
    const action = applet.actions[selected];
    let opts = {}
    Object.keys(action.params_schema.properties).forEach(element => {
        opts[element] = document.querySelector(`#${element}-input`).value;
    });
    await applet.sendAction(document.querySelector("#action-select").value, opts);
});