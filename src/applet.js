import { applets } from '@web-applets/sdk';

const frame = document.querySelector('applet-frame');

document.querySelector('#execute-action').addEventListener('click', async () => {
    const applet = await applets.connect(frame.contentWindow);
    const selected = document.querySelector("#action-select").value;
    const action = applet.actions[selected];
    let opts = {}
    Object.keys(action.params_schema.properties).forEach(element => {
        const paramSchema = action.params_schema.properties[element];
        const inputValue = document.querySelector(`#${element}-input`).value;
        if (paramSchema.type === 'number') {
            opts[element] = parseFloat(inputValue);
        } else if (paramSchema.type === 'boolean') {
            opts[element] = inputValue === 'true';
        } else {
            opts[element] = inputValue;
        }
    });
    await applet.sendAction(document.querySelector("#action-select").value, opts);
});