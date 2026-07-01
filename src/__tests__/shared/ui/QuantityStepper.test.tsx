import { render } from '__tests__/util';
import { screen } from '@testing-library/react-native';
import { QuantityStepper } from '_shared/ui/QuantityStepper';

describe('QuantityStepper', () => {
  beforeAll(() => {
    jest.useFakeTimers();
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  test('increases value on plus press', async () => {
    const onChange = jest.fn();
    const { user } = await render(<QuantityStepper value={2} max={5} onChange={onChange} />);

    await user.press(screen.getByText('+'));

    expect(onChange).toHaveBeenCalledWith(3);
  });

  test('does not increase above max', async () => {
    const onChange = jest.fn();
    const { user } = await render(<QuantityStepper value={5} max={5} onChange={onChange} />);

    await user.press(screen.getByText('+'));

    expect(onChange).not.toHaveBeenCalled();
  });

  test('does not decrease below zero', async () => {
    const onChange = jest.fn();
    const { user } = await render(<QuantityStepper value={0} onChange={onChange} />);

    await user.press(screen.getByText('−'));

    expect(onChange).not.toHaveBeenCalled();
  });
});
