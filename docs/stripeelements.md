---
title: stripeelements
status: STABLE
updated: 2025-06-28
---

# Elements Appearance API

Customize the look and feel of Elements to match the design of your site.

Stripe Elements supports visual customization, which allows you to match the design of your site with the `appearance` option. The layout of each Element stays consistent, but you can modify colors, fonts, borders, padding, and more.

1. **Start by picking a [theme](#theme)**.

Get up and running right away by picking the prebuilt theme that most closely resembles your website.

2. **Customize the theme using [variables](#variables)** .

Set variables like `fontFamily` and `colorPrimary` to broadly customize components appearing throughout each Element.

3. **If needed, fine-tune individual components and states using [rules](#rules)** .

For complete control, specify custom CSS properties for individual components appearing in the Element.

The Elements Appearance API doesn’t support individual payment method Elements (such as `CardElement`). Use the [Style](https://docs.stripe.com/js/appendix/style) object to customize your Element instead.

## Themes 

Start customizing Elements by picking from one of the following themes:

- `stripe`
- `night`
- `flat`

```js
const appearance = {
  theme: 'night'
};

```

## Variables 

Set variables to affect the appearance of many components appearing throughout each Element.

![Payment form with card input fields, major credit card icons, and Klarna payment option, with labeled Appearance API variables for colors and styling.](images/stripejs/appearance-api/exampleVariables@2x.png)

The `variables` option works like [CSS variables](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties). You can specify CSS values for each variable and reference other variables with the `var(--myVariable)` syntax. You can even inspect the resulting DOM using the DOM explorer in your browser.

```js
const appearance = {
  theme: 'stripe',

  variables: {
    colorPrimary: '#0570de',
    colorBackground: '#ffffff',
    colorText: '#30313d',
    colorDanger: '#df1b41',
    fontFamily: 'Ideal Sans, system-ui, sans-serif',
    spacingUnit: '2px',
    borderRadius: '4px',
    // See all possible variables below
  }
};

```

### Commonly used variables

| Variable          | Description                                                                                                                                                                                                                                                      |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `fontFamily`      | The font family used throughout Elements.                                                                                                                                                                                                                        |
| `fontSizeBase`    | The font size that’s set on the root of the Element. By default, other font size variables such as `fontSizeXs` or `fontSizeSm` are scaled from this value using `rem` units. Make sure that you choose a font size of at least 16px for input fields on mobile. |
| `spacingUnit`     | The base spacing unit that all other spacing is derived from. Increase or decrease this value to make your layout more or less spacious.                                                                                                                         |
| `borderRadius`    | The border radius used for tabs, inputs, and other components in the Element.                                                                                                                                                                                    |
| `colorPrimary`    | A primary color used throughout the Element. Set this to your primary brand color.                                                                                                                                                                               |
| `colorBackground` | The color used for the background of inputs, tabs, and other components in the Element.                                                                                                                                                                          |
| `colorText`       | The default text color used in the Element.                                                                                                                                                                                                                      |
| `colorDanger`     | A color used to indicate errors or destructive actions in the Element.                                                                                                                                                                                           |

### Less commonly used variables

| Variable                              | Description                                                                                                                                                                                                                                            |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `fontSmooth`                          | What text anti-aliasing settings to use in the Element. It can be `always`, `auto`, or `never`.                                                                                                                                                        |
| `fontVariantLigatures`                | The [font-variant-ligatures](http://developer.mozilla.org/en-US/docs/Web/CSS/font-variant-ligatures) setting of text in the Element.                                                                                                                   |
| `fontVariationSettings`               | The [font-variation-settings](http://developer.mozilla.org/en-US/docs/Web/CSS/font-variation-settings) setting of text in the Element.                                                                                                                 |
| `fontWeightLight`                     | The font weight used for light text.                                                                                                                                                                                                                   |
| `fontWeightNormal`                    | The font weight used for normal text.                                                                                                                                                                                                                  |
| `fontWeightMedium`                    | The font weight used for medium text.                                                                                                                                                                                                                  |
| `fontWeightBold`                      | The font weight used for bold text.                                                                                                                                                                                                                    |
| `fontLineHeight`                      | The [line-height](http://developer.mozilla.org/en-US/docs/Web/CSS/line-height) setting of text in the Element.                                                                                                                                         |
| `fontSizeXl`                          | The font size of extra-large text in the Element. By default this is scaled from `var(--fontSizeBase)` using `rem` units.                                                                                                                              |
| `fontSizeLg`                          | The font size of large text in the Element. By default this is scaled from `var(--fontSizeBase)` using `rem` units.                                                                                                                                    |
| `fontSizeSm`                          | The font size of small text in the Element. By default this is scaled from `var(--fontSizeBase)` using `rem` units.                                                                                                                                    |
| `fontSizeXs`                          | The font size of extra-small text in the Element. By default this is scaled from `var(--fontSizeBase)` using `rem` units.                                                                                                                              |
| `fontSize2Xs`                         | The font size of double-extra small text in the Element. By default this is scaled from `var(--fontSizeBase)` using `rem` units.                                                                                                                       |
| `fontSize3Xs`                         | The font size of triple-extra small text in the Element. By default this is scaled from `var(--fontSizeBase)` using `rem` units.                                                                                                                       |
| `logoColor`                           | A preference for which logo variations to display; either `light` or `dark`.                                                                                                                                                                           |
| `tabLogoColor`                        | The logo variation to display inside `.Tab` components; either `light` or `dark`.                                                                                                                                                                      |
| `tabLogoSelectedColor`                | The logo variation to display inside the `.Tab--selected` component; either `light` or `dark`.                                                                                                                                                         |
| `blockLogoColor`                      | The logo variation to display inside `.Block` components; either `light` or `dark`.                                                                                                                                                                    |
| `colorSuccess`                        | A color used to indicate positive actions or successful results in the Element.                                                                                                                                                                        |
| `colorWarning`                        | A color used to indicate potentially destructive actions in the Element.                                                                                                                                                                               |
| `accessibleColorOnColorPrimary`       | The color of text appearing on top of any `var(--colorPrimary)` background.                                                                                                                                                                            |
| `accessibleColorOnColorBackground`    | The color of text appearing on top of any `var(--colorBackground)` background.                                                                                                                                                                         |
| `accessibleColorOnColorSuccess`       | The color of text appearing on top of any `var(--colorSuccess)` background.                                                                                                                                                                            |
| `accessibleColorOnColorDanger`        | The color of text appearing on top of any `var(--colorDanger)` background.                                                                                                                                                                             |
| `accessibleColorOnColorWarning`       | The color of text appearing on top of any `var(--colorWarning)` background.                                                                                                                                                                            |
| `colorTextSecondary`                  | The color used for text of secondary importance. For example, this color is used for the label of a tab that isn’t currently selected.                                                                                                                 |
| `colorTextPlaceholder`                | The color used for input placeholder text in the Element.                                                                                                                                                                                              |
| `iconColor`                           | The default color used for icons in the Element, such as the icon appearing in the card tab.                                                                                                                                                           |
| `iconHoverColor`                      | The color of icons when hovered.                                                                                                                                                                                                                       |
| `iconCardErrorColor`                  | The color of the card icon when it’s in an error state.                                                                                                                                                                                                |
| `iconCardCvcColor`                    | The color of the CVC variant of the card icon.                                                                                                                                                                                                         |
| `iconCardCvcErrorColor`               | The color of the CVC variant of the card icon when the CVC field has invalid input.                                                                                                                                                                    |
| `iconCheckmarkColor`                  | The color of checkmarks displayed within components like `.Checkbox`.                                                                                                                                                                                  |
| `iconChevronDownColor`                | The color of arrow icons displayed within select inputs.                                                                                                                                                                                               |
| `iconChevronDownHoverColor`           | The color of arrow icons when hovered.                                                                                                                                                                                                                 |
| `iconCloseColor`                      | The color of close icons, used for indicating a dismissal or close action.                                                                                                                                                                             |
| `iconCloseHoverColor`                 | The color of close icons when hovered.                                                                                                                                                                                                                 |
| `iconLoadingIndicatorColor`           | The color of the spinner in loading indicators.                                                                                                                                                                                                        |
| `iconMenuColor`                       | The color of menu icons used to indicate a set of additional actions.                                                                                                                                                                                  |
| `iconMenuHoverColor`                  | The color of menu icons when hovered.                                                                                                                                                                                                                  |
| `iconMenuOpenColor`                   | The color of menu icons when opened.                                                                                                                                                                                                                   |
| `iconPasscodeDeviceColor`             | The color of the passcode device icon, used to indicate a message has been sent to the user’s mobile device.                                                                                                                                           |
| `iconPasscodeDeviceHoverColor`        | The color of the passcode device icon when hovered.                                                                                                                                                                                                    |
| `iconPasscodeDeviceNotificationColor` | The color of the notification indicator displayed over the passcode device icon.                                                                                                                                                                       |
| `iconRedirectColor`                   | The color of the redirect icon that appears for redirect-based payment methods.                                                                                                                                                                        |
| `tabIconColor`                        | The color of icons appearing in a tab.                                                                                                                                                                                                                 |
| `tabIconHoverColor`                   | The color of icons appearing in a tab when the tab is hovered.                                                                                                                                                                                         |
| `tabIconSelectedColor`                | The color of icons appearing in a tab when the tab is selected.                                                                                                                                                                                        |
| `tabIconMoreColor`                    | The color of the icon that appears in the trigger for the additional payment methods menu.                                                                                                                                                             |
| `tabIconMoreHoverColor`               | The color of the icon that appears in the trigger for the additional payment methods menu when the trigger is hovered.                                                                                                                                 |
| `accordionItemSpacing`                | The vertical spacing between `.AccordionItem` components. This is only applicable when [spacedAccordionItems](https://docs.stripe.com/js/elements_object/create_payment_element#payment_element_create-options-layout-spacedAccordionItems) is `true`. |
| `gridColumnSpacing`                   | The spacing between columns in the grid used for the Element layout.                                                                                                                                                                                   |
| `gridRowSpacing`                      | The spacing between rows in the grid used for the Element layout.                                                                                                                                                                                      |
| `pickerItemSpacing`                   | The spacing between `.PickerItem` components rendered within the `.Picker` component.                                                                                                                                                                  |
| `tabSpacing`                          | The horizontal spacing between `.Tab` components.                                                                                                                                                                                                      |

## Rules 

The `rules` option is a map of CSS-like selectors to CSS properties, allowing granular customization of individual components. After defining your `theme` and `variables`, use `rules` to seamlessly integrate Elements to match the design of your site.

```js
const appearance = {
    rules: {
      '.Tab': {
        border: '1px solid #E0E6EB',
        boxShadow: '0px 1px 1px rgba(0, 0, 0, 0.03), 0px 3px 6px rgba(18, 42, 66, 0.02)',
      },

      '.Tab:hover': {
        color: 'var(--colorText)',
      },

      '.Tab--selected': {
        borderColor: '#E0E6EB',
        boxShadow: '0px 1px 1px rgba(0, 0, 0, 0.03), 0px 3px 6px rgba(18, 42, 66, 0.02), 0 0 0 2px var(--colorPrimary)',
      },

      '.Input--invalid': {
        boxShadow: '0 1px 1px 0 rgba(0, 0, 0, 0.07), 0 0 0 2px var(--colorDanger)',
      },

      // See all supported class names and selector syntax below
    }
  };

```

### All rules

The selector for a rule can target any of the public class names in the Element, as well as the supported states, pseudo-classes, and pseudo-elements for each class. For example, the following are valid selectors:

- `.Tab, .Label, .Input`
- `.Tab:focus`
- `.Input--invalid, .Label--invalid`
- `.Input::placeholder`

The following are **not** valid selectors:

- `.p-SomePrivateClass, img`, only public class names can be targeted
- `.Tab .TabLabel`, ancestor-descendant relationships in selectors are unsupported
- `.Tab--invalid`, the `.Tab` class does not support the `--invalid` state

Each class name used in a selector [supports an allowlist of CSS properties](#supported-css-properties), that you specify using camel case (for example, `boxShadow` for the [box-shadow](https://developer.mozilla.org/en-US/docs/Web/CSS/box-shadow) property).

The following is the complete list of supported class names and corresponding states, pseudo-classes, and pseudo-elements.

### Tabs

![](images/stripejs/appearance-api/exampleRulesTabs@2x.png)

| Class name  | States       | Pseudo-classes                             | Pseudo-elements |
| ----------- | ------------ | ------------------------------------------ | --------------- |
| `.Tab`      | `--selected` | `:hover`, `:focus`, `:active`, `:disabled` |                 |
| `.TabIcon`  | `--selected` | `:hover`, `:focus`, `:active`, `:disabled` |                 |
| `.TabLabel` | `--selected` | `:hover`, `:focus`, `:active`, `:disabled` |                 |

### Form Inputs - Labels Above

![](images/stripejs/appearance-api/exampleRulesFormInputs@2x.png)

Make sure that you choose a font size of at least 16px for input fields on mobile.

| Class name | States                              | Pseudo-classes                               | Pseudo-elements                |
| ---------- | ----------------------------------- | -------------------------------------------- | ------------------------------ |
| `.Label`   | `--empty`, `--invalid`, `--focused` |                                              |                                |
| `.Input`   | `--empty`, `--invalid`              | `:hover`, `:focus`, `:disabled`, `:autofill` | `::placeholder`, `::selection` |
| `.Error`   |                                     |                                              |                                |

### Form Inputs - Floating Labels

![](images/stripejs/appearance-api/exampleRulesFormInputsFloating@2x.png)

Floating Labels can be enabled as an [additional configuration option](#others).

| Class name | States                                                         | Pseudo-classes                               | Pseudo-elements                |
| ---------- | -------------------------------------------------------------- | -------------------------------------------- | ------------------------------ |
| `.Label`   | `--empty`, `--invalid`, `--focused`, `--floating`, `--resting` |                                              |                                |
| `.Input`   | `--empty`, `--invalid`                                         | `:hover`, `:focus`, `:disabled`, `:autofill` | `::placeholder`, `::selection` |
| `.Error`   |                                                                |                                              |                                |

### Block

![](images/stripejs/appearance-api/exampleRulesBlock@2x.png)

| Class name      | States       | Pseudo-classes                | Pseudo-elements |
| --------------- | ------------ | ----------------------------- | --------------- |
| `.Block`        |              |                               |                 |
| `.BlockDivider` |              |                               |                 |
| `.BlockAction`  | `--negative` | `:hover`, `:focus`, `:active` |                 |

### Code Input

![](images/stripejs/appearance-api/exampleRulesCodeInput@2x.png)

| Class name   | States | Pseudo-classes                  | Pseudo-elements |
| ------------ | ------ | ------------------------------- | --------------- |
| `.CodeInput` |        | `:hover`, `:focus`, `:disabled` |                 |

### Checkbox

![](images/stripejs/appearance-api/exampleRulesCheckbox@2x.png)

| Class name       | States      | Pseudo-classes                       | Pseudo-elements |
| ---------------- | ----------- | ------------------------------------ | --------------- |
| `.Checkbox`      | `--checked` |                                      |                 |
| `.CheckboxLabel` | `--checked` | `:hover`, `:focus`, `:focus-visible` |                 |
| `.CheckboxInput` | `--checked` | `:hover`, `:focus`, `:focus-visible` |                 |

### Dropdown

![](images/stripejs/appearance-api/exampleRulesDropdown@2x.png)

| Class name      | States        | Pseudo-classes | Pseudo-elements |
| --------------- | ------------- | -------------- | --------------- |
| `.Dropdown`     |               |                |                 |
| `.DropdownItem` | `--highlight` | `:active`      |                 |

### Switch

![](images/stripejs/appearance-api/exampleRulesSwitch@2x.png)

| Class name       | States     | Pseudo-classes | Pseudo-elements |
| ---------------- | ---------- | -------------- | --------------- |
| `.Switch`        | `--active` | `:hover`       |                 |
| `.SwitchControl` |            | `:hover`       |                 |

### Picker

![](images/stripejs/appearance-api/exampleRulesPicker@2x.png)

| Class name      | States                                             | Pseudo-classes                | Pseudo-elements |
| --------------- | -------------------------------------------------- | ----------------------------- | --------------- |
| `.PickerItem`   | `--selected`, `--highlight`, `--new`, `--disabled` | `:hover`, `:focus`, `:active` |                 |
| `.PickerAction` |                                                    | `:hover`, `:focus`, `:active` |                 |

Make sure your `.PickerItem` active state stands out amongst the other states.

|  |
|  |
| ![](images/stripejs/appearance-api/uxTipPickerDo@2x.png)                                                                                            | ![](images/stripejs/appearance-api/uxTipPickerDont@2x.png)                                                                                                                 |
| **DO**

  Use a noticeable, high-contrast primary color, weight, and/or outline to distinguish the active state your customer has already selected. | **DON’T**

  Don’t use two equally weighted options or low-contrast colors for your .PickerItem states because it makes distinguishing which one is active more difficult. |

### Menu

| Class name    | States       | Pseudo-classes                | Pseudo-elements |
| ------------- | ------------ | ----------------------------- | --------------- |
| `.Menu`       |              |                               |                 |
| `.MenuIcon`   | `--open`     | `:hover`                      |                 |
| `.MenuAction` | `--negative` | `:hover`, `:focus`, `:active` |                 |

### Accordion

| Class name       | States       | Pseudo-classes             | Pseudo-elements |
| ---------------- | ------------ | -------------------------- | --------------- |
| `.AccordionItem` | `--selected` | `:hover`, `:focus-visible` |                 |

### Payment Method Messaging Element

| Class name                | States | Pseudo-classes | Pseudo-elements |
| ------------------------- | ------ | -------------- | --------------- |
| `.PaymentMethodMessaging` |        |                |                 |

### Radio Icon

![](images/stripejs/appearance-api/exampleRulesRadioIcon@2x.png)

| Class name        | States                   | Pseudo-classes | Pseudo-elements |
| ----------------- | ------------------------ | -------------- | --------------- |
| `.RadioIcon`      |                          |                |                 |
| `.RadioIconOuter` | `--checked`, `--hovered` |                |                 |
| `.RadioIconInner` | `--checked`, `--hovered` |                |                 |

You can control the overall size of the icon with the `width` property on `.RadioIcon`. You can control the relative size of `.RadioIconInner` with the `r` (radius) property. `.RadioIconOuter` and `.RadioIconInner` are SVG elements and can be styled with `stroke` and `fill` properties. See the full list of [supported CSS properties](#supported-css-properties) below.

```js
const appearance = {
  rules: {
    '.RadioIcon': {
      width: '24px'
    },
    '.RadioIconOuter': {
      stroke: '#E0E6EB'
    },
    '.RadioIconInner': {
      r: '16'
    }
  }
};
```

### Supported CSS properties

| CSS Property              | Supported classes                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `-moz-osx-font-smoothing` | `AccordionItem`, `Action`, `BlockAction`, `Button`, `Checkbox`, `CheckboxLabel`, `CodeInput`, `DropdownItem`, `Error`, `Input`, `Label`, `Link`, `MenuAction`, `PickerAction`, `PickerItem`, `RedirectText`, `SecondaryLink`, `Tab`, `TabLabel`, `TermsLink`, `TermsText`, `Text`, `ToggleItem`                                                                                                                                                                   |
| `-webkit-font-smoothing`  | `AccordionItem`, `Action`, `BlockAction`, `Button`, `Checkbox`, `CheckboxLabel`, `CodeInput`, `DropdownItem`, `Error`, `Input`, `Label`, `Link`, `MenuAction`, `PickerAction`, `PickerItem`, `RedirectText`, `SecondaryLink`, `Tab`, `TabLabel`, `TermsLink`, `TermsText`, `Text`, `ToggleItem`                                                                                                                                                                   |
| `-webkit-text-fill-color` | `AccordionItem`, `Action`, `BlockAction`, `Button`, `Checkbox`, `CheckboxLabel`, `CodeInput`, `DropdownItem`, `Error`, `Input`, `Label`, `Link`, `MenuAction`, `PickerAction`, `PickerItem`, `RedirectText`, `SecondaryLink`, `Tab`, `TabLabel`, `TermsLink`, `TermsText`, `Text`, `ToggleItem`                                                                                                                                                                   |
| `backgroundColor`         | `AccordionItem`, `Action`, `Block`, `BlockAction`, `BlockDivider`, `Button`, `CheckboxInput`, `CodeInput`, `DropdownItem`, `Error`, `Input`, `InputDivider`, `MenuAction`, `MenuIcon`, `PickerAction`, `PickerItem`, `Switch`, `Tab`, `ToggleItem`                                                                                                                                                                                                                |
| `border`                  | `AccordionItem`, `Action`, `Block`, `BlockAction`, `Button`, `CheckboxInput`, `CodeInput`, `Dropdown`, `DropdownItem`, `Error`, `Input`, `MenuAction`, `MenuIcon`, `PickerAction`, `PickerItem`, `RedirectText`, `Switch`, `SwitchControl`, `Tab`, `TermsText`, `Text`, `ToggleItem`                                                                                                                                                                              |
| `borderBottom`            | `AccordionItem`, `Action`, `Block`, `BlockAction`, `Button`, `CheckboxInput`, `CodeInput`, `Dropdown`, `DropdownItem`, `Error`, `Input`, `MenuAction`, `MenuIcon`, `PickerAction`, `PickerItem`, `RedirectText`, `Switch`, `SwitchControl`, `Tab`, `TermsText`, `Text`, `ToggleItem`                                                                                                                                                                              |
| `borderBottomColor`       | `AccordionItem`, `Action`, `Block`, `BlockAction`, `Button`, `CheckboxInput`, `CodeInput`, `Dropdown`, `DropdownItem`, `Error`, `Input`, `MenuAction`, `MenuIcon`, `PickerAction`, `PickerItem`, `RedirectText`, `Switch`, `SwitchControl`, `Tab`, `TermsText`, `Text`, `ToggleItem`                                                                                                                                                                              |
| `borderBottomLeftRadius`  | `AccordionItem`, `Action`, `Block`, `BlockAction`, `Button`, `CheckboxInput`, `CodeInput`, `Dropdown`, `DropdownItem`, `Error`, `Input`, `MenuAction`, `MenuIcon`, `PickerAction`, `PickerItem`, `RedirectText`, `Switch`, `SwitchControl`, `Tab`, `TermsText`, `Text`, `ToggleItem`                                                                                                                                                                              |
| `borderBottomRightRadius` | `AccordionItem`, `Action`, `Block`, `BlockAction`, `Button`, `CheckboxInput`, `CodeInput`, `Dropdown`, `DropdownItem`, `Error`, `Input`, `MenuAction`, `MenuIcon`, `PickerAction`, `PickerItem`, `RedirectText`, `Switch`, `SwitchControl`, `Tab`, `TermsText`, `Text`, `ToggleItem`                                                                                                                                                                              |
| `borderBottomStyle`       | `AccordionItem`, `Action`, `Block`, `BlockAction`, `Button`, `CheckboxInput`, `CodeInput`, `Dropdown`, `DropdownItem`, `Error`, `Input`, `MenuAction`, `MenuIcon`, `PickerAction`, `PickerItem`, `RedirectText`, `Switch`, `SwitchControl`, `Tab`, `TermsText`, `Text`, `ToggleItem`                                                                                                                                                                              |
| `borderBottomWidth`       | `AccordionItem`, `Action`, `Block`, `BlockAction`, `Button`, `CheckboxInput`, `CodeInput`, `Dropdown`, `DropdownItem`, `Error`, `Input`, `MenuAction`, `MenuIcon`, `PickerAction`, `PickerItem`, `RedirectText`, `Switch`, `SwitchControl`, `Tab`, `TermsText`, `Text`, `ToggleItem`                                                                                                                                                                              |
| `borderColor`             | `AccordionItem`, `Action`, `Block`, `BlockAction`, `Button`, `CheckboxInput`, `CodeInput`, `Dropdown`, `DropdownItem`, `Error`, `Input`, `MenuAction`, `MenuIcon`, `PickerAction`, `PickerItem`, `RedirectText`, `Switch`, `SwitchControl`, `Tab`, `TermsText`, `Text`, `ToggleItem`                                                                                                                                                                              |
| `borderLeft`              | `AccordionItem`, `Action`, `Block`, `BlockAction`, `Button`, `CheckboxInput`, `CodeInput`, `Dropdown`, `DropdownItem`, `Error`, `Input`, `MenuAction`, `MenuIcon`, `PickerAction`, `PickerItem`, `RedirectText`, `Switch`, `SwitchControl`, `Tab`, `TermsText`, `Text`, `ToggleItem`                                                                                                                                                                              |
| `borderLeftColor`         | `AccordionItem`, `Action`, `Block`, `BlockAction`, `Button`, `CheckboxInput`, `CodeInput`, `Dropdown`, `DropdownItem`, `Error`, `Input`, `MenuAction`, `MenuIcon`, `PickerAction`, `PickerItem`, `RedirectText`, `Switch`, `SwitchControl`, `Tab`, `TermsText`, `Text`, `ToggleItem`                                                                                                                                                                              |
| `borderLeftStyle`         | `AccordionItem`, `Action`, `Block`, `BlockAction`, `Button`, `CheckboxInput`, `CodeInput`, `Dropdown`, `DropdownItem`, `Error`, `Input`, `MenuAction`, `MenuIcon`, `PickerAction`, `PickerItem`, `RedirectText`, `Switch`, `SwitchControl`, `Tab`, `TermsText`, `Text`, `ToggleItem`                                                                                                                                                                              |
| `borderLeftWidth`         | `AccordionItem`, `Action`, `Block`, `BlockAction`, `Button`, `CheckboxInput`, `CodeInput`, `Dropdown`, `DropdownItem`, `Error`, `Input`, `MenuAction`, `MenuIcon`, `PickerAction`, `PickerItem`, `RedirectText`, `Switch`, `SwitchControl`, `Tab`, `TermsText`, `Text`, `ToggleItem`                                                                                                                                                                              |
| `borderRadius`            | `AccordionItem`, `Action`, `Block`, `BlockAction`, `Button`, `CheckboxInput`, `CodeInput`, `Dropdown`, `DropdownItem`, `Error`, `Input`, `InputCloseIcon`, `Link`, `MenuAction`, `MenuIcon`, `PasscodeCloseIcon`, `PasscodeShowIcon`, `PickerAction`, `PickerItem`, `RedirectText`, `SecondaryLink`, `Switch`, `SwitchControl`, `Tab`, `TermsLink`, `TermsText`, `Text`, `ToggleItem`                                                                             |
| `borderRight`             | `AccordionItem`, `Action`, `Block`, `BlockAction`, `Button`, `CheckboxInput`, `CodeInput`, `Dropdown`, `DropdownItem`, `Error`, `Input`, `MenuAction`, `MenuIcon`, `PickerAction`, `PickerItem`, `RedirectText`, `Switch`, `SwitchControl`, `Tab`, `TermsText`, `Text`, `ToggleItem`                                                                                                                                                                              |
| `borderRightColor`        | `AccordionItem`, `Action`, `Block`, `BlockAction`, `Button`, `CheckboxInput`, `CodeInput`, `Dropdown`, `DropdownItem`, `Error`, `Input`, `MenuAction`, `MenuIcon`, `PickerAction`, `PickerItem`, `RedirectText`, `Switch`, `SwitchControl`, `Tab`, `TermsText`, `Text`, `ToggleItem`                                                                                                                                                                              |
| `borderRightStyle`        | `AccordionItem`, `Action`, `Block`, `BlockAction`, `Button`, `CheckboxInput`, `CodeInput`, `Dropdown`, `DropdownItem`, `Error`, `Input`, `MenuAction`, `MenuIcon`, `PickerAction`, `PickerItem`, `RedirectText`, `Switch`, `SwitchControl`, `Tab`, `TermsText`, `Text`, `ToggleItem`                                                                                                                                                                              |
| `borderRightWidth`        | `AccordionItem`, `Action`, `Block`, `BlockAction`, `Button`, `CheckboxInput`, `CodeInput`, `Dropdown`, `DropdownItem`, `Error`, `Input`, `MenuAction`, `MenuIcon`, `PickerAction`, `PickerItem`, `RedirectText`, `Switch`, `SwitchControl`, `Tab`, `TermsText`, `Text`, `ToggleItem`                                                                                                                                                                              |
| `borderStyle`             | `AccordionItem`, `Action`, `Block`, `BlockAction`, `Button`, `CheckboxInput`, `CodeInput`, `Dropdown`, `DropdownItem`, `Error`, `Input`, `MenuAction`, `MenuIcon`, `PickerAction`, `PickerItem`, `RedirectText`, `Switch`, `SwitchControl`, `Tab`, `TermsText`, `Text`, `ToggleItem`                                                                                                                                                                              |
| `borderTop`               | `AccordionItem`, `Action`, `Block`, `BlockAction`, `Button`, `CheckboxInput`, `CodeInput`, `Dropdown`, `DropdownItem`, `Error`, `Input`, `MenuAction`, `MenuIcon`, `PickerAction`, `PickerItem`, `RedirectText`, `Switch`, `SwitchControl`, `Tab`, `TermsText`, `Text`, `ToggleItem`                                                                                                                                                                              |
| `borderTopColor`          | `AccordionItem`, `Action`, `Block`, `BlockAction`, `Button`, `CheckboxInput`, `CodeInput`, `Dropdown`, `DropdownItem`, `Error`, `Input`, `MenuAction`, `MenuIcon`, `PickerAction`, `PickerItem`, `RedirectText`, `Switch`, `SwitchControl`, `Tab`, `TermsText`, `Text`, `ToggleItem`                                                                                                                                                                              |
| `borderTopLeftRadius`     | `AccordionItem`, `Action`, `Block`, `BlockAction`, `Button`, `CheckboxInput`, `CodeInput`, `Dropdown`, `DropdownItem`, `Error`, `Input`, `MenuAction`, `MenuIcon`, `PickerAction`, `PickerItem`, `RedirectText`, `Switch`, `SwitchControl`, `Tab`, `TermsText`, `Text`, `ToggleItem`                                                                                                                                                                              |
| `borderTopRightRadius`    | `AccordionItem`, `Action`, `Block`, `BlockAction`, `Button`, `CheckboxInput`, `CodeInput`, `Dropdown`, `DropdownItem`, `Error`, `Input`, `MenuAction`, `MenuIcon`, `PickerAction`, `PickerItem`, `RedirectText`, `Switch`, `SwitchControl`, `Tab`, `TermsText`, `Text`, `ToggleItem`                                                                                                                                                                              |
| `borderTopStyle`          | `AccordionItem`, `Action`, `Block`, `BlockAction`, `Button`, `CheckboxInput`, `CodeInput`, `Dropdown`, `DropdownItem`, `Error`, `Input`, `MenuAction`, `MenuIcon`, `PickerAction`, `PickerItem`, `RedirectText`, `Switch`, `SwitchControl`, `Tab`, `TermsText`, `Text`, `ToggleItem`                                                                                                                                                                              |
| `borderTopWidth`          | `AccordionItem`, `Action`, `Block`, `BlockAction`, `Button`, `CheckboxInput`, `CodeInput`, `Dropdown`, `DropdownItem`, `Error`, `Input`, `MenuAction`, `MenuIcon`, `PickerAction`, `PickerItem`, `RedirectText`, `Switch`, `SwitchControl`, `Tab`, `TermsText`, `Text`, `ToggleItem`                                                                                                                                                                              |
| `borderWidth`             | `AccordionItem`, `Action`, `Block`, `BlockAction`, `Button`, `CheckboxInput`, `CodeInput`, `Dropdown`, `DropdownItem`, `Error`, `Input`, `MenuAction`, `MenuIcon`, `PickerAction`, `PickerItem`, `RedirectText`, `Switch`, `SwitchControl`, `Tab`, `TermsText`, `Text`, `ToggleItem`                                                                                                                                                                              |
| `boxShadow`               | `AccordionItem`, `Action`, `Block`, `BlockAction`, `Button`, `CheckboxInput`, `CodeInput`, `Dropdown`, `DropdownItem`, `Error`, `Input`, `InputCloseIcon`, `Link`, `MenuAction`, `MenuIcon`, `PasscodeCloseIcon`, `PasscodeShowIcon`, `PickerAction`, `PickerItem`, `SecondaryLink`, `Switch`, `SwitchControl`, `Tab`, `TermsLink`, `ToggleItem`                                                                                                                  |
| `color`                   | `AccordionItem`, `Action`, `BlockAction`, `Button`, `Checkbox`, `CheckboxLabel`, `CodeInput`, `DropdownItem`, `Error`, `Input`, `Label`, `Link`, `MenuAction`, `PickerAction`, `PickerItem`, `RedirectText`, `SecondaryLink`, `Tab`, `TabIcon`, `TabLabel`, `TermsLink`, `TermsText`, `Text`, `ToggleItem`                                                                                                                                                        |
| `fill`                    | `Action`, `BlockAction`, `Button`, `CodeInput`, `DropdownItem`, `Error`, `Input`, `MenuAction`, `MenuIcon`, `PickerAction`, `PickerItem`, `RadioIconInner`, `RadioIconOuter`, `SwitchControl`, `Tab`, `TabIcon`, `ToggleItem`                                                                                                                                                                                                                                     |
| `fillOpacity`             | `RadioIconInner`, `RadioIconOuter`                                                                                                                                                                                                                                                                                                                                                                                                                                |
| `fontFamily`              | `AccordionItem`, `Action`, `BlockAction`, `Button`, `Checkbox`, `CheckboxLabel`, `CodeInput`, `DropdownItem`, `Error`, `Input`, `Label`, `Link`, `MenuAction`, `PickerAction`, `PickerItem`, `RedirectText`, `SecondaryLink`, `Tab`, `TabLabel`, `TermsLink`, `TermsText`, `Text`, `ToggleItem`                                                                                                                                                                   |
| `fontSize`                | `AccordionItem`, `Action`, `BlockAction`, `Button`, `Checkbox`, `CheckboxLabel`, `CodeInput`, `DropdownItem`, `Error`, `Input`, `Label`, `Link`, `MenuAction`, `PickerAction`, `PickerItem`, `RedirectText`, `SecondaryLink`, `Switch`, `Tab`, `TabLabel`, `TermsLink`, `TermsText`, `Text`, `ToggleItem`                                                                                                                                                         |
| `fontVariant`             | `AccordionItem`, `Action`, `BlockAction`, `Button`, `Checkbox`, `CheckboxLabel`, `CodeInput`, `DropdownItem`, `Error`, `Input`, `Label`, `Link`, `MenuAction`, `PickerAction`, `PickerItem`, `RedirectText`, `SecondaryLink`, `Tab`, `TabLabel`, `TermsLink`, `TermsText`, `Text`, `ToggleItem`                                                                                                                                                                   |
| `fontWeight`              | `AccordionItem`, `Action`, `BlockAction`, `Button`, `Checkbox`, `CheckboxLabel`, `CodeInput`, `DropdownItem`, `Error`, `Input`, `Label`, `Link`, `MenuAction`, `PickerAction`, `PickerItem`, `RedirectText`, `SecondaryLink`, `Tab`, `TabLabel`, `TermsLink`, `TermsText`, `Text`, `ToggleItem`                                                                                                                                                                   |
| `letterSpacing`           | `AccordionItem`, `Action`, `BlockAction`, `Button`, `Checkbox`, `CheckboxLabel`, `CodeInput`, `DropdownItem`, `Error`, `Input`, `Label`, `Link`, `MenuAction`, `PickerAction`, `PickerItem`, `RedirectText`, `SecondaryLink`, `Tab`, `TabLabel`, `TermsLink`, `TermsText`, `Text`, `ToggleItem`                                                                                                                                                                   |
| `lineHeight`              | `AccordionItem`, `Action`, `BlockAction`, `Button`, `Checkbox`, `CheckboxLabel`, `CodeInput`, `DropdownItem`, `Error`, `Input`, `Label`, `Link`, `MenuAction`, `PickerAction`, `PickerItem`, `RedirectText`, `SecondaryLink`, `Tab`, `TabLabel`, `TermsLink`, `TermsText`, `Text`, `ToggleItem`                                                                                                                                                                   |
| `margin`                  | `Action`, `BlockAction`, `Button`, `CodeInput`, `DropdownItem`, `Error`, `Input`, `Label`, `MenuAction`, `PickerAction`, `PickerItem`, `Tab`, `ToggleItem`                                                                                                                                                                                                                                                                                                        |
| `marginBottom`            | `Action`, `BlockAction`, `Button`, `CodeInput`, `DropdownItem`, `Error`, `Input`, `Label`, `MenuAction`, `PickerAction`, `PickerItem`, `Tab`, `ToggleItem`                                                                                                                                                                                                                                                                                                        |
| `marginLeft`              | `Action`, `BlockAction`, `Button`, `CodeInput`, `DropdownItem`, `Error`, `Input`, `Label`, `MenuAction`, `PickerAction`, `PickerItem`, `Tab`, `ToggleItem`                                                                                                                                                                                                                                                                                                        |
| `marginRight`             | `Action`, `BlockAction`, `Button`, `CodeInput`, `DropdownItem`, `Error`, `Input`, `Label`, `MenuAction`, `PickerAction`, `PickerItem`, `Tab`, `ToggleItem`                                                                                                                                                                                                                                                                                                        |
| `marginTop`               | `Action`, `BlockAction`, `Button`, `CodeInput`, `DropdownItem`, `Error`, `Input`, `Label`, `MenuAction`, `PickerAction`, `PickerItem`, `Tab`, `ToggleItem`                                                                                                                                                                                                                                                                                                        |
| `opacity`                 | `Label`                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| `outline`                 | `AccordionItem`, `Action`, `Block`, `BlockAction`, `Button`, `CheckboxInput`, `CodeInput`, `Dropdown`, `DropdownItem`, `Error`, `Input`, `InputCloseIcon`, `Link`, `MenuAction`, `MenuIcon`, `PasscodeCloseIcon`, `PasscodeShowIcon`, `PickerAction`, `PickerItem`, `SecondaryLink`, `Switch`, `SwitchControl`, `Tab`, `TermsLink`, `ToggleItem`                                                                                                                  |
| `outlineOffset`           | `AccordionItem`, `Action`, `Block`, `BlockAction`, `Button`, `CheckboxInput`, `CodeInput`, `Dropdown`, `DropdownItem`, `Error`, `Input`, `InputCloseIcon`, `Link`, `MenuAction`, `MenuIcon`, `PasscodeCloseIcon`, `PasscodeShowIcon`, `PickerAction`, `PickerItem`, `SecondaryLink`, `Switch`, `SwitchControl`, `Tab`, `TermsLink`, `ToggleItem`                                                                                                                  |
| `padding`                 | `AccordionItem`, `Action`, `Block`, `BlockAction`, `Button`, `CodeInput`, `DropdownItem`, `Error`, `Input`, `Label`, `Menu`, `MenuAction`, `MenuIcon`, `PickerAction`, `PickerItem`, `RedirectText`, `Tab`, `TabIcon`, `TabLabel`, `TermsText`, `Text`, `ToggleItem`                                                                                                                                                                                              |
| `paddingBottom`           | `AccordionItem`, `Action`, `Block`, `BlockAction`, `Button`, `CodeInput`, `DropdownItem`, `Error`, `Input`, `Label`, `Menu`, `MenuAction`, `MenuIcon`, `PickerAction`, `PickerItem`, `RedirectText`, `Tab`, `TabIcon`, `TabLabel`, `TermsText`, `Text`, `ToggleItem`                                                                                                                                                                                              |
| `paddingLeft`             | `AccordionItem`, `Action`, `Block`, `BlockAction`, `Button`, `CodeInput`, `DropdownItem`, `Error`, `Input`, `Label`, `Menu`, `MenuAction`, `MenuIcon`, `PickerAction`, `PickerItem`, `RedirectText`, `Tab`, `TabIcon`, `TabLabel`, `TermsText`, `Text`, `ToggleItem`                                                                                                                                                                                              |
| `paddingRight`            | `AccordionItem`, `Action`, `Block`, `BlockAction`, `Button`, `CodeInput`, `DropdownItem`, `Error`, `Input`, `Label`, `Menu`, `MenuAction`, `MenuIcon`, `PickerAction`, `PickerItem`, `RedirectText`, `Tab`, `TabIcon`, `TabLabel`, `TermsText`, `Text`, `ToggleItem`                                                                                                                                                                                              |
| `paddingTop`              | `AccordionItem`, `Action`, `Block`, `BlockAction`, `Button`, `CodeInput`, `DropdownItem`, `Error`, `Input`, `Label`, `Menu`, `MenuAction`, `MenuIcon`, `PickerAction`, `PickerItem`, `RedirectText`, `Tab`, `TabIcon`, `TabLabel`, `TermsText`, `Text`, `ToggleItem`                                                                                                                                                                                              |
| `r`                       | `RadioIconInner`                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| `stroke`                  | `RadioIconInner`, `RadioIconOuter`                                                                                                                                                                                                                                                                                                                                                                                                                                |
| `strokeOpacity`           | `RadioIconInner`, `RadioIconOuter`                                                                                                                                                                                                                                                                                                                                                                                                                                |
| `strokeWidth`             | `RadioIconInner`, `RadioIconOuter`                                                                                                                                                                                                                                                                                                                                                                                                                                |
| `textAlign`               | `PaymentMethodMessaging`                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| `textDecoration`          | `AccordionItem`, `Action`, `BlockAction`, `Button`, `Checkbox`, `CheckboxLabel`, `CodeInput`, `DropdownItem`, `Error`, `Input`, `Label`, `Link`, `MenuAction`, `PickerAction`, `PickerItem`, `RedirectText`, `SecondaryLink`, `Tab`, `TabLabel`, `TermsLink`, `TermsText`, `Text`, `ToggleItem`                                                                                                                                                                   |
| `textShadow`              | `AccordionItem`, `Action`, `BlockAction`, `Button`, `Checkbox`, `CheckboxLabel`, `CodeInput`, `DropdownItem`, `Error`, `Input`, `Label`, `Link`, `MenuAction`, `PickerAction`, `PickerItem`, `RedirectText`, `SecondaryLink`, `Tab`, `TabLabel`, `TermsLink`, `TermsText`, `Text`, `ToggleItem`                                                                                                                                                                   |
| `textTransform`           | `AccordionItem`, `Action`, `BlockAction`, `Button`, `Checkbox`, `CheckboxLabel`, `CodeInput`, `DropdownItem`, `Error`, `Input`, `Label`, `Link`, `MenuAction`, `PickerAction`, `PickerItem`, `RedirectText`, `SecondaryLink`, `Tab`, `TabLabel`, `TermsLink`, `TermsText`, `Text`, `ToggleItem`                                                                                                                                                                   |
| `transition`              | `Action`, `Block`, `BlockAction`, `Button`, `CheckboxInput`, `CheckboxLabel`, `CodeInput`, `Dropdown`, `DropdownItem`, `Error`, `Icon`, `Input`, `InputCloseIcon`, `Label`, `Link`, `MenuAction`, `MenuIcon`, `PasscodeCloseIcon`, `PasscodeShowIcon`, `PickerAction`, `PickerItem`, `RadioIconInner`, `RadioIconOuter`, `RedirectText`, `SecondaryLink`, `Switch`, `SwitchControl`, `Tab`, `TabIcon`, `TabLabel`, `TermsLink`, `TermsText`, `Text`, `ToggleItem` |
| `width`                   | `RadioIcon`                                                                                                                                                                                                                                                                                                                                                                                                                                                       |

Some exceptions to the properties above are:

* `-webkit-text-fill-color` isn’t compatible with pseudo-classes

## Other configuration options 

In addition to `themes`, `variables` and `rules`, we have provided additional appearance configuration options to style Elements.

You can customize these by adding them to the appearance object:

```js
const appearance = {
  labels: 'floating',

  // other configurations such as `theme`, `variables` and `rules`...
}
```

We currently support the below options:

| Configuration       | Description                                                                                                                           |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `disableAnimations` | Disables animations throughout Elements. Boolean, defaults to `false`.                                                                |
| `labels`            | Enables switching between labels above form fields and floating labels within the form fields; it can be either `above` or `floating` |