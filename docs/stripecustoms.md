---
title: stripecustoms
status: STABLE
updated: 2025-06-28
---

# Accept in-app payments

Build a customized payments integration in your iOS, Android, or React Native app using the Payment Sheet.

The Payment Sheet is a customizable component that displays a list of payment methods and collects payment details in your app using a bottom sheet.

# Accept a payment

> This is a Accept a payment for when platform is ios and type is payment. View the original doc at https://docs.stripe.com/payments/mobile/accept-payment?platform=ios&type=payment.

A PaymentIntent flow allows you to create a charge in your app. When confirming the charge, you can optionally save payment methods. In this integration, you render the Payment Sheet, create a *PaymentIntent*, and confirm a charge in your app.

## Set up Stripe

### Server-side 

This integration requires endpoints on your server that talk to the Stripe API. Use our official libraries for access to the Stripe API from your server:

```bash
\# Available as a gem
sudo gem install stripe
```

```ruby
\# If you use bundler, you can add this line to your Gemfile
gem 'stripe'
```

```bash
\# Install through pip
pip3 install --upgrade stripe
```

```bash
\# Or find the Stripe package on http://pypi.python.org/pypi/stripe/
```

```python
\# Find the version you want to pin:
# https://github.com/stripe/stripe-python/blob/master/CHANGELOG.md
# Specify that version in your requirements.txt file
stripe>=5.0.0
```

```bash
\# Install the PHP library with Composer
composer require stripe/stripe-php
```

```bash
\# Or download the source directly: https://github.com/stripe/stripe-php/releases
```

```java
/*
  For Gradle, add the following dependency to your build.gradle and replace with
  the version number you want to use from:
  - https://mvnrepository.com/artifact/com.stripe/stripe-java or
  - https://github.com/stripe/stripe-java/releases/latest
*/
implementation "com.stripe:stripe-java:29.0.0"
```

```xml
<!--
  For Maven, add the following dependency to your POM and replace with the
  version number you want to use from:
  - https://mvnrepository.com/artifact/com.stripe/stripe-java or
  - https://github.com/stripe/stripe-java/releases/latest
-->
<dependency>
  <groupId>com.stripe</groupId>
  <artifactId>stripe-java</artifactId>
  <version>29.0.0</version>
</dependency>
```

```bash
\# For other environments, manually install the following JARs:
# - The Stripe JAR from https://github.com/stripe/stripe-java/releases/latest
# - Google Gson from https://github.com/google/gson
```

```bash
\# Install with npm
npm install stripe --save
```

```bash
\# Make sure your project is using Go Modules
go mod init
# Install stripe-go
go get -u github.com/stripe/stripe-go/v82
```

```go
// Then import the package
import (
  "github.com/stripe/stripe-go/v82"
)
```

```bash
\# Install with dotnet
dotnet add package Stripe.net
dotnet restore
```

```bash
\# Or install with NuGet
Install-Package Stripe.net
```

### Client-side 

The [Stripe iOS SDK](https://github.com/stripe/stripe-ios) is open source, [fully documented](https://stripe.dev/stripe-ios/index.html), and compatible with apps supporting iOS {{minimumiOSVersion}} or above.

For details on the latest SDK release and past versions, see the [Releases](https://github.com/stripe/stripe-ios/releases) page on GitHub. To receive notifications when a new release is published, [watch releases](https://help.github.com/en/articles/watching-and-unwatching-releases-for-a-repository#watching-releases-for-a-repository) for the repository.

You also need to set your [publishable key](https://dashboard.stripe.com/apikeys) so that the SDK can make API calls to Stripe. To get started quickly, you can hardcode this on the client while you’re integrating, but fetch the publishable key from your server in production.

```swift
// Set your publishable key: remember to change this to your live publishable key in production
// See your keys here: https://dashboard.stripe.com/apikeys
STPAPIClient.shared.publishableKey = "<<publishable key>>"
```

## Enable payment methods

## Test the integration

| Card number         | Scenario                                                            | How to test                                                                                           |
| ------------------- | ------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| 4242424242424242    | The card payment succeeds and doesn’t require authentication.       | Fill out the credit card form using the credit card number with any expiration, CVC, and postal code. |
| 4000002500003155    | The card payment requires *authentication*.                         | Fill out the credit card form using the credit card number with any expiration, CVC, and postal code. |
| 4000000000009995    | The card is declined with a decline code like `insufficient_funds`. | Fill out the credit card form using the credit card number with any expiration, CVC, and postal code. |
| 6205500000000000004 | The UnionPay card has a variable length of 13-19 digits.            | Fill out the credit card form using the credit card number with any expiration, CVC, and postal code. |

| Payment method | Scenario                                                                                                                                                                   | How to test                                                                                                                                              |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
|                | Your customer fails to authenticate on the redirect page for a redirect-based and immediate notification payment method.                                                   | Choose any redirect-based payment method, fill out the required details, and confirm the payment. Then click **Fail test payment** on the redirect page. |
| Pay by Bank    | Your customer successfully pays with a redirect-based and [delayed notification](https://docs.stripe.com/payments/payment-methods.md#payment-notification) payment method. | Choose the payment method, fill out the required details, and confirm the payment. Then click **Complete test payment** on the redirect page.            |
| Pay by Bank    | Your customer fails to authenticate on the redirect page for a redirect-based and delayed notification payment method.                                                     | Choose the payment method, fill out the required details, and confirm the payment. Then click **Fail test payment** on the redirect page.                |

| Payment method    | Scenario                                                                                          | How to test                                                                                                                                                                                       |
| ----------------- | ------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| SEPA Direct Debit | Your customer successfully pays with SEPA Direct Debit.                                           | Fill out the form using the account number `AT321904300235473204`. The confirmed PaymentIntent initially transitions to processing, then transitions to the succeeded status three minutes later. |
| SEPA Direct Debit | Your customer’s payment intent status transitions from `processing` to `requires_payment_method`. | Fill out the form using the account number `AT861904300235473202`.                                                                                                                                |

See [Testing](https://docs.stripe.com/testing.md) for additional information to test your integration.

## Enable saved cards

## Allow delayed payment methods

*Delayed payment methods* don’t guarantee that you’ll receive funds from your customer at the end of the checkout either because they take time to settle (for example, US Bank Accounts, SEPA Debit, iDEAL, and Bancontact) or because they require customer action to complete (for example, OXXO, Konbini, and Boleto).

## Enable Apple Pay

If your checkout screen has a dedicated **Apple Pay** button, follow the [Apple Pay guide](https://docs.stripe.com/apple-pay.md#present-payment-sheet) and use `ApplePayContext` to collect payment from your **Apple Pay** button. You can use  to handle other payment method types.

## Enable card scanning

To enable card scanning support, set the `NSCameraUsageDescription` (**Privacy - Camera Usage Description**) in the Info.plist of your application, and provide a reason for accessing the camera (for example, “To scan cards”). Devices with iOS 13 or higher support card scanning.

# Collect and save a payment method

> This is a Collect and save a payment method for when platform is ios and type is setup. View the original doc at https://docs.stripe.com/payments/mobile/accept-payment?platform=ios&type=setup.

A SetupIntent flow allows you to save payment methods for future payments without creating a charge. In this integration, you render the Payment Sheet, create a *SetupIntent*, and save the payment method in your app.

## Set up Stripe

### Server-side 

This integration requires endpoints on your server that talk to the Stripe API. Use our official libraries for access to the Stripe API from your server:

```bash
\# Available as a gem
sudo gem install stripe
```

```ruby
\# If you use bundler, you can add this line to your Gemfile
gem 'stripe'
```

```bash
\# Install through pip
pip3 install --upgrade stripe
```

```bash
\# Or find the Stripe package on http://pypi.python.org/pypi/stripe/
```

```python
\# Find the version you want to pin:
# https://github.com/stripe/stripe-python/blob/master/CHANGELOG.md
# Specify that version in your requirements.txt file
stripe>=5.0.0
```

```bash
\# Install the PHP library with Composer
composer require stripe/stripe-php
```

```bash
\# Or download the source directly: https://github.com/stripe/stripe-php/releases
```

```java
/*
  For Gradle, add the following dependency to your build.gradle and replace with
  the version number you want to use from:
  - https://mvnrepository.com/artifact/com.stripe/stripe-java or
  - https://github.com/stripe/stripe-java/releases/latest
*/
implementation "com.stripe:stripe-java:29.0.0"
```

```xml
<!--
  For Maven, add the following dependency to your POM and replace with the
  version number you want to use from:
  - https://mvnrepository.com/artifact/com.stripe/stripe-java or
  - https://github.com/stripe/stripe-java/releases/latest
-->
<dependency>
  <groupId>com.stripe</groupId>
  <artifactId>stripe-java</artifactId>
  <version>29.0.0</version>
</dependency>
```

```bash
\# For other environments, manually install the following JARs:
# - The Stripe JAR from https://github.com/stripe/stripe-java/releases/latest
# - Google Gson from https://github.com/google/gson
```

```bash
\# Install with npm
npm install stripe --save
```

```bash
\# Make sure your project is using Go Modules
go mod init
# Install stripe-go
go get -u github.com/stripe/stripe-go/v82
```

```go
// Then import the package
import (
  "github.com/stripe/stripe-go/v82"
)
```

```bash
\# Install with dotnet
dotnet add package Stripe.net
dotnet restore
```

```bash
\# Or install with NuGet
Install-Package Stripe.net
```

### Client-side 

The [Stripe iOS SDK](https://github.com/stripe/stripe-ios) is open source, [fully documented](https://stripe.dev/stripe-ios/index.html), and compatible with apps supporting iOS {{minimumiOSVersion}} or above.

For details on the latest SDK release and past versions, see the [Releases](https://github.com/stripe/stripe-ios/releases) page on GitHub. To receive notifications when a new release is published, [watch releases](https://help.github.com/en/articles/watching-and-unwatching-releases-for-a-repository#watching-releases-for-a-repository) for the repository.

You also need to set your [publishable key](https://dashboard.stripe.com/apikeys) so that the SDK can make API calls to Stripe. To get started quickly, you can hardcode this on the client while you’re integrating, but fetch the publishable key from your server in production.

```swift
// Set your publishable key: remember to change this to your live publishable key in production
// See your keys here: https://dashboard.stripe.com/apikeys
STPAPIClient.shared.publishableKey = "<<publishable key>>"
```

## Enable payment methods

## Test the integration

| Card number         | Scenario                                                            | How to test                                                                                           |
| ------------------- | ------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| 4242424242424242    | The card payment succeeds and doesn’t require authentication.       | Fill out the credit card form using the credit card number with any expiration, CVC, and postal code. |
| 4000002500003155    | The card payment requires *authentication*.                         | Fill out the credit card form using the credit card number with any expiration, CVC, and postal code. |
| 4000000000009995    | The card is declined with a decline code like `insufficient_funds`. | Fill out the credit card form using the credit card number with any expiration, CVC, and postal code. |
| 6205500000000000004 | The UnionPay card has a variable length of 13-19 digits.            | Fill out the credit card form using the credit card number with any expiration, CVC, and postal code. |

| Payment method | Scenario                                                                                                                                                                   | How to test                                                                                                                                              |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
|                | Your customer fails to authenticate on the redirect page for a redirect-based and immediate notification payment method.                                                   | Choose any redirect-based payment method, fill out the required details, and confirm the payment. Then click **Fail test payment** on the redirect page. |
| Pay by Bank    | Your customer successfully pays with a redirect-based and [delayed notification](https://docs.stripe.com/payments/payment-methods.md#payment-notification) payment method. | Choose the payment method, fill out the required details, and confirm the payment. Then click **Complete test payment** on the redirect page.            |
| Pay by Bank    | Your customer fails to authenticate on the redirect page for a redirect-based and delayed notification payment method.                                                     | Choose the payment method, fill out the required details, and confirm the payment. Then click **Fail test payment** on the redirect page.                |

| Payment method    | Scenario                                                                                          | How to test                                                                                                                                                                                       |
| ----------------- | ------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| SEPA Direct Debit | Your customer successfully pays with SEPA Direct Debit.                                           | Fill out the form using the account number `AT321904300235473204`. The confirmed PaymentIntent initially transitions to processing, then transitions to the succeeded status three minutes later. |
| SEPA Direct Debit | Your customer’s payment intent status transitions from `processing` to `requires_payment_method`. | Fill out the form using the account number `AT861904300235473202`.                                                                                                                                |

See [Testing](https://docs.stripe.com/testing.md) for additional information to test your integration.

## Enable saved cards

## Allow delayed payment methods

*Delayed payment methods* don’t guarantee that you’ll receive funds from your customer at the end of the checkout either because they take time to settle (for example, US Bank Accounts, SEPA Debit, iDEAL, and Bancontact) or because they require customer action to complete (for example, OXXO, Konbini, and Boleto).

## Enable Apple Pay

If your checkout screen has a dedicated **Apple Pay** button, follow the [Apple Pay guide](https://docs.stripe.com/apple-pay.md#present-payment-sheet) and use `ApplePayContext` to collect payment from your **Apple Pay** button. You can use  to handle other payment method types.

## Enable card scanning

To enable card scanning support, set the `NSCameraUsageDescription` (**Privacy - Camera Usage Description**) in the Info.plist of your application, and provide a reason for accessing the camera (for example, “To scan cards”). Devices with iOS 13 or higher support card scanning.

# Accept a payment

> This is a Accept a payment for when platform is android and type is payment. View the original doc at https://docs.stripe.com/payments/mobile/accept-payment?platform=android&type=payment.

The Payment Element allows you to accept multiple payment methods using a single integration. In this integration, you build a custom payment flow where you render the Payment Element, create the *PaymentIntent*, and confirm the payment in your app. To confirm the payment on the server instead, see [Finalize payments on the server](https://docs.stripe.com/payments/finalize-payments-on-the-server.md).

## Set up Stripe

### Server-side 

This integration requires endpoints on your server that talk to the Stripe API. Use the official libraries for access to the Stripe API from your server:

```bash
\# Available as a gem
sudo gem install stripe
```

```ruby
\# If you use bundler, you can add this line to your Gemfile
gem 'stripe'
```

```bash
\# Install through pip
pip3 install --upgrade stripe
```

```bash
\# Or find the Stripe package on http://pypi.python.org/pypi/stripe/
```

```python
\# Find the version you want to pin:
# https://github.com/stripe/stripe-python/blob/master/CHANGELOG.md
# Specify that version in your requirements.txt file
stripe>=5.0.0
```

```bash
\# Install the PHP library with Composer
composer require stripe/stripe-php
```

```bash
\# Or download the source directly: https://github.com/stripe/stripe-php/releases
```

```java
/*
  For Gradle, add the following dependency to your build.gradle and replace with
  the version number you want to use from:
  - https://mvnrepository.com/artifact/com.stripe/stripe-java or
  - https://github.com/stripe/stripe-java/releases/latest
*/
implementation "com.stripe:stripe-java:29.0.0"
```

```xml
<!--
  For Maven, add the following dependency to your POM and replace with the
  version number you want to use from:
  - https://mvnrepository.com/artifact/com.stripe/stripe-java or
  - https://github.com/stripe/stripe-java/releases/latest
-->
<dependency>
  <groupId>com.stripe</groupId>
  <artifactId>stripe-java</artifactId>
  <version>29.0.0</version>
</dependency>
```

```bash
\# For other environments, manually install the following JARs:
# - The Stripe JAR from https://github.com/stripe/stripe-java/releases/latest
# - Google Gson from https://github.com/google/gson
```

```bash
\# Install with npm
npm install stripe --save
```

```bash
\# Make sure your project is using Go Modules
go mod init
# Install stripe-go
go get -u github.com/stripe/stripe-go/v82
```

```go
// Then import the package
import (
  "github.com/stripe/stripe-go/v82"
)
```

```bash
\# Install with dotnet
dotnet add package Stripe.net
dotnet restore
```

```bash
\# Or install with NuGet
Install-Package Stripe.net
```

### Client-side 

```kotlin
plugins {
    id("com.android.application")
}

android { ... }

dependencies {
  // ...

}
```

```groovy
apply plugin: 'com.android.application'

android { ... }

dependencies {
  // ...

}
```

For details on the latest SDK release and past versions, see the [Releases](https://github.com/stripe/stripe-android/releases) page on GitHub. To receive notifications when a new release is published, [watch releases for the repository](https://docs.github.com/en/github/managing-subscriptions-and-notifications-on-github/configuring-notifications#configuring-your-watch-settings-for-an-individual-repository).

You also need to set your [publishable key](https://dashboard.stripe.com/apikeys) so that the SDK can make API calls to Stripe. To get started quickly, you can hardcode this on the client while you’re integrating, but fetch the publishable key from your server in production.

```kotlin
// Set your publishable key: remember to change this to your live publishable key in production
// See your keys here: https://dashboard.stripe.com/apikeys
PaymentConfiguration.init(context, publishableKey = "<<publishable key>>")
```

## Enable payment methods

## Test the integration

| Card number         | Scenario                                                            | How to test                                                                                           |
| ------------------- | ------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| 4242424242424242    | The card payment succeeds and doesn’t require authentication.       | Fill out the credit card form using the credit card number with any expiration, CVC, and postal code. |
| 4000002500003155    | The card payment requires *authentication*.                         | Fill out the credit card form using the credit card number with any expiration, CVC, and postal code. |
| 4000000000009995    | The card is declined with a decline code like `insufficient_funds`. | Fill out the credit card form using the credit card number with any expiration, CVC, and postal code. |
| 6205500000000000004 | The UnionPay card has a variable length of 13-19 digits.            | Fill out the credit card form using the credit card number with any expiration, CVC, and postal code. |

| Payment method | Scenario                                                                                                                                                                   | How to test                                                                                                                                              |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
|                | Your customer fails to authenticate on the redirect page for a redirect-based and immediate notification payment method.                                                   | Choose any redirect-based payment method, fill out the required details, and confirm the payment. Then click **Fail test payment** on the redirect page. |
| Pay by Bank    | Your customer successfully pays with a redirect-based and [delayed notification](https://docs.stripe.com/payments/payment-methods.md#payment-notification) payment method. | Choose the payment method, fill out the required details, and confirm the payment. Then click **Complete test payment** on the redirect page.            |
| Pay by Bank    | Your customer fails to authenticate on the redirect page for a redirect-based and delayed notification payment method.                                                     | Choose the payment method, fill out the required details, and confirm the payment. Then click **Fail test payment** on the redirect page.                |

| Payment method    | Scenario                                                                                          | How to test                                                                                                                                                                                       |
| ----------------- | ------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| SEPA Direct Debit | Your customer successfully pays with SEPA Direct Debit.                                           | Fill out the form using the account number `AT321904300235473204`. The confirmed PaymentIntent initially transitions to processing, then transitions to the succeeded status three minutes later. |
| SEPA Direct Debit | Your customer’s payment intent status transitions from `processing` to `requires_payment_method`. | Fill out the form using the account number `AT861904300235473202`.                                                                                                                                |

See [Testing](https://docs.stripe.com/testing.md) for additional information to test your integration.

## Enable saved cards

## Allow delayed payment methods

*Delayed payment methods* don’t guarantee that you’ll receive funds from your customer at the end of checkout, either because they take time to settle (for example, US Bank Accounts, SEPA Debit, iDEAL, Bancontact, and Sofort) or because they require customer action to complete (for example, OXXO, Konbini, and Boleto).

## Enable Google Pay

If your checkout screen has a dedicated **Google Pay** button, follow the [Google Pay guide](https://docs.stripe.com/google-pay.md?platform=android). You can use PaymentSheet to handle other payment method types.

## Enable card scanning

To enable card scanning support, add `stripecardscan` to the `dependencies` block of your [app/build.gradle](https://developer.android.com/studio/build/dependencies) file:

```groovy
apply plugin: 'com.android.application'

android { ... }

dependencies {
  // ...

  // StripeCardScan
  implementation 'com.stripe:stripecardscan:21.12.0'
}
```

```kotlin
plugins {
    id("com.android.application")
}

android { ... }

dependencies {
  // ...

  // StripeCardScan
  implementation("com.stripe:stripecardscan:21.12.0")
}
```

## Customize the sheet

# Collect and save a payment method

> This is a Collect and save a payment method for when platform is android and type is setup. View the original doc at https://docs.stripe.com/payments/mobile/accept-payment?platform=android&type=setup.

A SetupIntent flow allows you to collect payment method details and save them for future payments without creating a charge. In this integration, you build a custom flow where you render the Payment Element, create the *SetupIntent*, and confirm saving the payment method in your app.

## Set up Stripe

### Server-side 

This integration requires endpoints on your server that talk to the Stripe API. Use the official libraries for access to the Stripe API from your server:

```bash
\# Available as a gem
sudo gem install stripe
```

```ruby
\# If you use bundler, you can add this line to your Gemfile
gem 'stripe'
```

```bash
\# Install through pip
pip3 install --upgrade stripe
```

```bash
\# Or find the Stripe package on http://pypi.python.org/pypi/stripe/
```

```python
\# Find the version you want to pin:
# https://github.com/stripe/stripe-python/blob/master/CHANGELOG.md
# Specify that version in your requirements.txt file
stripe>=5.0.0
```

```bash
\# Install the PHP library with Composer
composer require stripe/stripe-php
```

```bash
\# Or download the source directly: https://github.com/stripe/stripe-php/releases
```

```java
/*
  For Gradle, add the following dependency to your build.gradle and replace with
  the version number you want to use from:
  - https://mvnrepository.com/artifact/com.stripe/stripe-java or
  - https://github.com/stripe/stripe-java/releases/latest
*/
implementation "com.stripe:stripe-java:29.0.0"
```

```xml
<!--
  For Maven, add the following dependency to your POM and replace with the
  version number you want to use from:
  - https://mvnrepository.com/artifact/com.stripe/stripe-java or
  - https://github.com/stripe/stripe-java/releases/latest
-->
<dependency>
  <groupId>com.stripe</groupId>
  <artifactId>stripe-java</artifactId>
  <version>29.0.0</version>
</dependency>
```

```bash
\# For other environments, manually install the following JARs:
# - The Stripe JAR from https://github.com/stripe/stripe-java/releases/latest
# - Google Gson from https://github.com/google/gson
```

```bash
\# Install with npm
npm install stripe --save
```

```bash
\# Make sure your project is using Go Modules
go mod init
# Install stripe-go
go get -u github.com/stripe/stripe-go/v82
```

```go
// Then import the package
import (
  "github.com/stripe/stripe-go/v82"
)
```

```bash
\# Install with dotnet
dotnet add package Stripe.net
dotnet restore
```

```bash
\# Or install with NuGet
Install-Package Stripe.net
```

### Client-side 

```kotlin
plugins {
    id("com.android.application")
}

android { ... }

dependencies {
  // ...

}
```

```groovy
apply plugin: 'com.android.application'

android { ... }

dependencies {
  // ...

}
```

For details on the latest SDK release and past versions, see the [Releases](https://github.com/stripe/stripe-android/releases) page on GitHub. To receive notifications when a new release is published, [watch releases for the repository](https://docs.github.com/en/github/managing-subscriptions-and-notifications-on-github/configuring-notifications#configuring-your-watch-settings-for-an-individual-repository).

You also need to set your [publishable key](https://dashboard.stripe.com/apikeys) so that the SDK can make API calls to Stripe. To get started quickly, you can hardcode this on the client while you’re integrating, but fetch the publishable key from your server in production.

```kotlin
// Set your publishable key: remember to change this to your live publishable key in production
// See your keys here: https://dashboard.stripe.com/apikeys
PaymentConfiguration.init(context, publishableKey = "<<publishable key>>")
```

## Enable payment methods

## Test the integration

| Card number         | Scenario                                                            | How to test                                                                                           |
| ------------------- | ------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| 4242424242424242    | The card payment succeeds and doesn’t require authentication.       | Fill out the credit card form using the credit card number with any expiration, CVC, and postal code. |
| 4000002500003155    | The card payment requires *authentication*.                         | Fill out the credit card form using the credit card number with any expiration, CVC, and postal code. |
| 4000000000009995    | The card is declined with a decline code like `insufficient_funds`. | Fill out the credit card form using the credit card number with any expiration, CVC, and postal code. |
| 6205500000000000004 | The UnionPay card has a variable length of 13-19 digits.            | Fill out the credit card form using the credit card number with any expiration, CVC, and postal code. |

| Payment method | Scenario                                                                                                                                                                   | How to test                                                                                                                                              |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
|                | Your customer fails to authenticate on the redirect page for a redirect-based and immediate notification payment method.                                                   | Choose any redirect-based payment method, fill out the required details, and confirm the payment. Then click **Fail test payment** on the redirect page. |
| Pay by Bank    | Your customer successfully pays with a redirect-based and [delayed notification](https://docs.stripe.com/payments/payment-methods.md#payment-notification) payment method. | Choose the payment method, fill out the required details, and confirm the payment. Then click **Complete test payment** on the redirect page.            |
| Pay by Bank    | Your customer fails to authenticate on the redirect page for a redirect-based and delayed notification payment method.                                                     | Choose the payment method, fill out the required details, and confirm the payment. Then click **Fail test payment** on the redirect page.                |

| Payment method    | Scenario                                                                                          | How to test                                                                                                                                                                                       |
| ----------------- | ------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| SEPA Direct Debit | Your customer successfully pays with SEPA Direct Debit.                                           | Fill out the form using the account number `AT321904300235473204`. The confirmed PaymentIntent initially transitions to processing, then transitions to the succeeded status three minutes later. |
| SEPA Direct Debit | Your customer’s payment intent status transitions from `processing` to `requires_payment_method`. | Fill out the form using the account number `AT861904300235473202`.                                                                                                                                |

See [Testing](https://docs.stripe.com/testing.md) for additional information to test your integration.

## Enable saved cards

## Allow delayed payment methods

*Delayed payment methods* don’t guarantee that you’ll receive funds from your customer at the end of checkout, either because they take time to settle (for example, US Bank Accounts, SEPA Debit, iDEAL, Bancontact, and Sofort) or because they require customer action to complete (for example, OXXO, Konbini, and Boleto).

## Enable Google Pay

If your checkout screen has a dedicated **Google Pay** button, follow the [Google Pay guide](https://docs.stripe.com/google-pay.md?platform=android). You can use PaymentSheet to handle other payment method types.

## Enable card scanning

To enable card scanning support, add `stripecardscan` to the `dependencies` block of your [app/build.gradle](https://developer.android.com/studio/build/dependencies) file:

```groovy
apply plugin: 'com.android.application'

android { ... }

dependencies {
  // ...

  // StripeCardScan
  implementation 'com.stripe:stripecardscan:21.12.0'
}
```

```kotlin
plugins {
    id("com.android.application")
}

android { ... }

dependencies {
  // ...

  // StripeCardScan
  implementation("com.stripe:stripecardscan:21.12.0")
}
```

## Customize the sheet

# Accept a payment

> This is a Accept a payment for when platform is react-native and type is payment. View the original doc at https://docs.stripe.com/payments/mobile/accept-payment?platform=react-native&type=payment.

The Payment Element allows you to accept multiple payment methods using a single integration. In this integration, you build a custom payment flow where you render the Payment Element, create the *PaymentIntent*, and confirm the payment in your app. To confirm the payment on the server instead, see [Finalize payments on the server](https://docs.stripe.com/payments/finalize-payments-on-the-server.md).

## Set up Stripe

### Server-side 

This integration requires endpoints on your server that talk to the Stripe API. Use our official libraries for access to the Stripe API from your server:

```bash
\# Available as a gem
sudo gem install stripe
```

```ruby
\# If you use bundler, you can add this line to your Gemfile
gem 'stripe'
```

```bash
\# Install through pip
pip3 install --upgrade stripe
```

```bash
\# Or find the Stripe package on http://pypi.python.org/pypi/stripe/
```

```python
\# Find the version you want to pin:
# https://github.com/stripe/stripe-python/blob/master/CHANGELOG.md
# Specify that version in your requirements.txt file
stripe>=5.0.0
```

```bash
\# Install the PHP library with Composer
composer require stripe/stripe-php
```

```bash
\# Or download the source directly: https://github.com/stripe/stripe-php/releases
```

```java
/*
  For Gradle, add the following dependency to your build.gradle and replace with
  the version number you want to use from:
  - https://mvnrepository.com/artifact/com.stripe/stripe-java or
  - https://github.com/stripe/stripe-java/releases/latest
*/
implementation "com.stripe:stripe-java:29.0.0"
```

```xml
<!--
  For Maven, add the following dependency to your POM and replace with the
  version number you want to use from:
  - https://mvnrepository.com/artifact/com.stripe/stripe-java or
  - https://github.com/stripe/stripe-java/releases/latest
-->
<dependency>
  <groupId>com.stripe</groupId>
  <artifactId>stripe-java</artifactId>
  <version>29.0.0</version>
</dependency>
```

```bash
\# For other environments, manually install the following JARs:
# - The Stripe JAR from https://github.com/stripe/stripe-java/releases/latest
# - Google Gson from https://github.com/google/gson
```

```bash
\# Install with npm
npm install stripe --save
```

```bash
\# Make sure your project is using Go Modules
go mod init
# Install stripe-go
go get -u github.com/stripe/stripe-go/v82
```

```go
// Then import the package
import (
  "github.com/stripe/stripe-go/v82"
)
```

```bash
\# Install with dotnet
dotnet add package Stripe.net
dotnet restore
```

```bash
\# Or install with NuGet
Install-Package Stripe.net
```

### Client-side 

The [React Native SDK](https://github.com/stripe/stripe-react-native) is open source and fully documented. Internally, it uses the [native iOS](https://github.com/stripe/stripe-ios) and [Android](https://github.com/stripe/stripe-android) SDKs. To install Stripe’s React Native SDK, run one of the following commands in your project’s directory (depending on which package manager you use):

```bash
yarn add @stripe/stripe-react-native
```

```bash
npm install @stripe/stripe-react-native
```

Next, install some other necessary dependencies:

- For iOS, navigate to the **ios** directory and run `pod install` to ensure that you also install the required native dependencies.
- For Android, there are no more dependencies to install.

### Stripe initialization

To initialize Stripe in your React Native app, either wrap your payment screen with the `StripeProvider` component, or use the `initStripe` initialization method. Only the API [publishable key](https://docs.stripe.com/keys.md#obtain-api-keys) in `publishableKey` is required. The following example shows how to initialize Stripe using the `StripeProvider` component.

```javascript
import { StripeProvider } from '@stripe/stripe-react-native';

function App() {
  const [publishableKey, setPublishableKey] = useState('');

  const fetchPublishableKey = async () => {
    const key = await fetchKey(); // fetch key from your server here
    setPublishableKey(key);
  };

  useEffect(() => {
    fetchPublishableKey();
  }, []);

  return (
    <StripeProvider
      publishableKey={publishableKey}
      merchantIdentifier="merchant.identifier" // required for Apple Pay
      urlScheme="your-url-scheme" // required for 3D Secure and bank redirects
    >
      // Your app code here
    </StripeProvider>
  );
}
```

Use your API [test keys](https://docs.stripe.com/keys.md#obtain-api-keys) while you test and develop, and your [live mode](https://docs.stripe.com/keys.md#test-live-modes) keys when you publish your app.

## Enable payment methods

## Set up a return URL

When a customer exits your app, for example to authenticate in Safari or their banking app, provide a way for them to automatically return to your app afterward. Many payment method types **require** a return URL, so if you fail to provide it, we can’t present those payment methods to your user, even if you’ve enabled them.

To provide a return URL:

1. [Register](https://developer.apple.com/documentation/xcode/defining-a-custom-url-scheme-for-your-app#Register-your-URL-scheme) a custom URL. Universal links aren’t supported.
1. [Configure](https://reactnative.dev/docs/linking) your custom URL.
1. Set up your root component to forward the URL to the Stripe SDK as shown below.

If you’re using Expo, [set your scheme](https://docs.expo.io/guides/linking/#in-a-standalone-app) in the `app.json` file.

```jsx
import React, { useEffect, useCallback } from 'react';
import { Linking } from 'react-native';
import { useStripe } from '@stripe/stripe-react-native';

export default function MyApp() {
  const { handleURLCallback } = useStripe();

  const handleDeepLink = useCallback(
    async (url: string | null) => {
      if (url) {
        const stripeHandled = await handleURLCallback(url);
        if (stripeHandled) {
          // This was a Stripe URL - you can return or add extra handling here as you see fit
        } else {
          // This was NOT a Stripe URL – handle as you normally would
        }
      }
    },
    [handleURLCallback]
  );

  useEffect(() => {
    const getUrlAsync = async () => {
      const initialUrl = await Linking.getInitialURL();
      handleDeepLink(initialUrl);
    };

    getUrlAsync();

    const deepLinkListener = Linking.addEventListener(
      'url',
      (event: { url: string }) => {
        handleDeepLink(event.url);
      }
    );

    return () => deepLinkListener.remove();
  }, [handleDeepLink]);

  return (
    <View>
      <AwesomeAppComponent />
    </View>
  );
}
```

For more information on native URL schemes, refer to the [Android](https://developer.android.com/training/app-links/deep-linking) and [iOS](https://developer.apple.com/documentation/xcode/allowing_apps_and_websites_to_link_to_your_content/defining_a_custom_url_scheme_for_your_app) docs.

## Collect payment details

The integration can use the default payment flow or a custom flow.

| Default                                                       | Custom flow                                                    |
| ------------------------------------------------------------- | -------------------------------------------------------------- |
| ![PaymentSheet](images/mobile/payment-sheet/ios-overview.png) | ![Custom flow](images/mobile/payment-sheet/ios-multi-step.png) |

### Initialize PaymentSheet

When you’re ready to , initialize the PaymentSheet with an `intentConfiguration`. The `intentConfiguration` object contains details about the specific , and a `confirmHandler` callback.

```jsx
import { useStripe } from '@stripe/stripe-react-native';
import {View, Button} from 'react-native';

export default function CheckoutScreen() {
  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  const initializePaymentSheet = async () => {
    const { error } = await initPaymentSheet({
      merchantDisplayName: "Example, Inc.",
      intentConfiguration: {
        mode: {
        },
        confirmHandler: confirmHandler
      }
    });
    if (error) {
      // handle error
    }
  };

  useEffect(() => {
    initializePaymentSheet();
  }, []);

  const confirmHandler = async (paymentMethod, shouldSavePaymentMethod, intentCreationCallback) => {
    // explained later
  }

  const didTapCheckoutButton = async () => {
    // implement later
  }
  return (
    <View>
      <Button
        title="Checkout"
        onPress={didTapCheckoutButton}
      />
    </View>
  );
}
```

### Present PaymentSheet

```jsx
export default function CheckoutScreen() {
  // ...
  const didTapCheckoutButton = async () => {
    const { error } = await presentPaymentSheet();

    if (error) {
      if (error.code === PaymentSheetError.Canceled) {
        // Customer canceled - you should probably do nothing.
      } else {
        // PaymentSheet encountered an unrecoverable error. You can display the error to the user, log it, etc.
      }
    } else {
      //  completed - show a confirmation screen.
    }
  }
  // ...
}

```

### Confirm the payment

When the customer taps  in the PaymentSheet, it calls the callback you passed to `initPaymentSheet` with a [PaymentMethod.Result](https://stripe.dev/stripe-react-native/api-reference/interfaces/PaymentMethod.Result.html) object representing the customer’s payment details.

When the request returns, call the `intentCreationCallback` with your server response’s client secret or an error. The PaymentSheet  the  using the client secret.

```jsx
export default function CheckoutScreen() {
  // ...

  const confirmHandler = async (paymentMethod, shouldSavePaymentMethod, intentCreationCallback) => {
    // Make a request to your own server.
    // Call the `intentCreationCallback` with your server response's client secret or error
    const { client_secret, error } = await response.json();
    if (client_secret) {
      intentCreationCallback({clientSecret: client_secret});
    } else {
      intentCreationCallback({error});
    }
  }
  // ...
}
```

This integration assumes that your checkout screen has two buttons: a **Payment Method** button that presents the PaymentSheet to collect payment details, and a .

### Initialize PaymentSheet

When your checkout screen loads, initialize the PaymentSheet with an `intentConfiguration`. The `intentConfiguration` object contains details about the specific , and a `confirmHandler` callback.

First, call `initPaymentSheet` and pass `customFlow: true`. `initPaymentSheet` resolves with an initial payment option containing an image and label representing the customer’s payment method. Update your UI with these details.

```jsx
import { useStripe } from '@stripe/stripe-react-native';
import {View, Button} from 'react-native';

export default function CheckoutScreen() {
  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  const initializePaymentSheet = async () => {
    const { error, paymentOption } = await initPaymentSheet({
      merchantDisplayName: "Example, Inc.",
      customFlow: true,
      intentConfiguration: {
        mode: {
        },
        confirmHandler: handleConfirmation
      }
    });
    if (error) {
      // handle error
    }
    // Update your UI with paymentOption
  };

  useEffect(() => {
    initializePaymentSheet();
  }, []);

  const confirmHandler = async (paymentMethod, shouldSavePaymentMethod, intentCreationCallback) => {
    // explained later
  }
  const didTapCheckoutButton = async () => {
    // implement later
  }
  return (
    <View>
      <Button
        title="Checkout"
        onPress={didTapCheckoutButton}
      />
    </View>
  );
}
```

### Present PaymentSheet

When a customer taps **Payment Method**, call `presentPaymentSheet` to collect payment details. When this completes, update your UI again with the `paymentOption` property.

```javascript
const { error, paymentOption } = await presentPaymentSheet();
// Update your UI with paymentOption
```

### Confirm the payment

When the customer taps , call `confirmPaymentSheetPayment`. It calls the `confirmHandler` callback you passed to `initPaymentSheet` with a [PaymentMethod.Result](https://stripe.dev/stripe-react-native/api-reference/interfaces/PaymentMethod.Result.html) object representing the customer’s payment details.

When the request returns, call the `intentCreationCallback` with your server response’s client secret or an error. The PaymentSheet  the  using the client secret or displays the error in its UI.

```jsx
export default function CheckoutScreen() {
  // ...
  const didTapCheckoutButton = async () => {
    const { error } = await confirmPaymentSheetPayment();

    if (error) {
      // PaymentSheet encountered an unrecoverable error. You can display the error to the user, log it, etc.
    } else {
      //  completed - show a confirmation screen.
    }
  }

  const confirmHandler = async (paymentMethod, shouldSavePaymentMethod, intentCreationCallback) => {
    // Make a request to your own server, passing paymentMethod.id.
    // Your server creates a  and returns its client secret or an error message
    // Call the `intentCreationCallback` with the client secret or error
    const { client_secret, error } = await response.json();
    if (client_secret) {
      intentCreationCallback({clientSecret: client_secret});
    } else {
      intentCreationCallback({error});
    }
  }
  // ...
}

```

The server code is explained in the following step.

## Test the integration

| Card number         | Scenario                                                            | How to test                                                                                           |
| ------------------- | ------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| 4242424242424242    | The card payment succeeds and doesn’t require authentication.       | Fill out the credit card form using the credit card number with any expiration, CVC, and postal code. |
| 4000002500003155    | The card payment requires *authentication*.                         | Fill out the credit card form using the credit card number with any expiration, CVC, and postal code. |
| 4000000000009995    | The card is declined with a decline code like `insufficient_funds`. | Fill out the credit card form using the credit card number with any expiration, CVC, and postal code. |
| 6205500000000000004 | The UnionPay card has a variable length of 13-19 digits.            | Fill out the credit card form using the credit card number with any expiration, CVC, and postal code. |

| Payment method | Scenario                                                                                                                                                                   | How to test                                                                                                                                              |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
|                | Your customer fails to authenticate on the redirect page for a redirect-based and immediate notification payment method.                                                   | Choose any redirect-based payment method, fill out the required details, and confirm the payment. Then click **Fail test payment** on the redirect page. |
| Pay by Bank    | Your customer successfully pays with a redirect-based and [delayed notification](https://docs.stripe.com/payments/payment-methods.md#payment-notification) payment method. | Choose the payment method, fill out the required details, and confirm the payment. Then click **Complete test payment** on the redirect page.            |
| Pay by Bank    | Your customer fails to authenticate on the redirect page for a redirect-based and delayed notification payment method.                                                     | Choose the payment method, fill out the required details, and confirm the payment. Then click **Fail test payment** on the redirect page.                |

| Payment method    | Scenario                                                                                          | How to test                                                                                                                                                                                       |
| ----------------- | ------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| SEPA Direct Debit | Your customer successfully pays with SEPA Direct Debit.                                           | Fill out the form using the account number `AT321904300235473204`. The confirmed PaymentIntent initially transitions to processing, then transitions to the succeeded status three minutes later. |
| SEPA Direct Debit | Your customer’s payment intent status transitions from `processing` to `requires_payment_method`. | Fill out the form using the account number `AT861904300235473202`.                                                                                                                                |

See [Testing](https://docs.stripe.com/testing.md) for additional information to test your integration.

## Enable saved cards

PaymentSheet can display a **Save this card for future use** checkbox that saves the customer’s card, and display the customer’s saved cards. To enable this checkbox, create a [Customer](https://docs.stripe.com/api/customers.md) object on your server and an associated Ephemeral Key.

```javascript
const stripe = require('stripe')('sk_test_your_secret_key');

app.post('/payment-sheet', async (req, res) => {
  // Use an existing Customer ID if this is a returning customer.
  const customer = await stripe.customers.create();
  const ephemeralKey = await stripe.ephemeralKeys.create(
    {customer: customer.id},
    {apiVersion: '2020-08-27'}
  );

  res.json({
    ephemeralKey: ephemeralKey.secret,
    customer: customer.id,
  });
});
```

Next, configure PaymentSheet with the Customer’s ID and the Ephemeral Key’s client secret.

```jsx
const { error } = await initPaymentSheet({
  merchantDisplayName: "Example, Inc.",
  customerId: customer,
  customerEphemeralKeySecret: ephemeralKey,
  ...
});
```

## Allow delayed payment methods

*Delayed payment methods* don’t guarantee that you’ll receive funds from your customer at the end of checkout. That’s because they take time to settle (for example, US Bank Accounts, SEPA Debit, iDEAL, Bancontact, and Sofort) or because they require customer action to complete (for example, OXXO, Konbini, and Boleto).

By default, PaymentSheet doesn’t display delayed payment methods. To display them, when you call `initPaymentSheet`, set `allowsDelayedPaymentMethods` to `true`.

This setting only enables the display of delayed payment methods—it doesn’t activate them. For example, OXXO isn’t supported by PaymentSheet, so `allowsDelayedPaymentMethods` doesn’t allow PaymentSheet to handle OXXO payment methods. It only allows PaymentSheet to display payment methods of the delayed payment types that PaymentSheet supports. If PaymentSheet adds support for OXXO payment methods in the future, it would display them too.

```jsx
const { error } = await initPaymentSheet({
  merchantDisplayName: "Example, Inc.",
  allowsDelayedPaymentMethods: true,
  ...
});
```

If the customer successfully uses one of these delayed payment methods in PaymentSheet, the payment result returned is `.completed`.

## Enable Apple Pay

### Register for an Apple Merchant ID

Obtain an Apple Merchant ID by [registering for a new identifier](https://developer.apple.com/account/resources/identifiers/add/merchant) on the Apple Developer website.

Fill out the form with a description and identifier. Your description is for your own records and you can modify it in the future. Stripe recommends using the name of your app as the identifier (for example, `merchant.com.{{YOUR_APP_NAME}}`).

### Create a new Apple Pay certificate

Create a certificate for your app to encrypt payment data.

Go to the [iOS Certificate Settings](https://dashboard.stripe.com/settings/ios_certificates) in the Dashboard, click **Add new application**, and follow the guide.

Download a Certificate Signing Request (CSR) file to get a secure certificate from Apple that allows you to use Apple Pay.

One CSR file must be used to issue exactly one certificate. If you switch your Apple Merchant ID, you must go to the [iOS Certificate Settings](https://dashboard.stripe.com/settings/ios_certificates) in the Dashboard to obtain a new CSR and certificate.

### Integrate with Xcode

Add the Apple Pay capability to your app. In Xcode, open your project settings, click the **Signing & Capabilities** tab, and add the **Apple Pay** capability. You might be prompted to log in to your developer account at this point. Select the merchant ID you created earlier, and your app is ready to accept Apple Pay.

![](images/mobile/ios/xcode.png)
Enable the Apple Pay capability in Xcode


### Add Apple Pay

When you call `initPaymentSheet`, pass in an [ApplePayParams](https://stripe.dev/stripe-react-native/api-reference/modules/PaymentSheet.html#ApplePayParams) with `merchantCountryCode` set to the [country code of your business](https://dashboard.stripe.com/settings/account).

In accordance with [Apple’s guidelines](https://developer.apple.com/design/human-interface-guidelines/apple-pay#Supporting-subscriptions) for recurring payments, you must also set a `cardItems` that includes a [RecurringCartSummaryItem](https://stripe.dev/stripe-react-native/api-reference/modules/ApplePay.html#RecurringCartSummaryItem) with the amount you intend to charge (for example, “$59.95 a month”).

You can also adopt [merchant tokens](https://developer.apple.com/apple-pay/merchant-tokens/) by setting the `request` with its `type` set to `PaymentRequestType.Recurring`

To learn more about how to use recurring payments with Apple Pay, see [Apple’s PassKit documentation](https://developer.apple.com/documentation/passkit/pkpaymentrequest).

```javascript
const initializePaymentSheet = async () => {
  const recurringSummaryItem = {
    label: 'My Subscription',
    amount: '59.99',
    paymentType: 'Recurring',
    intervalCount: 1,
    intervalUnit: 'month',
    // Payment starts today
    startDate: new Date().getTime() / 1000,

    // Payment ends in one year
    endDate: new Date().getTime() / 1000 + 60 * 60 * 24 * 365,
  };

  const {error} = await initPaymentSheet({
    // ...
    applePay: {
      merchantCountryCode: 'US',
      cartItems: [recurringSummaryItem],
      request: {
        type: PaymentRequestType.Recurring,
        description: 'Recurring',
        managementUrl: 'https://my-backend.example.com/customer-portal',
        billing: recurringSummaryItem,
        billingAgreement:
          "You'll be billed $59.99 every month for the next 12 months. To cancel at any time, go to Account and click 'Cancel Membership.'",
      },
    },
  });
};
```

### Order tracking

To add [order tracking](https://developer.apple.com/design/human-interface-guidelines/technologies/wallet/designing-order-tracking) information in iOS 16 or later, configure a `setOrderTracking` callback function. Stripe calls your implementation after the payment is complete, but before iOS dismisses the Apple Pay sheet.

In your implementation of `setOrderTracking` callback function, fetch the order details from your server for the completed order, and pass the details to the provided `completion` function.

To learn more about order tracking, see [Apple’s Wallet Orders documentation](https://developer.apple.com/documentation/walletorders).

```javascript
await initPaymentSheet({
  // ...
  applePay: {
    // ...
    setOrderTracking: async complete => {
      const apiEndpoint =
        Platform.OS === 'ios'
          ? 'http://localhost:4242'
          : 'http://10.0.2.2:4567';
      const response = await fetch(
        `${apiEndpoint}/retrieve-order?orderId=${orderId}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );
      if (response.status === 200) {
        const orderDetails = await response.json();
        // orderDetails should include orderIdentifier, orderTypeIdentifier,
        // authenticationToken and webServiceUrl
        complete(orderDetails);
      }
    },
  },
});
```

## Enable Google Pay

### Set up your integration

To use Google Pay, first enable the Google Pay API by adding the following to the `<application>` tag of your **AndroidManifest.xml**:

```xml
<application>
  ...
  <meta-data
    android:name="com.google.android.gms.wallet.api.enabled"
    android:value="true" />
</application>
```

This guide assumes you’re using the latest version of the Stripe Android SDK.

```groovy
dependencies {
    implementation 'com.stripe:stripe-android:21.12.0'
}
```

```kotlin
dependencies {
    implementation("com.stripe:stripe-android:21.12.0")
}
```

For more details, see Google Pay’s [Set up Google Pay API](https://developers.google.com/pay/api/android/guides/setup) for Android.

### Add Google Pay

When you initialize `PaymentSheet`, pass a `merchantCountryCode` (check your account details [here](https://dashboard.stripe.com/settings/account)) and set `googlePay` to `true`.

You can also pass the `testEnv` property to use the test environment. Google Pay can only be tested on a physical Android device. Follow the [React Native docs](https://reactnative.dev/docs/running-on-device) to test your application on a physical device.

```javascript
const { error, paymentOption } = await initPaymentSheet({
  // ...
  googlePay: {
    merchantCountryCode: 'US',
    testEnv: true, // use test environment
  },
});
```

## Enable card scanning

To enable card scanning support, set the `NSCameraUsageDescription` (**Privacy - Camera Usage Description**) in the Info.plist of your application, and provide a reason for accessing the camera (for example, “To scan cards”). Devices with iOS 13 or higher support card scanning.

## Customize the sheet

All customization is configured using `initPaymentSheet`.

### Appearance

Customize colors, fonts, and so on to match the look and feel of your app by using the [appearance API](https://docs.stripe.com/elements/appearance-api.md?platform=react-native).

### Merchant display name

Specify a customer-facing business name by setting `merchantDisplayName`. By default, this is your app’s name.

```javascript
await initPaymentSheet({
  // ...
  merchantDisplayName: 'Example Inc.',
});
```

### Dark mode

By default, `PaymentSheet` automatically adapts to the user’s system-wide appearance settings (light and dark mode). You can change this by setting the `style` property to `alwaysLight` or `alwaysDark` mode on iOS.

```javascript
await initPaymentSheet({
  // ...
  style: 'alwaysDark',
});
```

On Android, set light or dark mode on your app:

```
// force dark
AppCompatDelegate.setDefaultNightMode(AppCompatDelegate.MODE_NIGHT_YES)
// force light
AppCompatDelegate.setDefaultNightMode(AppCompatDelegate.MODE_NIGHT_NO)
```

# Collect and savea payment method

> This is a Collect and savea payment method for when platform is react-native and type is setup. View the original doc at https://docs.stripe.com/payments/mobile/accept-payment?platform=react-native&type=setup.

A SetupIntent flow allows you to collect payment method details and save them for future payments without creating a charge. In this integration, you build a custom flow where you render the Payment Element, create the *SetupIntent*, and confirm saving the payment method in your app.

## Set up Stripe

### Server-side 

This integration requires endpoints on your server that talk to the Stripe API. Use our official libraries for access to the Stripe API from your server:

```bash
\# Available as a gem
sudo gem install stripe
```

```ruby
\# If you use bundler, you can add this line to your Gemfile
gem 'stripe'
```

```bash
\# Install through pip
pip3 install --upgrade stripe
```

```bash
\# Or find the Stripe package on http://pypi.python.org/pypi/stripe/
```

```python
\# Find the version you want to pin:
# https://github.com/stripe/stripe-python/blob/master/CHANGELOG.md
# Specify that version in your requirements.txt file
stripe>=5.0.0
```

```bash
\# Install the PHP library with Composer
composer require stripe/stripe-php
```

```bash
\# Or download the source directly: https://github.com/stripe/stripe-php/releases
```

```java
/*
  For Gradle, add the following dependency to your build.gradle and replace with
  the version number you want to use from:
  - https://mvnrepository.com/artifact/com.stripe/stripe-java or
  - https://github.com/stripe/stripe-java/releases/latest
*/
implementation "com.stripe:stripe-java:29.0.0"
```

```xml
<!--
  For Maven, add the following dependency to your POM and replace with the
  version number you want to use from:
  - https://mvnrepository.com/artifact/com.stripe/stripe-java or
  - https://github.com/stripe/stripe-java/releases/latest
-->
<dependency>
  <groupId>com.stripe</groupId>
  <artifactId>stripe-java</artifactId>
  <version>29.0.0</version>
</dependency>
```

```bash
\# For other environments, manually install the following JARs:
# - The Stripe JAR from https://github.com/stripe/stripe-java/releases/latest
# - Google Gson from https://github.com/google/gson
```

```bash
\# Install with npm
npm install stripe --save
```

```bash
\# Make sure your project is using Go Modules
go mod init
# Install stripe-go
go get -u github.com/stripe/stripe-go/v82
```

```go
// Then import the package
import (
  "github.com/stripe/stripe-go/v82"
)
```

```bash
\# Install with dotnet
dotnet add package Stripe.net
dotnet restore
```

```bash
\# Or install with NuGet
Install-Package Stripe.net
```

### Client-side 

The [React Native SDK](https://github.com/stripe/stripe-react-native) is open source and fully documented. Internally, it uses the [native iOS](https://github.com/stripe/stripe-ios) and [Android](https://github.com/stripe/stripe-android) SDKs. To install Stripe’s React Native SDK, run one of the following commands in your project’s directory (depending on which package manager you use):

```bash
yarn add @stripe/stripe-react-native
```

```bash
npm install @stripe/stripe-react-native
```

Next, install some other necessary dependencies:

- For iOS, navigate to the **ios** directory and run `pod install` to ensure that you also install the required native dependencies.
- For Android, there are no more dependencies to install.

### Stripe initialization

To initialize Stripe in your React Native app, either wrap your payment screen with the `StripeProvider` component, or use the `initStripe` initialization method. Only the API [publishable key](https://docs.stripe.com/keys.md#obtain-api-keys) in `publishableKey` is required. The following example shows how to initialize Stripe using the `StripeProvider` component.

```javascript
import { StripeProvider } from '@stripe/stripe-react-native';

function App() {
  const [publishableKey, setPublishableKey] = useState('');

  const fetchPublishableKey = async () => {
    const key = await fetchKey(); // fetch key from your server here
    setPublishableKey(key);
  };

  useEffect(() => {
    fetchPublishableKey();
  }, []);

  return (
    <StripeProvider
      publishableKey={publishableKey}
      merchantIdentifier="merchant.identifier" // required for Apple Pay
      urlScheme="your-url-scheme" // required for 3D Secure and bank redirects
    >
      // Your app code here
    </StripeProvider>
  );
}
```

Use your API [test keys](https://docs.stripe.com/keys.md#obtain-api-keys) while you test and develop, and your [live mode](https://docs.stripe.com/keys.md#test-live-modes) keys when you publish your app.

## Enable payment methods

## Set up a return URL

When a customer exits your app, for example to authenticate in Safari or their banking app, provide a way for them to automatically return to your app afterward. Many payment method types **require** a return URL, so if you fail to provide it, we can’t present those payment methods to your user, even if you’ve enabled them.

To provide a return URL:

1. [Register](https://developer.apple.com/documentation/xcode/defining-a-custom-url-scheme-for-your-app#Register-your-URL-scheme) a custom URL. Universal links aren’t supported.
1. [Configure](https://reactnative.dev/docs/linking) your custom URL.
1. Set up your root component to forward the URL to the Stripe SDK as shown below.

If you’re using Expo, [set your scheme](https://docs.expo.io/guides/linking/#in-a-standalone-app) in the `app.json` file.

```jsx
import React, { useEffect, useCallback } from 'react';
import { Linking } from 'react-native';
import { useStripe } from '@stripe/stripe-react-native';

export default function MyApp() {
  const { handleURLCallback } = useStripe();

  const handleDeepLink = useCallback(
    async (url: string | null) => {
      if (url) {
        const stripeHandled = await handleURLCallback(url);
        if (stripeHandled) {
          // This was a Stripe URL - you can return or add extra handling here as you see fit
        } else {
          // This was NOT a Stripe URL – handle as you normally would
        }
      }
    },
    [handleURLCallback]
  );

  useEffect(() => {
    const getUrlAsync = async () => {
      const initialUrl = await Linking.getInitialURL();
      handleDeepLink(initialUrl);
    };

    getUrlAsync();

    const deepLinkListener = Linking.addEventListener(
      'url',
      (event: { url: string }) => {
        handleDeepLink(event.url);
      }
    );

    return () => deepLinkListener.remove();
  }, [handleDeepLink]);

  return (
    <View>
      <AwesomeAppComponent />
    </View>
  );
}
```

For more information on native URL schemes, refer to the [Android](https://developer.android.com/training/app-links/deep-linking) and [iOS](https://developer.apple.com/documentation/xcode/allowing_apps_and_websites_to_link_to_your_content/defining_a_custom_url_scheme_for_your_app) docs.

## Collect payment details

The integration can use the default payment flow or a custom flow.

| Default                                                       | Custom flow                                                    |
| ------------------------------------------------------------- | -------------------------------------------------------------- |
| ![PaymentSheet](images/mobile/payment-sheet/ios-overview.png) | ![Custom flow](images/mobile/payment-sheet/ios-multi-step.png) |

### Initialize PaymentSheet

When you’re ready to , initialize the PaymentSheet with an `intentConfiguration`. The `intentConfiguration` object contains details about the specific , and a `confirmHandler` callback.

```jsx
import { useStripe } from '@stripe/stripe-react-native';
import {View, Button} from 'react-native';

export default function CheckoutScreen() {
  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  const initializePaymentSheet = async () => {
    const { error } = await initPaymentSheet({
      merchantDisplayName: "Example, Inc.",
      intentConfiguration: {
        mode: {
        },
        confirmHandler: confirmHandler
      }
    });
    if (error) {
      // handle error
    }
  };

  useEffect(() => {
    initializePaymentSheet();
  }, []);

  const confirmHandler = async (paymentMethod, shouldSavePaymentMethod, intentCreationCallback) => {
    // explained later
  }

  const didTapCheckoutButton = async () => {
    // implement later
  }
  return (
    <View>
      <Button
        title="Checkout"
        onPress={didTapCheckoutButton}
      />
    </View>
  );
}
```

### Present PaymentSheet

```jsx
export default function CheckoutScreen() {
  // ...
  const didTapCheckoutButton = async () => {
    const { error } = await presentPaymentSheet();

    if (error) {
      if (error.code === PaymentSheetError.Canceled) {
        // Customer canceled - you should probably do nothing.
      } else {
        // PaymentSheet encountered an unrecoverable error. You can display the error to the user, log it, etc.
      }
    } else {
      //  completed - show a confirmation screen.
    }
  }
  // ...
}

```

### Confirm the payment

When the customer taps  in the PaymentSheet, it calls the callback you passed to `initPaymentSheet` with a [PaymentMethod.Result](https://stripe.dev/stripe-react-native/api-reference/interfaces/PaymentMethod.Result.html) object representing the customer’s payment details.

When the request returns, call the `intentCreationCallback` with your server response’s client secret or an error. The PaymentSheet  the  using the client secret.

```jsx
export default function CheckoutScreen() {
  // ...

  const confirmHandler = async (paymentMethod, shouldSavePaymentMethod, intentCreationCallback) => {
    // Make a request to your own server.
    // Call the `intentCreationCallback` with your server response's client secret or error
    const { client_secret, error } = await response.json();
    if (client_secret) {
      intentCreationCallback({clientSecret: client_secret});
    } else {
      intentCreationCallback({error});
    }
  }
  // ...
}
```

This integration assumes that your checkout screen has two buttons: a **Payment Method** button that presents the PaymentSheet to collect payment details, and a .

### Initialize PaymentSheet

When your checkout screen loads, initialize the PaymentSheet with an `intentConfiguration`. The `intentConfiguration` object contains details about the specific , and a `confirmHandler` callback.

First, call `initPaymentSheet` and pass `customFlow: true`. `initPaymentSheet` resolves with an initial payment option containing an image and label representing the customer’s payment method. Update your UI with these details.

```jsx
import { useStripe } from '@stripe/stripe-react-native';
import {View, Button} from 'react-native';

export default function CheckoutScreen() {
  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  const initializePaymentSheet = async () => {
    const { error, paymentOption } = await initPaymentSheet({
      merchantDisplayName: "Example, Inc.",
      customFlow: true,
      intentConfiguration: {
        mode: {
        },
        confirmHandler: handleConfirmation
      }
    });
    if (error) {
      // handle error
    }
    // Update your UI with paymentOption
  };

  useEffect(() => {
    initializePaymentSheet();
  }, []);

  const confirmHandler = async (paymentMethod, shouldSavePaymentMethod, intentCreationCallback) => {
    // explained later
  }
  const didTapCheckoutButton = async () => {
    // implement later
  }
  return (
    <View>
      <Button
        title="Checkout"
        onPress={didTapCheckoutButton}
      />
    </View>
  );
}
```

### Present PaymentSheet

When a customer taps **Payment Method**, call `presentPaymentSheet` to collect payment details. When this completes, update your UI again with the `paymentOption` property.

```javascript
const { error, paymentOption } = await presentPaymentSheet();
// Update your UI with paymentOption
```

### Confirm the payment

When the customer taps , call `confirmPaymentSheetPayment`. It calls the `confirmHandler` callback you passed to `initPaymentSheet` with a [PaymentMethod.Result](https://stripe.dev/stripe-react-native/api-reference/interfaces/PaymentMethod.Result.html) object representing the customer’s payment details.

When the request returns, call the `intentCreationCallback` with your server response’s client secret or an error. The PaymentSheet  the  using the client secret or displays the error in its UI.

```jsx
export default function CheckoutScreen() {
  // ...
  const didTapCheckoutButton = async () => {
    const { error } = await confirmPaymentSheetPayment();

    if (error) {
      // PaymentSheet encountered an unrecoverable error. You can display the error to the user, log it, etc.
    } else {
      //  completed - show a confirmation screen.
    }
  }

  const confirmHandler = async (paymentMethod, shouldSavePaymentMethod, intentCreationCallback) => {
    // Make a request to your own server, passing paymentMethod.id.
    // Your server creates a  and returns its client secret or an error message
    // Call the `intentCreationCallback` with the client secret or error
    const { client_secret, error } = await response.json();
    if (client_secret) {
      intentCreationCallback({clientSecret: client_secret});
    } else {
      intentCreationCallback({error});
    }
  }
  // ...
}

```

The server code is explained in the following step.

## Test the integration

| Card number         | Scenario                                                            | How to test                                                                                           |
| ------------------- | ------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| 4242424242424242    | The card payment succeeds and doesn’t require authentication.       | Fill out the credit card form using the credit card number with any expiration, CVC, and postal code. |
| 4000002500003155    | The card payment requires *authentication*.                         | Fill out the credit card form using the credit card number with any expiration, CVC, and postal code. |
| 4000000000009995    | The card is declined with a decline code like `insufficient_funds`. | Fill out the credit card form using the credit card number with any expiration, CVC, and postal code. |
| 6205500000000000004 | The UnionPay card has a variable length of 13-19 digits.            | Fill out the credit card form using the credit card number with any expiration, CVC, and postal code. |

| Payment method | Scenario                                                                                                                                                                   | How to test                                                                                                                                              |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
|                | Your customer fails to authenticate on the redirect page for a redirect-based and immediate notification payment method.                                                   | Choose any redirect-based payment method, fill out the required details, and confirm the payment. Then click **Fail test payment** on the redirect page. |
| Pay by Bank    | Your customer successfully pays with a redirect-based and [delayed notification](https://docs.stripe.com/payments/payment-methods.md#payment-notification) payment method. | Choose the payment method, fill out the required details, and confirm the payment. Then click **Complete test payment** on the redirect page.            |
| Pay by Bank    | Your customer fails to authenticate on the redirect page for a redirect-based and delayed notification payment method.                                                     | Choose the payment method, fill out the required details, and confirm the payment. Then click **Fail test payment** on the redirect page.                |

| Payment method    | Scenario                                                                                          | How to test                                                                                                                                                                                       |
| ----------------- | ------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| SEPA Direct Debit | Your customer successfully pays with SEPA Direct Debit.                                           | Fill out the form using the account number `AT321904300235473204`. The confirmed PaymentIntent initially transitions to processing, then transitions to the succeeded status three minutes later. |
| SEPA Direct Debit | Your customer’s payment intent status transitions from `processing` to `requires_payment_method`. | Fill out the form using the account number `AT861904300235473202`.                                                                                                                                |

See [Testing](https://docs.stripe.com/testing.md) for additional information to test your integration.

## Enable saved cards

PaymentSheet can display a **Save this card for future use** checkbox that saves the customer’s card, and display the customer’s saved cards. To enable this checkbox, create a [Customer](https://docs.stripe.com/api/customers.md) object on your server and an associated Ephemeral Key.

```javascript
const stripe = require('stripe')('sk_test_your_secret_key');

app.post('/payment-sheet', async (req, res) => {
  // Use an existing Customer ID if this is a returning customer.
  const customer = await stripe.customers.create();
  const ephemeralKey = await stripe.ephemeralKeys.create(
    {customer: customer.id},
    {apiVersion: '2020-08-27'}
  );

  res.json({
    ephemeralKey: ephemeralKey.secret,
    customer: customer.id,
  });
});
```

Next, configure PaymentSheet with the Customer’s ID and the Ephemeral Key’s client secret.

```jsx
const { error } = await initPaymentSheet({
  merchantDisplayName: "Example, Inc.",
  customerId: customer,
  customerEphemeralKeySecret: ephemeralKey,
  ...
});
```

## Allow delayed payment methods

*Delayed payment methods* don’t guarantee that you’ll receive funds from your customer at the end of checkout. That’s because they take time to settle (for example, US Bank Accounts, SEPA Debit, iDEAL, Bancontact, and Sofort) or because they require customer action to complete (for example, OXXO, Konbini, and Boleto).

By default, PaymentSheet doesn’t display delayed payment methods. To display them, when you call `initPaymentSheet`, set `allowsDelayedPaymentMethods` to `true`.

This setting only enables the display of delayed payment methods—it doesn’t activate them. For example, OXXO isn’t supported by PaymentSheet, so `allowsDelayedPaymentMethods` doesn’t allow PaymentSheet to handle OXXO payment methods. It only allows PaymentSheet to display payment methods of the delayed payment types that PaymentSheet supports. If PaymentSheet adds support for OXXO payment methods in the future, it would display them too.

```jsx
const { error } = await initPaymentSheet({
  merchantDisplayName: "Example, Inc.",
  allowsDelayedPaymentMethods: true,
  ...
});
```

If the customer successfully uses one of these delayed payment methods in PaymentSheet, the payment result returned is `.completed`.

## Enable Apple Pay

### Register for an Apple Merchant ID

Obtain an Apple Merchant ID by [registering for a new identifier](https://developer.apple.com/account/resources/identifiers/add/merchant) on the Apple Developer website.

Fill out the form with a description and identifier. Your description is for your own records and you can modify it in the future. Stripe recommends using the name of your app as the identifier (for example, `merchant.com.{{YOUR_APP_NAME}}`).

### Create a new Apple Pay certificate

Create a certificate for your app to encrypt payment data.

Go to the [iOS Certificate Settings](https://dashboard.stripe.com/settings/ios_certificates) in the Dashboard, click **Add new application**, and follow the guide.

Download a Certificate Signing Request (CSR) file to get a secure certificate from Apple that allows you to use Apple Pay.

One CSR file must be used to issue exactly one certificate. If you switch your Apple Merchant ID, you must go to the [iOS Certificate Settings](https://dashboard.stripe.com/settings/ios_certificates) in the Dashboard to obtain a new CSR and certificate.

### Integrate with Xcode

Add the Apple Pay capability to your app. In Xcode, open your project settings, click the **Signing & Capabilities** tab, and add the **Apple Pay** capability. You might be prompted to log in to your developer account at this point. Select the merchant ID you created earlier, and your app is ready to accept Apple Pay.

![](images/mobile/ios/xcode.png)
Enable the Apple Pay capability in Xcode


### Add Apple Pay

When you call `initPaymentSheet`, pass in an [ApplePayParams](https://stripe.dev/stripe-react-native/api-reference/modules/PaymentSheet.html#ApplePayParams) with `merchantCountryCode` set to the [country code of your business](https://dashboard.stripe.com/settings/account).

In accordance with [Apple’s guidelines](https://developer.apple.com/design/human-interface-guidelines/apple-pay#Supporting-subscriptions) for recurring payments, you must also set a `cardItems` that includes a [RecurringCartSummaryItem](https://stripe.dev/stripe-react-native/api-reference/modules/ApplePay.html#RecurringCartSummaryItem) with the amount you intend to charge (for example, “$59.95 a month”).

You can also adopt [merchant tokens](https://developer.apple.com/apple-pay/merchant-tokens/) by setting the `request` with its `type` set to `PaymentRequestType.Recurring`

To learn more about how to use recurring payments with Apple Pay, see [Apple’s PassKit documentation](https://developer.apple.com/documentation/passkit/pkpaymentrequest).

```javascript
const initializePaymentSheet = async () => {
  const recurringSummaryItem = {
    label: 'My Subscription',
    amount: '59.99',
    paymentType: 'Recurring',
    intervalCount: 1,
    intervalUnit: 'month',
    // Payment starts today
    startDate: new Date().getTime() / 1000,

    // Payment ends in one year
    endDate: new Date().getTime() / 1000 + 60 * 60 * 24 * 365,
  };

  const {error} = await initPaymentSheet({
    // ...
    applePay: {
      merchantCountryCode: 'US',
      cartItems: [recurringSummaryItem],
      request: {
        type: PaymentRequestType.Recurring,
        description: 'Recurring',
        managementUrl: 'https://my-backend.example.com/customer-portal',
        billing: recurringSummaryItem,
        billingAgreement:
          "You'll be billed $59.99 every month for the next 12 months. To cancel at any time, go to Account and click 'Cancel Membership.'",
      },
    },
  });
};
```

### Order tracking

To add [order tracking](https://developer.apple.com/design/human-interface-guidelines/technologies/wallet/designing-order-tracking) information in iOS 16 or later, configure a `setOrderTracking` callback function. Stripe calls your implementation after the payment is complete, but before iOS dismisses the Apple Pay sheet.

In your implementation of `setOrderTracking` callback function, fetch the order details from your server for the completed order, and pass the details to the provided `completion` function.

To learn more about order tracking, see [Apple’s Wallet Orders documentation](https://developer.apple.com/documentation/walletorders).

```javascript
await initPaymentSheet({
  // ...
  applePay: {
    // ...
    setOrderTracking: async complete => {
      const apiEndpoint =
        Platform.OS === 'ios'
          ? 'http://localhost:4242'
          : 'http://10.0.2.2:4567';
      const response = await fetch(
        `${apiEndpoint}/retrieve-order?orderId=${orderId}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );
      if (response.status === 200) {
        const orderDetails = await response.json();
        // orderDetails should include orderIdentifier, orderTypeIdentifier,
        // authenticationToken and webServiceUrl
        complete(orderDetails);
      }
    },
  },
});
```

## Enable Google Pay

### Set up your integration

To use Google Pay, first enable the Google Pay API by adding the following to the `<application>` tag of your **AndroidManifest.xml**:

```xml
<application>
  ...
  <meta-data
    android:name="com.google.android.gms.wallet.api.enabled"
    android:value="true" />
</application>
```

This guide assumes you’re using the latest version of the Stripe Android SDK.

```groovy
dependencies {
    implementation 'com.stripe:stripe-android:21.12.0'
}
```

```kotlin
dependencies {
    implementation("com.stripe:stripe-android:21.12.0")
}
```

For more details, see Google Pay’s [Set up Google Pay API](https://developers.google.com/pay/api/android/guides/setup) for Android.

### Add Google Pay

When you initialize `PaymentSheet`, pass a `merchantCountryCode` (check your account details [here](https://dashboard.stripe.com/settings/account)) and set `googlePay` to `true`.

You can also pass the `testEnv` property to use the test environment. Google Pay can only be tested on a physical Android device. Follow the [React Native docs](https://reactnative.dev/docs/running-on-device) to test your application on a physical device.

```javascript
const { error, paymentOption } = await initPaymentSheet({
  // ...
  googlePay: {
    merchantCountryCode: 'US',
    testEnv: true, // use test environment
  },
});
```

## Enable card scanning

To enable card scanning support, set the `NSCameraUsageDescription` (**Privacy - Camera Usage Description**) in the Info.plist of your application, and provide a reason for accessing the camera (for example, “To scan cards”). Devices with iOS 13 or higher support card scanning.

## Customize the sheet

All customization is configured using `initPaymentSheet`.

### Appearance

Customize colors, fonts, and so on to match the look and feel of your app by using the [appearance API](https://docs.stripe.com/elements/appearance-api.md?platform=react-native).

### Merchant display name

Specify a customer-facing business name by setting `merchantDisplayName`. By default, this is your app’s name.

```javascript
await initPaymentSheet({
  // ...
  merchantDisplayName: 'Example Inc.',
});
```

### Dark mode

By default, `PaymentSheet` automatically adapts to the user’s system-wide appearance settings (light and dark mode). You can change this by setting the `style` property to `alwaysLight` or `alwaysDark` mode on iOS.

```javascript
await initPaymentSheet({
  // ...
  style: 'alwaysDark',
});
```

On Android, set light or dark mode on your app:

```
// force dark
AppCompatDelegate.setDefaultNightMode(AppCompatDelegate.MODE_NIGHT_YES)
// force light
AppCompatDelegate.setDefaultNightMode(AppCompatDelegate.MODE_NIGHT_NO)
```