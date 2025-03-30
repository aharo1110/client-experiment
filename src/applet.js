import { applets } from "@web-applets/sdk";

const frame = document.querySelector("applet-frame");

document
  .querySelector("#execute-action")
  .addEventListener("click", async () => {
    const applet = await applets.connect(frame.contentWindow);
    const selected = document.querySelector("#action-select").value;
    const action = applet.actions[selected];

    const opts = {};
    if (action.params_schema) {
      const paramSchemas = Object.keys(action.params_schema.properties);

      paramSchemas.forEach(([paramName, paramSchema]) => {
        const inputValue = document.querySelector(`#${paramName}-input`).value;

        if (paramSchema.type === "number") {
          opts[paramName] = parseFloat(inputValue);
        } else if (paramSchema.type === "boolean") {
          opts[paramName] = inputValue === "true";
        } else {
          opts[paramName] = inputValue;
        }
      });
    }

    await applet.sendAction(
      document.querySelector("#action-select").value,
      opts
    );
  });
