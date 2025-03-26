import { applets } from '@web-applets/sdk';

const self = applets.register();

// Define a 'set_name' action, and make it update the shared data object with the new name
self.setActionHandler('set_name', ({ name }) => {
  self.data = { name };
});

// Whenever the data is updated, update the view
self.ondata = () => {
  const nameElement = document.getElementById('name');
  if (nameElement) {
    nameElement.innerText = self.data.name;
  }
};