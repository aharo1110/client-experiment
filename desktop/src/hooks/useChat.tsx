import {
  actionMessage,
  type ActionProposalResponse,
  type DirectResponse,
  KernelMessage,
  ProcessRuntime,
  Resource,
  responseMessage,
} from '@unternet/kernel';
import { Applet, applets as appletFactory } from '@web-applets/sdk';
import React, { createContext, useCallback, useContext, useState } from 'react';
import { CHAT_URL } from '../App';

// NOTE: Mirrored in main.ts (server)
namespace Interpret {
  export type Request = {
    resources: Resource[];
    messages: KernelMessage[];
  };

  export type Response =
    | (Omit<DirectResponse, 'content'> & { content: string })
    | (Omit<ActionProposalResponse, 'args'> & {
        args: string;
      });
}

type ChatContext = {
  connect: (window: Window, url: URL) => Promise<void>;
  processMessages(
    messageHistory: KernelMessage[]
  ): Promise<KernelMessage | null>;
};

const ChatContext = createContext<ChatContext | null>(null);

export function ChatContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [runtime] = useState(() => new ProcessRuntime([]));
  const [applets] = useState<Record<string, Applet>>({});

  const connect = useCallback(
    async (window: Window, url: URL) => {
      try {
        // Skip already-connected urls
        const appletId = url.href;
        if (appletId in applets) {
          console.log(`Applet ${url.href} already connected`);
          return;
        }

        // Try connecting. This will fail if the page is not an applet (common/expected).
        const applet = await appletFactory.connect(window);
        applets[appletId] = applet;
      } catch (e) {
        console.log(`Couldn't connect to applet at ${url}`);
      }
    },
    [runtime, applets]
  );

  const processMessages = useCallback(
    async (messageHistory: KernelMessage[]): Promise<KernelMessage | null> => {
      // HACK: Pass current applet states as action messages.
      const initMessages = Object.entries(applets).map(([uri, applet]) =>
        actionMessage({
          uri,
          actionId: Object.keys(applet.actions)[0],
          args: {},
          content: applet.data,
        })
      );

      // Build request object
      const request: Interpret.Request = {
        resources: Object.entries(applets).map(([uri, applet]) => ({
          uri: uri,
          protocol: 'applet',
          actions: applet.actions,
        })),
        messages: [...initMessages, ...messageHistory],
      };

      // POST to interpreter
      const res = await fetch(`${CHAT_URL}/interpret`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });

      const data = (await res.json()) as Interpret.Response;

      // Direct response handler
      if (data.type === 'direct') {
        // Return a ResponseMessage
        return responseMessage({ text: data.content });
        // Action proposal handler
      } else if (data.type === 'actionproposal') {
        // Find applet
        const applet = applets[data.uri];
        if (applet == null) {
          throw new Error(`Resource ${data.uri} not found`);
        }

        // Find action
        const action = applet.actions[data.actionId];
        if (action == null) {
          throw new Error(
            `Action ${data.actionId} not found for resource ${data.uri}`
          );
        }

        // Perform action
        console.log(
          `Performing action '${action.name ?? data.actionId}' with args ${data.args}`
        );
        await applet.sendAction(data.actionId, JSON.parse(data.args));

        // Return an ActionMessage. This (probably) won't be rendered in the chat,
        // but we still want it to be fed back into the interpreter.
        return actionMessage({
          ...data,
          content: applet.data,
        });
      }

      return null;
    },
    [runtime, applets]
  );

  return (
    <ChatContext.Provider value={{ connect, processMessages }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  return useContext(ChatContext);
}
