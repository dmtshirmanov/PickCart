/**
 * @format
 */

import { App } from 'app/App';
import { act, create } from 'react-test-renderer';

test('renders correctly', async () => {
  await act(() => {
    create(<App />);
  });
});
