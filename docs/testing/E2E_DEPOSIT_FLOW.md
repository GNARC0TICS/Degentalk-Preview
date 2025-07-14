# E2E Testing: Deposit-to-DGT Flow

This document outlines the procedure for running the end-to-end (E2E) test for the core user deposit flow. This test simulates a real user depositing cryptocurrency and verifies that it is correctly processed and converted into the platform's native token (DGT).

Running this test is critical after making any changes to the wallet system, CCPayment integration, or webhook handlers.

## Purpose

The test verifies the following critical components:

1.  **CCPayment API Integration**: Confirms that our application can correctly generate deposit addresses using the v2 API.
2.  **Webhook Handling**: Ensures our server can receive, validate, and process incoming webhooks from CCPayment.
3.  **Dual-Ledger Logic**: Verifies that a successful crypto deposit correctly triggers the crediting of DGT to the user's internal wallet.

## Prerequisites

1.  **Running Application**: The entire Degentalk application must be running in development mode. You can typically start this with:
    ```bash
    pnpm run dev
    ```

2.  **Testnet Credentials**: Your `env.development.local` file at the root of the project must contain the correct **testnet** credentials from your CCPayment dashboard.
    ```env
    CCPAYMENT_APP_ID="YOUR_TESTNET_APP_ID"
    CCPAYMENT_APP_SECRET="YOUR_TESTNET_APP_SECRET"
    ```

3.  **Webhook Tunnel (if running locally)**: CCPayment's servers need to be able to send a webhook to your local machine. You must have a tunnel service like `ngrok` running and configured. The public URL from ngrok should be set as the Webhook URL in your CCPayment developer dashboard.

4.  **Testnet ETH**: You will need a small amount of Sepolia ETH in a personal wallet (e.g., MetaMask) to send to the deposit address. You can acquire this from a public faucet like [https://sepolia-faucet.pk910.de/](https://sepolia-faucet.pk910.de/).

## Execution Steps

Once all prerequisites are met, follow these steps:

1.  Open a new terminal in the root directory of the project.

2.  Run the interactive test script using the following command:
    ```bash
    pnpm tsx scripts/dev/test-deposit-flow.ts
    ```

3.  The script will first prompt you to **select a test user** from your local database. Choose any user.

4.  It will then generate a unique **ETH Sepolia deposit address** for that user and display it in the console.

5.  Using your personal crypto wallet (e.g., MetaMask), **send a small amount of Sepolia ETH** (e.g., 0.001) to the generated address.

6.  Wait for the transaction to be confirmed on the blockchain. You can use a block explorer like [https://sepolia.etherscan.io/](https://sepolia.etherscan.io/) to check the status.

7.  Once the transaction is confirmed, return to the terminal and **press Enter** to confirm you have sent the funds.

8.  The script will now monitor the user's DGT balance, polling every 10 seconds.

## Interpreting the Results

*   **Success**: If the flow is working correctly, you will see the user's DGT balance increase. The script will print a success message with the initial and final balances.

*   **Failure**: If the DGT balance does not increase after 5 minutes, the script will time out and print a failure message. This indicates a problem in the pipeline, most likely with webhook delivery or processing. Check the server logs for errors.
