/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import App from '../App';
import { mockFetch, respuesta } from './helpers/fetchMock';

test('renders correctly', async () => {
  // El Home pide las clases de hoy al montar; nunca se llama al backend real.
  const fetchMock = mockFetch().mockResolvedValue(respuesta({ status: 200, body: [] }));

  await ReactTestRenderer.act(async () => {
    ReactTestRenderer.create(<App />);
    await new Promise<void>(resolve => setTimeout(resolve, 50));
  });

  fetchMock.mockRestore();
});
