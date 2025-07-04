/**
 * Client-side type shims for branded types
 * Allows client to consume server types without branded type complexity
 */

declare module '@shared/types' {
  export type DgtAmount = number;
  export type XpAmount = number;
  export type UsdAmount = number;
  export type TipAmount = number;
  export type CloutAmount = number;
}