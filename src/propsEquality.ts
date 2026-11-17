type PropertyBag = Record<string, unknown>;

export const haveEquivalentProps = (
  previousProps: object,
  nextProps: object,
): boolean =>
  !hasChangedProperty(previousProps as PropertyBag, nextProps as PropertyBag);

const hasChangedProperty = (
  previous: PropertyBag,
  next: PropertyBag,
): boolean =>
  Object.keys(next).some((key) => isValueChanged(previous[key], next[key]));

const isValueChanged = (
  previousValue: unknown,
  nextValue: unknown,
): boolean => {
  if (previousValue === nextValue) {
    return false;
  }
  if (isPropertyBag(previousValue) && isPropertyBag(nextValue)) {
    return hasChangedProperty(previousValue, nextValue);
  }
  return true;
};

const isPropertyBag = (value: unknown): value is PropertyBag =>
  typeof value === 'object' && value !== null;
