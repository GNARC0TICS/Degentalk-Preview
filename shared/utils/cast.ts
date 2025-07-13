export const asId = <Brand extends string>(value: string) =>
	value as unknown as string & { __brand: Brand };
