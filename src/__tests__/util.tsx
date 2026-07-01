import { NavigationContainer } from '@react-navigation/native';
import { render as renderRNTL, userEvent, type RenderOptions } from '@testing-library/react-native';
import type { PropsWithChildren, ReactElement } from 'react';

function Wrapper({ children }: PropsWithChildren) {
  return <NavigationContainer>{children}</NavigationContainer>;
}

export async function render(ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) {
  const user = userEvent.setup();
  const result = await renderRNTL(ui, {
    wrapper: Wrapper,
    ...options,
  });

  return {
    user,
    ...result,
  };
}
